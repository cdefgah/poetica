import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatRadioChange } from '@angular/material';
import { QuestionDataModel } from 'src/app/data-model/QuestionDataModel';
import { QuestionViewModelForTableRow } from 'src/app/view-model/QuestionViewModelForTableRow';
import { QuestionsListImporterComponent } from '../questions-list-importer/questions-list-importer.component';
import { QuestionDetailsComponent } from '../question-details/question-details.component';
import { AbstractInteractiveComponentModel } from 'src/app/components/core/base/AbstractInteractiveComponentModel';
import { QuestionValidationService } from '../../core/validators/QuestionValidationService';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css'],
})
export class QuestionsListComponent extends AbstractInteractiveComponentModel implements OnInit {
  // эти псевдонимы также используются для формирования строки http-запроса, не меняйте их.
  private static readonly DISPLAY_MODE_ALIAS_ALL_QUESTIONS = 'all';
  private static readonly DISPLAY_MODE_ALIAS_CREDITED_QUESTIONS = 'credited';
  private static readonly DISPLAY_MODE_ALIAS_NOT_CREDITED_QUESTIONS =
    'not-credited';

  displayModeAliases: string[] = [
    QuestionsListComponent.DISPLAY_MODE_ALIAS_ALL_QUESTIONS,
    QuestionsListComponent.DISPLAY_MODE_ALIAS_CREDITED_QUESTIONS,
    QuestionsListComponent.DISPLAY_MODE_ALIAS_NOT_CREDITED_QUESTIONS,
  ];

  displayModeTitles: string[] = ['Все', 'Зачётные', 'Внезачётные'];

  selectedDisplayModeAlias: string = this.displayModeAliases[0];

  displayedColumns: string[] = [
    'externalNumber',
    'mainContent',
    'authorsAnswer',
    'source',
    'comment',
  ];

  dataSource: QuestionViewModelForTableRow[];

  totalQuestionsAmount: number;

  selectedRowIndex: number;

  private questionValidationService: QuestionValidationService;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    public otherDialog: MatDialog
  ) {
    super();
    this.questionValidationService = new QuestionValidationService(http);
    if (!this.questionValidationService.isInternalStateCorrect) {
      this.displayMessage(
        this.questionValidationService.brokenStateDescription
      );
      return;
    }

    this.loadQuestionsList();
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  ngOnInit() { }

  loadQuestionsList() {
    const url = `/questions/${this.selectedDisplayModeAlias}`;
    this.http.get(url).subscribe(
      (receivedDataStructures: QuestionDataModel[]) => {
        this.dataSource = [];
        receivedDataStructures.forEach((oneDataStructure) => {
          this.dataSource.push(
            new QuestionViewModelForTableRow(oneDataStructure)
          );
        });

        this.loadTotalQuestionsAmount();
      },
      (error) => this.reportServerError(error)
    );
  }

  loadTotalQuestionsAmount() {
    const url = '/questions/total-amount';
    this.http.get(url).subscribe(
      (totalAmount: number) => {
        this.totalQuestionsAmount = totalAmount;
      },
      (error) => this.reportServerError(error)
    );
  }

  listDisplayModeChanged(event: MatRadioChange) {
    const receivedDisplayModeAlias = event.value;

    if (this.selectedDisplayModeAlias !== receivedDisplayModeAlias) {
      this.selectedDisplayModeAlias = receivedDisplayModeAlias;
      this.loadQuestionsList();
    }
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = QuestionDetailsComponent.getDialogConfigWithData(
      this.questionValidationService,
      selectedRow
    );

    const dialogRef = this.dialog.open(QuestionDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем таблицу со списком вопросов
        this.loadQuestionsList();
      }
    });
  }

  onRowClicked(row: any) {
    this.openDetailsDialog(row);
  }

  public get questionsArePresent(): boolean {
    return this.dataSource && this.dataSource.length > 0;
  }

  ImportQuestions() {
    this.http.get('/answers/present').subscribe(
      (answersArePresentFlag: boolean) => {
        if (answersArePresentFlag) {
          this.displayMessage('Чтобы импортировать задания, надо предварительно удалить уже существующие. Но этого сделать нельзя, пока в системе есть ответы на них. Удалите их, прежде чем импортировать вопросы заново.');
        } else {
          if (this.dataSource.length > 0) {
            const confirmationMessage =
              'В базе данных уже представлены загруженнные задания. Их необходимо удалить, прежде чем импортировать новые. Удалить все загруженные задания?';

            const dialogAcceptedAction = () => {
              // если диалог был принят (accepted)
              // удаляем задания на сервере
              this.http.delete('/questions/all').subscribe(
                (data: any) => {
                  // обновляем таблицу со списком вопросов (уже пустую)
                  this.loadQuestionsList();

                  // запускаем импорт вопросов
                  this.startImportingQuestions();
                },
                (error) => this.reportServerError(error)
              );
            };

            this.confirmationDialog(confirmationMessage, dialogAcceptedAction);
          } else {
            // запускаем импорт вопросов
            this.startImportingQuestions();
          }
        }
      },
      (error) => this.reportServerError(error)
    );
  }

  private startImportingQuestions() {
    const importDialogConfig = QuestionsListImporterComponent.getDialogConfigWithData(
      this.questionValidationService
    );
    const dialogRef = this.dialog.open(
      QuestionsListImporterComponent,
      importDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем таблицу со списком вопросов
        this.loadQuestionsList();
      }
    });
  }

  public ExportQuestions() {
    const confirmationMessage = `Выгруженные задания будут в формате требуемом механизмом импорта заданий и в кодировке UTF-8 (Unicode).
     Выгруженный файл будет находиться в вашей папке загрузок (Downloads). Продолжать?`;

    const dialogAcceptedAction = () => {
      // если диалог был принят (accepted)
      // выгружаем вопросы
      const url = '/questions/export';
      window.location.href = url;
    };

    this.confirmationDialog(confirmationMessage, dialogAcceptedAction);
  }
}
