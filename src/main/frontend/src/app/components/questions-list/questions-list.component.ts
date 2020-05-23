import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig, MatRadioChange } from "@angular/material";
import { QuestionDetailsComponent } from "../question-details/question-details.component";
import { Question } from "src/app/model/Question";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { QuestionsListImporterComponent } from "../questions-list-importer/questions-list-importer.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-questions-list",
  templateUrl: "./questions-list.component.html",
  styleUrls: ["./questions-list.component.css"],
})
export class QuestionsListComponent implements OnInit {
  // эти псевдонимы также используются для формирования строки http-запроса, не меняй их.
  private static readonly DISPLAY_MODE_ALIAS_ALL_QUESTIONS = "all";
  private static readonly DISPLAY_MODE_ALIAS_CREDITED_QUESTIONS = "credited";
  private static readonly DISPLAY_MODE_ALIAS_NOT_CREDITED_QUESTIONS =
    "not-credited";

  displayModeAliases: string[] = [
    QuestionsListComponent.DISPLAY_MODE_ALIAS_ALL_QUESTIONS,
    QuestionsListComponent.DISPLAY_MODE_ALIAS_CREDITED_QUESTIONS,
    QuestionsListComponent.DISPLAY_MODE_ALIAS_NOT_CREDITED_QUESTIONS,
  ];

  displayModeTitles: string[] = ["Все", "Зачётные", "Внезачётные"];

  selectedDisplayModeAlias: string = this.displayModeAliases[0];

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  modelConstraints: Map<string, string>;

  dataSource: Question[];

  selectedRowIndex: number;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    public otherDialog: MatDialog
  ) {
    this.loadOneQuestionModelConstraints();
    this.loadQuestionsList();
  }

  ngOnInit() {}

  loadOneQuestionModelConstraints() {
    var url: string = "/questions/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => (this.modelConstraints = data),
      (error) => this.displayErrorMessage(error)
    );
  }

  displayErrorMessage(error: any) {
    var errorMessage: string =
      error.error +
      ". " +
      "Код статуса: " +
      error.status +
      ". " +
      "Сообщение сервера: '" +
      error.message +
      "'";

    var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      "Ошибка"
    );

    this.dialog.open(MessageBoxComponent, msgBoxConfig);
  }

  loadQuestionsList() {
    var urlBase: string = "/questions/";
    var url: string = urlBase + this.selectedDisplayModeAlias;

    this.http.get(url).subscribe(
      (data: Question[]) => {
        this.dataSource = data;
      },
      (error) => this.displayErrorMessage(error)
    );
  }

  listDisplayModeChanged(event: MatRadioChange) {
    var receivedDisplayModeAlias = event.value;
    if (this.selectedDisplayModeAlias != receivedDisplayModeAlias) {
      this.selectedDisplayModeAlias = receivedDisplayModeAlias;
      this.loadQuestionsList();
    }
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = QuestionDetailsComponent.getDialogConfigWithData(
      this.modelConstraints,
      selectedRow
    );
    var dialogRef = this.dialog.open(QuestionDetailsComponent, dialogConfig);
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

  ImportQuestions() {
    if (this.dataSource.length > 0) {
      var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
        "В базе данных уже представлены загруженнные задания. Их необходимо удалить, прежде чем импортировать новые. Удалить все загруженные задания?"
      );

      var confirmationDialogRef = this.otherDialog.open(
        ConfirmationDialogComponent,
        confirmationDialogConfig
      );

      confirmationDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // если диалог был принят (accepted)
          // удаляем задания на сервере
          this.http.delete("/questions/all").subscribe(
            (data: any) => {
              // обновляем таблицу со списком вопросов (уже пустую)
              this.loadQuestionsList();

              // запускаем импорт вопросов
              this.StartImportingQuestions();
            },
            (error) => this.displayErrorMessage(error)
          );
        }
      });
    } else {
      // запускаем импорт вопросов
      this.StartImportingQuestions();
    }
  }

  private StartImportingQuestions() {
    const importDialogConfig = QuestionsListImporterComponent.getDialogConfigWithData(
      this.modelConstraints
    );
    var dialogRef = this.dialog.open(
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
}
