/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatRadioChange, MatSort, MatTableDataSource } from '@angular/material';
import { QuestionsListImporterComponent } from '../questions-list-importer/questions-list-importer.component';
import { QuestionDetailsComponent } from '../question-details/question-details.component';
import { QuestionValidationService } from '../../core/validators/QuestionValidationService';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { QuestionDataModel } from '../../../data-model/QuestionDataModel';
import { QuestionViewModel } from '../../../view-model/QuestionViewModel';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css'],
})
export class QuestionsListComponent extends AbstractInteractiveComponentModel implements OnInit, AfterViewInit {
  // эти псевдонимы также используются для формирования строки http-запроса, не меняйте их.
  private static readonly DISPLAY_MODE_ALIAS_ALL_QUESTIONS = 'all';
  private static readonly DISPLAY_MODE_ALIAS_CREDITED_QUESTIONS = 'credited';
  private static readonly DISPLAY_MODE_ALIAS_NOT_CREDITED_QUESTIONS = 'not-credited';

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

  @ViewChild('questionsTableSort') public questionsTableSort: MatSort;

  questionsDataSource: MatTableDataSource<QuestionViewModel> = new MatTableDataSource([]);

  totalQuestionsAmount: number;

  selectedRowIndex: number;

  private questionValidationService: QuestionValidationService;

  constructor(
    private cdRef: ChangeDetectorRef,
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

  ngAfterViewInit() {
    this.questionsDataSource.sort = this.questionsTableSort;
    this.cdRef.detectChanges();
  }

  loadQuestionsList() {
    // загружаем вопросы (все, внезачётные итп)
    const url = `/questions/${this.selectedDisplayModeAlias}`;
    this.http.get(url).subscribe(
      (receivedDataStructures: QuestionDataModel[]) => {
        this.questionsDataSource.data.length = 0;

        receivedDataStructures.forEach((oneDataStructure) => {
          this.questionsDataSource.data.push(
            new QuestionViewModel(oneDataStructure)
          );
        });

        // оповещаем, что источник данных изменился
        this.questionsDataSource._updateChangeSubscription();

        // тут загружаем общее кол-во вопросов
        // нельзя обойтись счётчиком в вышеприведенном цикле
        // ибо там вопросы могут быть только определенного типа
        // а нам нужно общее количество
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
    return this.questionsDataSource.data && this.questionsDataSource.data.length > 0;
  }

  ImportQuestions() {
    this.http.get('/answers/present').subscribe(
      (answersArePresentFlag: boolean) => {
        if (answersArePresentFlag) {
          this.displayMessage('Чтобы импортировать задания, надо предварительно удалить уже существующие. Но этого сделать нельзя, пока в системе есть ответы на них. Удалите их, прежде чем импортировать вопросы заново.');
        } else {
          if (this.questionsDataSource.data.length > 0) {
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
