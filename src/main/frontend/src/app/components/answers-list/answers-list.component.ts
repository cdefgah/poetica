import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-answers-list",
  templateUrl: "./answers-list.component.html",
  styleUrls: ["./answers-list.component.css"]
})
export class AnswersListComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  ImportAnswersWizard() {
    // use Angular Material Stepper for wizard creation
    // https://material.angular.io/components/stepper/overview
  }
}
