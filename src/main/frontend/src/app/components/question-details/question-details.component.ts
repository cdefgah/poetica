import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"]
})
export class QuestionDetailsComponent implements OnInit {
  dialogAccepted: boolean = false;

  constructor(public dialog: MatDialogRef<QuestionDetailsComponent>) {}

  ngOnInit() {}

  acceptDialog() {
    this.dialogAccepted = true;
    this.dialog.close();
    console.log("******************");
    console.log("ACCEPTED");
    console.log("******************");
  }

  cancelDialog() {
    this.dialogAccepted = false;
    this.dialog.close();
    console.log("******************");
    console.log("CANCELED");
    console.log("******************");
  }
}
