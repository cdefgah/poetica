import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { ConfigurationValue } from "src/app/model/ConfigurationValue";
import { AbstractInteractiveComponentModel } from "../core/base/AbstractInteractiveComponentModel";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  encodingSystemNames: string[] = [];
  encodingHumanReadableTitles: string[] = [];

  selectedEncodingSystemName: string;

  /**
   * Сделать map, где отчёту будет соответствовать action.
   * дёргаем action из map по выбранному отчёту и просто его вызываем action.run();
   */

  reportAliases: string[] = [
    "listOfAnsweredCommands",
    "preliminaryTable",
    "finalTable",
    "collectionOfWorks",
  ];
  reportTitles: string[] = [
    "Сводка команд, приславших ответы",
    "Предварительная таблица результатов",
    "Окончательная таблица результатов",
    "Собрание сочинений",
  ];
  selectedReportAlias: string = this.reportAliases[0];

  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
    this.loadAllReportEncodingVariants();
  }

  ngOnInit() {}

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  loadAllReportEncodingVariants() {
    const url: string = "/configuration/supported-report-encodings";
    this.http.get(url).subscribe(
      (data: CharsetEncodingEntity[]) => {
        data.forEach((element) => {
          this.encodingSystemNames.push(element.systemName);
          this.encodingHumanReadableTitles.push(element.humanReadableTitle);
        });

        this.initActualReportEncodingSystemName();
      },
      (error) => this.reportServerError(error)
    );
  }

  initActualReportEncodingSystemName() {
    const url: string = "/configuration/actual-report-encoding-system-name";
    this.http.get(url).subscribe(
      (data: ConfigurationValue) => {
        this.selectedEncodingSystemName = data.value;
      },
      (error) => {
        this.reportServerError(error);
      }
    );
  }
}

class CharsetEncodingEntity {
  humanReadableTitle: string;
  systemName: string;
}
