import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatRadioChange } from "@angular/material";
import { Question } from "src/app/model/Question";
import { QuestionsListImporterComponent } from "../questions-list-importer/questions-list-importer.component";
import { QuestionDetailsComponent } from "../question-details/question-details.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";

@Component({
  selector: "app-questions-list",
  templateUrl: "./questions-list.component.html",
  styleUrls: ["./questions-list.component.css"],
})
export class QuestionsListComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  // эти псевдонимы также используются для формирования строки http-запроса, не меняйте их.
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
    super();
    this.loadOneQuestionModelConstraints();
    this.loadQuestionsList();
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  ngOnInit() {}

  loadQuestionsList() {
    const url: string = `/questions/${this.selectedDisplayModeAlias}`;
    this.http.get(url).subscribe(
      (data: Question[]) => {
        this.dataSource = data;
      },
      (error) => this.reportServerError(error)
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
      var confirmationMessage =
        "В базе данных уже представлены загруженнные задания. Их необходимо удалить, прежде чем импортировать новые. Удалить все загруженные задания?";

      var dialogAcceptedAction: Function = () => {
        // если диалог был принят (accepted)
        // удаляем задания на сервере
        this.http.delete("/questions/all").subscribe(
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

  private startImportingQuestions() {
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
