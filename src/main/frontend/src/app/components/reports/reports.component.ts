import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"]
})
export class ReportsComponent implements OnInit {
  encodingAliases: string[] = ["UTF-8", "KOI-8R"];

  encodingTitles: string[] = ["Юникод (UTF-8)", "КОИ-8Р (KOI-8R)"];

  selectedEncodingAlias: string = this.encodingAliases[0];

  reportAliases: string[] = [
    "listOfAnsweredCommands",
    "preliminaryTable",
    "finalTable",
    "collectionOfWorks"
  ];
  reportTitles: string[] = [
    "Сводка команд, приславших ответы",
    "Предварительная таблица результатов",
    "Окончательная таблица результатов",
    "Собрание сочинений"
  ];
  selectedReportAlias: string = this.reportAliases[0];

  constructor() {}

  ngOnInit() {}
}
