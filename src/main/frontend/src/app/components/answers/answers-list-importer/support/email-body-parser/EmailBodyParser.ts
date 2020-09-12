/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractMultiLineDataImporter } from 'src/app/utils/AbstractMultilineDataImporter';
import { EmailBodyParserParameters } from './EmailBodyParserParameters';
import { HttpClient } from '@angular/common/http';
import { EmailValidationService } from 'src/app/components/core/validators/EmailValidationService';
import { AnswerValidationService } from 'src/app/components/core/validators/AnswerValidationService';
import { CalculationResult } from '../CalculationResult';
import { StringBuilder } from '../../../../../utils/StringBuilder';
import { EmailBodyParsingResult } from './EmailBodyParsingResult';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { AnswerDataModel } from 'src/app/data-model/AnswerDataModel';
import { debugString } from 'src/app/utils/Config';

export class EmailBodyParser extends AbstractMultiLineDataImporter {
  private static readonly answersBlockPrefix: string = '***';

  private team: TeamDataModel;

  private emailValidationService: EmailValidationService;
  private answerValidationService: AnswerValidationService;

  private teamFromEmailSubject: TeamDataModel;
  private roundNumber: string;

  private httpClient: HttpClient;

  constructor(
    parameters: EmailBodyParserParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(parameters.emailBody, onSuccess, onFailure);
    this.parentComponentObject = parameters.parentComponentObject;
    this.emailValidationService = parameters.emailValidationService;
    this.answerValidationService = parameters.answerValidationService;
    this.httpClient = parameters.httpClient;
  }

  public parse(): void {
    const emailBodyValidationResult: string = this.emailValidationService.validateEmailBody(this.normalizedSourceString);
    if (emailBodyValidationResult.length > 0) {
      this.onFailure(this.parentComponentObject, emailBodyValidationResult);
      return;
    }

    const firstLineOfAnswersBlockCalcResult: CalculationResult = this.getTheFirstLineOfAnswersBlock();
    if (firstLineOfAnswersBlockCalcResult.errorsPresent) {
      this.onFailure(
        this.parentComponentObject,
        firstLineOfAnswersBlockCalcResult.errorMessage
      );
      return;
    }

    const firstLineFromAnswersBlock: string = firstLineOfAnswersBlockCalcResult.resultObject;
    const teamInfoCalculationResult = this.getTeamFromTheFirstLineOfTheAnswersBlock(firstLineFromAnswersBlock);

    if (teamInfoCalculationResult.errorsPresent) {
      this.onFailure(
        this.parentComponentObject,
        teamInfoCalculationResult.errorMessage
      );
      return;
    } else {
      this.team = teamInfoCalculationResult.resultObject;

      if (this.teamFromEmailSubject) {
        if (this.teamFromEmailSubject.number !== this.team.number) {
          this.onFailure(
            this.parentComponentObject,
            `Номер команды в содержимом письма ${this.team.number} отличается от номера команды в теме письма: ${this.teamFromEmailSubject.number}`
          );
          return;
        }
      }
    }

    // тут пропускаем строки до начала блока ответов, а то иногда в письмах бывает, в нарушение регламента
    // пишут разные пожелания и обращения.
    this.skipLinesUntilAnswersBlockStart();

    // загружаем ответы
    const parsingResult: CalculationResult = this.parseAnswersBlock();
    if (parsingResult.errorsPresent) {
      this.onFailure(this.parentComponentObject, parsingResult.errorMessage);
      return;
    }

    // и в финале всего запускаем проверку корректности данных на основе ответа сервера
    this.doValidationWithServerData(this, parsingResult.resultObject);
  }

