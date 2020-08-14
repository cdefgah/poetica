import { QuestionDataModel } from 'src/app/data-model/QuestionDataModel';
import { AbstractMultiLineDataImporter } from 'src/app/utils/AbstractMultilineDataImporter';
import { QuestionValidationService } from 'src/app/components/core/validators/QuestionValidationService';
import { StringBuilder } from 'src/app/utils/StringBuilder';
import { QuestionsListImporterComponent } from '../questions-list-importer.component';
import { debugString } from 'src/app/utils/Config';

export class QuestionsImporter extends AbstractMultiLineDataImporter {

  questions: QuestionDataModel[];

  private allThingsOk: boolean;

  private expectedQuestionNumber: number;

  private questionModelValidatorService: QuestionValidationService;

  /**
   * Возвращает true, если строка начинается с контрольного префикса #.
   * @param sourceStringLine строка к проверке.
   * @returns true если строка начинается с контрольного префикса #.
   */
  private static hasControlPrefix(sourceStringLine: string): boolean {
    return sourceStringLine.startsWith('#');
  }

  private static isAuthorsAnswerLine(sourceStringLine: string): boolean {
    const prefix = '#R:';
    return QuestionsImporter.startsWithIgnoringCase(sourceStringLine, prefix);
  }

  private static isQuestionCommentNoteLine(sourceStringLine: string): boolean {
    const prefix = '#N:';
    return QuestionsImporter.startsWithIgnoringCase(sourceStringLine, prefix);
  }

  private static isQuestionSourceLine(sourceStringLine: string): boolean {
    const prefix = '#S:';
    return QuestionsImporter.startsWithIgnoringCase(sourceStringLine, prefix);
  }

  private static isAuthorsInfoSourceLine(sourceStringLine: string): boolean {
    const englishLetterPrefix = '#A:';
    const russianLetterPrefix = '#А:';
    return QuestionsImporter.startsWithIgnoringCase(sourceStringLine, englishLetterPrefix) ||
      QuestionsImporter.startsWithIgnoringCase(sourceStringLine, russianLetterPrefix);
  }

  constructor(
    importerComponentReference: QuestionsListImporterComponent,
    sourceText: string,
    questionModelValidatorService: QuestionValidationService,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(sourceText, onSuccess, onFailure);
    this.questionModelValidatorService = questionModelValidatorService;
    this.parentComponentObject = importerComponentReference;
  }

  public doImport() {
    this.allThingsOk = true;
    this.questions = [];
    this.expectedQuestionNumber = -1;

    let keepLoadingQuestions = true;
    while (keepLoadingQuestions) {
      // создаём объект вопроса
      const question: QuestionDataModel = QuestionDataModel.createQuestion();
      if (this.loadQuestion(question)) {
        // если вопрос удалось загрузить, добавляем его в список
        this.questions.push(question);
      } else {
        // иначе - выходим из цикла
        keepLoadingQuestions = false;
      }
    }

    if (this.allThingsOk) {
      this.onSuccess(this.parentComponentObject, this.questions);
    }
  }

  private loadQuestion(question: QuestionDataModel): boolean {
    if (!this.sourceTextLinesIterator.hasNextLine()) {
      return false;
    }

    const firstQuestionLine: string = this.sourceTextLinesIterator.nextLine();

    // разбираем первую строку сегмента вопроса и инициализируем свойства объекта
    if (!this.parseFirstQuestionLine(firstQuestionLine, question)) {
      return false;
    }

    // загружаем содержимое вопроса
    question.body = this.loadSegmentText('');

    // после сегмента с содержимым вопроса ожидаем сегмент с авторским ответом
    if (!this.validateAuthorsAnswerSegmentPresence(question)) {
      return false;
    }

    const authorsAnswerFirstLine: string = this.removeSegmentPrefix(this.sourceTextLinesIterator.nextLine());
    question.authorsAnswer = this.loadSegmentText(authorsAnswerFirstLine);

    // проверяем наличие необязательного сегмента с комментарием
    if (this.validateCommentsSegmentPresence()) {
      // если комментарий есть, загружаем его
      const firstCommentsLine: string = this.removeSegmentPrefix(this.sourceTextLinesIterator.nextLine());
      question.comment = this.loadSegmentText(firstCommentsLine);
    }

    // тут проверяем наличие сегмента с информацией об источнике
    if (!this.validateSourceSegmentPresence(question)) {
      return false;
    }

    const questionSource = this.removeSegmentPrefix(this.sourceTextLinesIterator.nextLine());
    question.source = this.loadSegmentText(questionSource);

    // проверяем наличие информации об авторе бескрылки
    if (!this.validateAuthorInfoSegmentPresence(question)) {
      return false;
    }

    const firstAuthorsInfoLine = this.removeSegmentPrefix(this.sourceTextLinesIterator.nextLine());
    question.authorInfo = this.loadSegmentText(firstAuthorsInfoLine);

    return true;
  }

