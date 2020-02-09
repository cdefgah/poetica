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

  modelConstaints: Map<string, number>;

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  dataSource: Question[];

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadConstraints();
    this.loadQuestionsList();
  }

  ngOnInit() {}

  loadConstraints() {
    var url: string = "/questions/model-constraints";
    this.http
      .get(url)
      .subscribe((data: Map<string, number>) => (this.modelConstaints = data));
  }

  loadQuestionsList() {
    var url: string = "/questions/all";
    this.http
      .get(url)
      .subscribe((data: Question[]) => (this.dataSource = data));
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "400px";

    this.dialog.open(QuestionDetailsComponent, dialogConfig);
  }
}