  // TODO переделать этот callback-hell на async-await
  private doValidationWithServerData(
    parserObjectReference: EmailBodyParser,
    loadedAnswers: AnswerDataModel[]
  ) {
    debugString('Validating team title...');
    // сперва проверяем корректность названия команды из письма
    const teamNumber: number = parserObjectReference.team.number;
    debugString(`teamNumber: ${teamNumber}`);

    const teamValidationUrl = `/teams/numbers/${teamNumber}`;
    debugString(`teamValidationUrl: ${teamValidationUrl}`);

    const importingTeamTitle = parserObjectReference.team.title;
    parserObjectReference.httpClient.get(teamValidationUrl).subscribe(
      (data: Map<string, any>) => {
        const teamObjectfromTheServer: TeamDataModel = TeamDataModel.createTeamFromMap(
          data
        );
        const loadedTeamTitle: string = teamObjectfromTheServer.title;
        if (
          loadedTeamTitle.toLowerCase() !== importingTeamTitle.toLowerCase()
        ) {
          parserObjectReference.onFailure(
            parserObjectReference.parentComponentObject,
            `В базе данных команда с номером: ${teamNumber} записана как '${loadedTeamTitle}'.
            А в письме передано название команды: '${importingTeamTitle}'`
          );
          return;
        } else {
          // название команды в письме и в базе совпало

          // теперь прописываем полученный идентификатор команды в соответствующий объект
          parserObjectReference.team.id = teamObjectfromTheServer.id;

          // получаем максимальный номер загружаемого ответа
          const maxQuestionNumberInAnswers: number = loadedAnswers[loadedAnswers.length - 1].questionNumber;

          // теперь проверяем корректность максимального номера в ответах
          const maxQuestionNumberValidationUrl = '/questions/max-number';
          parserObjectReference.httpClient
            .get(maxQuestionNumberValidationUrl)
            .subscribe(
              (maxNumberOfRegisteredQuestion: number) => {
                if (
                  maxNumberOfRegisteredQuestion < maxQuestionNumberInAnswers
                ) {
                  parserObjectReference.onFailure(
                    parserObjectReference.parentComponentObject,
                    `Максимальный номер задания, зарегистрированного в базе данных равен: ${maxNumberOfRegisteredQuestion}.
                Но среди импортируемых ответов представлен ответ на задание с номером: ${maxQuestionNumberInAnswers}`
                  );
                  return;
                } else {
                  // все проверки пройдены, ура!
                  const emailBodyParsingResult: EmailBodyParsingResult = new EmailBodyParsingResult(
                    parserObjectReference.team,
                    loadedAnswers
                  );

                  parserObjectReference.onSuccess(
                    parserObjectReference.parentComponentObject,
                    emailBodyParsingResult
                  );
                  return;
                }
              },
              (error) => {
                parserObjectReference.onFailure(
                  parserObjectReference.parentComponentObject,
                  `Не удалось получить информацию из базы данных о максимальном номере загруженного задания.
                Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`
                );
                return;
              }
            );
        }
      },
      (error) => {
        const NOT_FOUND_STATUS = 404;
        let errorMessage: string;
        if (error.status === NOT_FOUND_STATUS) {
          errorMessage = `Не удалось найти в базе данных команду с номером: ${teamNumber}`;
        } else {
          errorMessage = `Не удалось получить информацию из базы данных о команде с номером: ${teamNumber}.
            Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`;
        }

        parserObjectReference.onFailure(
          parserObjectReference.parentComponentObject,
          errorMessage
        );
        return;
      }
    );
  }

  private skipLinesUntilAnswersBlockStart(): void {
    while (this.sourceTextLinesIterator.hasNextLine()) {
      const processingLine = this.sourceTextLinesIterator.nextLine();
      if (processingLine.startsWith('#')) {
        this.sourceTextLinesIterator.rewindIndexOneStepBack();
        break;
      }
    }
  }

  /**
   * Проматывает указатель итератора на начало блока ответов
   * и возвращает её.
   * @returns первая строка блока ответов, из которой исключён префикс в три звёздочки.
   */
  private getTheFirstLineOfAnswersBlock(): CalculationResult {
    while (this.sourceTextLinesIterator.hasNextLine()) {
      const oneLine = this.sourceTextLinesIterator.nextLine();
      if (oneLine.startsWith(EmailBodyParser.answersBlockPrefix)) {
        return new CalculationResult(
          oneLine.substring(EmailBodyParser.answersBlockPrefix.length).trim(),
          null
        );
      }
    }

    return new CalculationResult(
      null,
      'В теле письма не обнаружен признак начала блока ответов.'
    );
  }