  private removeSegmentPrefix(stringWithSegmentPrefix: string): string {
    const segmentPrefixLength = 3;
    return stringWithSegmentPrefix.substring(segmentPrefixLength);
  }

  private validateAuthorsAnswerSegmentPresence(question: QuestionDataModel): boolean {
    const firstPartOfErrorMessage = `После блока с текстом задания номер ${question.externalNumber} ожидался блок с информацией об авторском ответе для этого задания.`;

    if (!this.sourceTextLinesIterator.hasNextLine()) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но текст внезапно кончился. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    const authorsAnswerFirstLine: string = this.sourceTextLinesIterator.nextLine(false);
    if (!QuestionsImporter.isAuthorsAnswerLine(authorsAnswerFirstLine)) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но вы передаёте строку ${authorsAnswerFirstLine}. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    // всё в порядке
    return true;
  }

  private validateCommentsSegmentPresence(): boolean {
    if (this.sourceTextLinesIterator.hasNextLine()) {
      const commentsLine = this.sourceTextLinesIterator.nextLine(false);
      return QuestionsImporter.isQuestionCommentNoteLine(commentsLine);
    } else {
      return false;
    }
  }

  private validateSourceSegmentPresence(question: QuestionDataModel): boolean {
    const firstPartOfErrorMessage = `Для задания номер ${question.externalNumber} ожидался блок с информацией об источнике для этого задания.`;

    if (!this.sourceTextLinesIterator.hasNextLine()) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но текст внезапно кончился. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    const sourceFirstLine: string = this.sourceTextLinesIterator.nextLine(false);
    if (!QuestionsImporter.isQuestionSourceLine(sourceFirstLine)) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но вы передаёте строку ${sourceFirstLine}. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    // всё в порядке
    return true;
  }

  private validateAuthorInfoSegmentPresence(question: QuestionDataModel): boolean {
    const firstPartOfErrorMessage = `Для задания номер ${question.externalNumber} ожидался блок с информацией об авторе этого задания.`;

    if (!this.sourceTextLinesIterator.hasNextLine()) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но текст внезапно кончился. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    const authorsInfoFirstLine: string = this.sourceTextLinesIterator.nextLine(false);
    if (!QuestionsImporter.isAuthorsInfoSourceLine(authorsInfoFirstLine)) {
      this.allThingsOk = false;
      this.onFailure(
        this.parentComponentObject,
        `${firstPartOfErrorMessage} Но вы передаёте строку ${authorsInfoFirstLine}. ${QuestionsImporter.rtfmMessage}`
      );
      return false;
    }

    // всё в порядке
    return true;
  }

  /**
   * Загружает тело того или иного сегмента до строки с control prefix.
   * @param firstSegmentLine первая строка загружаемого сегмента.
   * @returns текст с телом сегмента.
   */
  private loadSegmentText(firstSegmentLine: string): string {
    const stringBuilder: StringBuilder = new StringBuilder();

    if (firstSegmentLine && firstSegmentLine.length > 0) {
      stringBuilder.addString(firstSegmentLine);
    }

    while (this.sourceTextLinesIterator.hasNextLine()) {
      const processingLine: string = this.sourceTextLinesIterator.nextLine();

      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        // если взяли строку с control prefix, откатываемся назад на одну строку
        this.sourceTextLinesIterator.rewindIndexOneStepBack();
        // и прекращаем цикл
        break;
      }

      stringBuilder.addString(processingLine);
    }

