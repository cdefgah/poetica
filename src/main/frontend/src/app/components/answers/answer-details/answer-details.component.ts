import { Component, OnInit } from "@angular/core";
import { AbstractInteractiveComponentModel } from "src/app/view-models/AbstractInteractiveComponentModel";
import { MatDialog } from "@angular/material";

@Component({
  selector: "app-answer-details",
  templateUrl: "./answer-details.component.html",
  styleUrls: ["./answer-details.component.css"],
})
export class AnswerDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}

  protected getMessageDialogReference(): MatDialog {
    throw new Error("Method not implemented.");
  }
}
