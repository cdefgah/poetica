import { Component, OnInit } from "@angular/core";

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

  constructor() {}

  ngOnInit() {}
}