    return stringBuilder.toString();
  }

  /**
   * Извлекает номер задания из строки.
   * @param sourceStringLine строка для обработки.
   * @param currentQuestionObject объект класса QuestionDataModel для записи результатов парсинга.
   * @returns блок данных с информацией о номере, зачётности задания, и заголовок задания.
   */
  private parseFirstQuestionLine(sourceStringLine: string, currentQuestionObject: QuestionDataModel): boolean {
    if (!QuestionsImporter.hasControlPrefix(sourceStringLine)) {
      this.allThingsOk = false;
      this.onFailure(this.parentComponentObject, `Первым символом строки ожидался символ #. Строка: ${sourceStringLine}`);
      return false;
    }

    const colonSymbolPosition: number = sourceStringLine.indexOf(':');

    if (colonSymbolPosition == -1) {
      this.allThingsOk = false;
      this.onFailure(this.parentComponentObject, `В начале строки должен быть символ двоеточия. Строка: ${sourceStringLine}`);
      return false;
    }

    currentQuestionObject.graded = true;

    let numberBodyString: string = sourceStringLine.substring(1, colonSymbolPosition).trim();

    const openingParenPosition = numberBodyString.indexOf('(');
    if (openingParenPosition !== -1) {
      // внезачётное задание
      currentQuestionObject.graded = false;

      const closingParenPosition = numberBodyString.indexOf(')', openingParenPosition);

      if (closingParenPosition === -1) {
        this.allThingsOk = false;
        this.onFailure(this.parentComponentObject,
          `В строке представлена открывающая скобка, но нет закрывающей для неё. Строка: ${sourceStringLine}`
        );
        return false;
      }

      numberBodyString = numberBodyString.substring(openingParenPosition + 1, closingParenPosition);
    }

    if (!this.parseQuestionNumber(numberBodyString, currentQuestionObject, sourceStringLine)) {
      return false;
    }

    currentQuestionObject.title = sourceStringLine.substring(colonSymbolPosition + 1).trim();

    return true;
  }

  private parseQuestionNumber(numberBodyString: string, currentQuestionObject: QuestionDataModel, sourceStringLine: string): boolean {

    currentQuestionObject.externalNumber = numberBodyString;

    if (numberBodyString.indexOf('-') === -1) {
      // одиночный номер
      if (!this.parseSingleNumber(numberBodyString, currentQuestionObject, sourceStringLine)) {
        return false;
      }
    } else {
      // составной номер
      if (!this.parseCompoundNumber(numberBodyString, currentQuestionObject, sourceStringLine)) {
        return false;
      }
    }

    if (this.expectedQuestionNumber !== -1) {
      // если это не первый вопрос, проверяем порядок следования номеров заданий
      if (currentQuestionObject.lowestInternalNumber !== this.expectedQuestionNumber) {
        this.allThingsOk = false;
        this.onFailure(
          this.parentComponentObject,
          `Номера заданий должны идти в порядке возрастания друг за другом. Но это правило нарушено на строке: ${sourceStringLine}`
        );
        return false;
      }
    }

    this.expectedQuestionNumber = currentQuestionObject.highestInternalNumber + 1;

    return true;
  }

  private parseSingleNumber(numberBodyString: string, currentQuestionObject: QuestionDataModel, sourceStringLine: string): boolean {
    // валидация номера
    if (!QuestionsImporter.isZeroOrPositiveInteger(numberBodyString)) {
      this.allThingsOk = false;
      this.onFailure(this.parentComponentObject,
        `Номер задания может быть либо нулём, либо положительным целым числом. Строка: ${sourceStringLine}`
      );
      return false;
    }

    currentQuestionObject.lowestInternalNumber = QuestionsImporter.parseInt(numberBodyString);
    currentQuestionObject.highestInternalNumber = currentQuestionObject.lowestInternalNumber;

    return true;
  }

  private parseCompoundNumber(numberBodyString: string, currentQuestionObject: QuestionDataModel, sourceStringLine: string): boolean {
    const internalNumberParts: string[] = numberBodyString.split('-');
    let expectedInternalNumber = -1;

    for (const oneInternalNumberString of internalNumberParts) {
      // валидация числового формата номера
      const normalizedOneInternalNumberString: string = oneInternalNumberString.trim();
      if (!QuestionsImporter.isZeroOrPositiveInteger(normalizedOneInternalNumberString)) {
        this.allThingsOk = false;
        this.onFailure(
          this.parentComponentObject,
          `Номер задания может быть либо нулём, либо положительным целым числом. Но вы передали значение ${oneInternalNumberString} в составном номере ${numberBodyString}. Строка: ${sourceStringLine}`
        );
        return false;
      }

      const oneInternalNumber: number = QuestionsImporter.parseInt(normalizedOneInternalNumberString);
      if (expectedInternalNumber !== -1) {
        // если это не первая итерация цикла, то проверяем, чтобы номера в составном номере шли по возрастанию,
        // например: 4-5-6 для трёхкрылок
        if (oneInternalNumber !== expectedInternalNumber) {
          this.allThingsOk = false;
          this.onFailure(this.parentComponentObject,
            `Внутри составного номера номера должны идти друг за другом по возрастанию. Это правило не соблюдается для составного номера ${numberBodyString}. Строка: ${sourceStringLine}`
          );
          return false;
        }
      }

      // формируем следующий ожидаемый номер внутри составного номера
      expectedInternalNumber = oneInternalNumber + 1;
    }

    currentQuestionObject.lowestInternalNumber = QuestionsImporter.parseInt(internalNumberParts[0]);
    currentQuestionObject.highestInternalNumber = QuestionsImporter.parseInt(internalNumberParts[internalNumberParts.length - 1]);

    return true;
  }
}
