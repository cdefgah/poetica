import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { QuestionDetailsComponent } from "../question-details/question-details.component";

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

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {}

  loadConstraints() {
    var url: string = "/questions/model-constraints";
    this.http
      .get(url)
      .subscribe((data: Map<string, number>) =>
        this.processLoadedConstaints(data)
      );
  }

  processLoadedConstaints(data: Map<string, number>) {
    this.modelConstaints = data;
    console.log("===== CONSTRAINTS START =====");
    console.dir(this.modelConstaints);
    console.log("===== CONSTRAINTS END =====");
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog.open(QuestionDetailsComponent, dialogConfig);
  }
}
