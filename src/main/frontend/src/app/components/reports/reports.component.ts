import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { ConfigurationValue } from "src/app/model/ConfigurationValue";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"]
})
export class ReportsComponent implements OnInit {
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
    "collectionOfWorks"
  ];
  reportTitles: string[] = [
    "Сводка команд, приславших ответы",
    "Предварительная таблица результатов",
    "Окончательная таблица результатов",
    "Собрание сочинений"
  ];
  selectedReportAlias: string = this.reportAliases[0];

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadAllReportEncodingVariants();
  }

  ngOnInit() {}

  loadAllReportEncodingVariants() {
    var url: string = "/configuration/supported-report-encodings";
    this.http.get(url).subscribe(
      (data: CharsetEncodingEntity[]) => {
        data.forEach(element => {
          this.encodingSystemNames.push(element.systemName);
          this.encodingHumanReadableTitles.push(element.humanReadableTitle);
        });

        this.initActualReportEncodingSystemName();
      },
      error => this.displayErrorMessage(error)
    );
  }

  initActualReportEncodingSystemName() {
    var url: string = "/configuration/actual-report-encoding-system-name";
    this.http.get(url).subscribe(
      (data: ConfigurationValue) => {
        this.selectedEncodingSystemName = data.value;
      },
      error => {
        this.displayErrorMessage(error);
      }
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
}

class CharsetEncodingEntity {
  humanReadableTitle: string;
  systemName: string;
}
