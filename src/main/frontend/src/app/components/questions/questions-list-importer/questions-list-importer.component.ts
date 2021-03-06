import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { QuestionsImporter } from './support/QuestionsImporter';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { QuestionValidationService } from '../../core/validators/QuestionValidationService';
import { QuestionDataModel } from '../../../data-model/QuestionDataModel';

@Component({
  selector: 'app-questions-list-importer',
  templateUrl: './questions-list-importer.component.html',
  styleUrls: ['./questions-list-importer.component.css'],
})
export class QuestionsListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionsListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    if (!dialogData) {
      return;
    }

    this.questionValidationService = dialogData[QuestionsListImporterComponent.KEY_DIALOG_QUESTION_VALIDATOR_SERVICE];
  }

  private static readonly KEY_DIALOG_QUESTION_VALIDATOR_SERVICE = 'questionModelValidatorService';
  rawSourceTextFormGroup: any;

  dataSource: QuestionDataModel[] = [];

  displayedColumns: string[] = [
    'externalNumber',
    'graded',
    'title',
    'body',
    'authorsAnswer',
    'comment',
    'source',
    'authorInfo'
  ];

  sourceText: string;

  foundError = '';

  dataIsReadyForImport = false;

  questionValidationService: QuestionValidationService;

  static getDialogConfigWithData(questionValidationService: QuestionValidationService): MatDialogConfig {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '62%';

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      QuestionsListImporterComponent.KEY_DIALOG_QUESTION_VALIDATOR_SERVICE
    ] = questionValidationService;

    return dialogConfig;
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  ngOnInit() { }

  cancelDialog() {
    this.confirmationDialog('Прервать импорт заданий?', () => {
      // если диалог был принят (accepted)
      this.dialog.close(false);
    });
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex === 0) {
      this.foundError = '';
      this.processSourceText();

      this.dataIsReadyForImport = this.foundError.length === 0;
    } else if (event.previouslySelectedIndex === 1) {
      // если вернулись назад
      this.dataIsReadyForImport = false;
    }
  }

  private processSourceText(): void {
    const questionsImporter = new QuestionsImporter(
      this,
      this.sourceText,
      this.questionValidationService,
      this.onQuestionsImportSuccess,
      this.onQuestionImportFailure
    );
    questionsImporter.doImport();
  }

  private onQuestionsImportSuccess(importerComponent: QuestionsListImporterComponent, questionsList: QuestionDataModel[]) {
    importerComponent.dataSource = questionsList;
  }

  private onQuestionImportFailure(importerComponent: QuestionsListImporterComponent, errorMessage: string) {
    importerComponent.foundError = errorMessage;
  }

  onRowClicked(row: any) { }

  doImportQuestions() {
    this.confirmationDialog('Импортировать задания?', () => {
      // если диалог был принят (accepted)
      // импортируем задания
      const headers = new HttpHeaders().set(
        'Content-Type',
        'application/json; charset=utf-8'
      );

      this.http
        .post('/questions/import', this.dataSource, { headers })
        .subscribe(
          () => this.dialog.close(true),
          (error) => this.reportServerError(error, 'Сбой при импорте заданий.')
        );
    });
  }
}
