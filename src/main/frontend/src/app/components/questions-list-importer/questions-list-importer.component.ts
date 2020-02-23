import { Component, OnInit } from "@angular/core";
import { MatDialogConfig } from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"]
})
export class QuestionsListImporterComponent implements OnInit {
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;

  sourceText: string;

  static getDialogConfigWithData(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    return dialogConfig;
  }

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ["", Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ["", Validators.required]
    });
  }

  cancelDialog() {}
}