  private getTeamFromTheFirstLineOfTheAnswersBlock(
    firstLine: string
  ): CalculationResult {
    let foundTeamTitle = '';
    let foundTeamNumberString = '';
    let foundTeamNumber: number;
    let errorMessage = '';

    if (firstLine.indexOf(',') !== -1) {
      const firstLineParts = firstLine.split(',');
      foundTeamTitle = firstLineParts[0].trim();
      foundTeamNumberString = firstLineParts[1].trim();

      if (!EmailBodyParser.isZeroOrPositiveInteger(foundTeamNumberString)) {
        errorMessage = `Номер команды может быть либо нулём, либо положительным целым значением. Но в письме передан номер: ${foundTeamNumberString}`;
        return new CalculationResult(null, errorMessage);
      } else {
        foundTeamNumber = EmailBodyParser.parseInt(foundTeamNumberString);
      }
    } else {
      errorMessage = `Нарушение формата для первой строки блока ответов. Нет запятой, отделяющей номер команды от её названия "${firstLine}"`;
      return new CalculationResult(null, errorMessage);
    }

    foundTeamTitle = EmailBodyParser.removeDoubleQuotations(foundTeamTitle);
    if (foundTeamTitle.length === 0) {
      errorMessage = 'В содержании письма не указано название команды';
      return new CalculationResult(null, errorMessage);
    }

    if (this.teamFromEmailSubject) {
      // совпадение названия команды из темы письма с названием в содержании - не проверяем.
      // так как в теме письма может быть транслит, а в содержании - кириллица.
      // проверяем только номер.
      if (foundTeamNumber !== this.teamFromEmailSubject.number) {
        errorMessage = `Номер команды в теме письма: ${this.teamFromEmailSubject.number} не совпадает с номером команды в содержании письма: ${foundTeamNumber}`;
        return new CalculationResult(null, errorMessage);
      }
    }

    const team: TeamDataModel = TeamDataModel.createTeamByNumberAndTitle(foundTeamNumber, foundTeamTitle);
    return new CalculationResult(team, null);
  }

