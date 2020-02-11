import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { QuestionDetailsComponent } from "../question-details/question-details.component";
import { Question } from "src/app/model/Question";

@Component({
  selector: "app-questions-list",
  templateUrl: "./questions-list.component.html",
  styleUrls: ["./questions-list.component.css"]
})
export class QuestionsListComponent implements OnInit {
  displayModeAliases: string[] = [
    "AllQuestions",
    "CreditedQuestions",
    "NotCreditedQuestions"
  ];

  displayModeTitles: string[] = ["Все", "Зачётные", "Внезачётные"];

  selectedDisplayModeAlias: string = this.displayModeAliases[0];

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  modelConstraints: Map<string, number>;

  dataSource: Question[];

  selectedRowIndex: number;

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadConstraints();
    this.loadQuestionsList();
  }

  ngOnInit() {}

  loadConstraints() {
    var url: string = "/questions/model-constraints";
    this.http
      .get(url)
      .subscribe((data: Map<string, number>) => (this.modelConstraints = data));
  }

  loadQuestionsList() {
    var url: string = "/questions/all";
    this.http
      .get(url)
      .subscribe((data: Question[]) => (this.dataSource = data));
  }

  openNewQuestionDialog() {
    this.openDetailsDialog(undefined);
  }

  openDetailsDialog(selectedRow: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "75%";

    dialogConfig.data = {
      selectedRow: selectedRow,
      modelConstraints: this.modelConstraints
    };

    var dialogRef = this.dialog.open(QuestionDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
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
}