  private parseAnswersBlock(): CalculationResult {
    const answers: AnswerDataModel[] = [];

    const wholeAnswer: StringBuilder = new StringBuilder();
    const wholeComment: StringBuilder = new StringBuilder();

    const commentPrefix = '%';
    let questionNumber = '';
    let commentPrefixLocation: number;
    const processedQuestionNumbers = new Set();
    let continueProcessingLines = true;
    let answerRegistrationResult: CalculationResult;

    while (
      this.sourceTextLinesIterator.hasNextLine() &&
      continueProcessingLines
    ) {
      const currentLine = this.sourceTextLinesIterator.nextLine();

      if (currentLine.startsWith('#')) {
        // если строка начинается с символа, который знаменует начало ответа
        // сохраняем ранее сформированный ответ и комментарий к нему
        if (questionNumber.length > 0) {
          answerRegistrationResult = registerAnswer(this);
          if (answerRegistrationResult.errorsPresent) {
            return answerRegistrationResult;
          }
        }

        const dotLocation: number = currentLine.indexOf('.');
        if (dotLocation !== -1) {
          questionNumber = currentLine.substring(1, dotLocation).trim();
          if (!EmailBodyParser.isZeroOrPositiveInteger(questionNumber)) {
            return new CalculationResult(
              null,
              `Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки. Номер бескрылки может быть нулём либо положительным целым числом, а вместо это вот это: '${questionNumber}'`
            );
          }

          let firstLineOfTheAnswer: string = currentLine.substring(dotLocation + 1).trim();

          let firstLineOfTheComment: string;
          commentPrefixLocation = firstLineOfTheAnswer.indexOf(commentPrefix);
          if (commentPrefixLocation !== -1) {
            // комментарий в первой строке представлен
            firstLineOfTheComment = firstLineOfTheAnswer.substring(commentPrefixLocation + 1).trim();
            firstLineOfTheAnswer = firstLineOfTheAnswer.substring(0, commentPrefixLocation).trim();

            wholeComment.addString(firstLineOfTheComment);
          }

          wholeAnswer.addString(firstLineOfTheAnswer);
        } else {
          return new CalculationResult(
            null,
            `Неверный формат блока ответов. Нет ожидаемой точки при наличии символа # в строке: '${currentLine}'`
          );
        }
      } else {
        if (!currentLine.startsWith('***')) {
          // если строка НЕ начинается с символа, который знаменует начало ответа

          commentPrefixLocation = currentLine.indexOf(commentPrefix);

          if (commentPrefixLocation !== -1) {
            // в обрабатываемой строке есть комментарий
            const onlyAnswerPart: string = currentLine.substring(0, commentPrefixLocation).trim();
            wholeAnswer.addString(onlyAnswerPart);

            const onlyCommentPart: string = currentLine.substring(commentPrefixLocation + 1).trim();

            wholeComment.addString(onlyCommentPart);
          } else {
            // в обрабатываемой строке нет комментария
            wholeAnswer.addString(currentLine);
          }
        } else {
          // встретился знак конца блока ответов
          continueProcessingLines = false;
        }
      }
    }

    if (questionNumber.length > 0) {
      answerRegistrationResult = registerAnswer(this);
      if (answerRegistrationResult.errorsPresent) {
        return answerRegistrationResult;
      }
    }

    if (answers.length === 0) {
      return new CalculationResult(
        null,
        'В содержании письма не представлено ни одного ответа.'
      );
    }

    // возвращаем список ответов
    return new CalculationResult(answers, '');

    // ================================ Локальные функции ==============================
    /**
     * Регистрирует ответ.
     * @param currentObjectReference ссылка на текущий объект парсера.
     */
    function registerAnswer(
      currentObjectReference: EmailBodyParser
    ): CalculationResult {
      if (processedQuestionNumbers.has(questionNumber)) {
        return new CalculationResult(
          null,
          `Повторяющийся номер бескрылки в блоке ответов: ${questionNumber}`
        );
      }

      processedQuestionNumbers.add(questionNumber);

      let answerRecord: AnswerDataModel = AnswerDataModel.emptyAnswer;

      // в ответе может быть просто номер с точкой
      // но не быть ответа (placeholder для читабельности),
      // в таком случае пустой ответ не регистрируем а пропускаем
      if (wholeAnswer.length() > 0) {
        const answerBody: string = wholeAnswer.toString();
        const answerBodyValidationMessage: string = currentObjectReference.answerValidationService.
          validateAnswerBody(answerBody, questionNumber);

        if (answerBodyValidationMessage.length > 0) {
          return new CalculationResult(null, answerBodyValidationMessage);
        }

        const answerComment: string = wholeComment.toString();
        const answerCommentValidationMessage: string = currentObjectReference.answerValidationService.
          validateAnswerComment(answerComment, questionNumber);

        if (answerCommentValidationMessage.length > 0) {
          return new CalculationResult(null, answerCommentValidationMessage);
        }

        answerRecord = new AnswerDataModel(EmailBodyParser.parseInt(questionNumber), answerBody, answerComment);

        if (
          currentObjectReference.roundNumber &&
          currentObjectReference.roundNumber.length > 0
        ) {
          answerRecord.roundNumber = EmailBodyParser.parseInt(currentObjectReference.roundNumber);
        }

        answers.push(answerRecord);
      }

      questionNumber = '';
      wholeAnswer.reset();
      wholeComment.reset();

      return new CalculationResult(answerRecord, '');
    }
    // =====================================================================================================
  }
}
