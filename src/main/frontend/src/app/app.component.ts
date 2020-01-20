import { Component } from "@angular/core";

enum AppWindowState {
  Questions,
  Teams,
  Answers,
  Reports,
  About
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Poetica";

  // Store a reference to the enum for further use in html template
  appWindowState = AppWindowState;

  public windowState: AppWindowState = AppWindowState.Questions;

  toggleQuestionsScreen() {
    if (this.windowState != AppWindowState.Questions) {
      this.windowState = AppWindowState.Questions;
    }
  }

  toggleTeamsScreen() {
    if (this.windowState != AppWindowState.Teams) {
      this.windowState = AppWindowState.Teams;
    }
  }

  toggleAnswersScreen() {
    if (this.windowState != AppWindowState.Answers) {
      this.windowState = AppWindowState.Answers;
    }
  }

  toggleReportsScreen() {
    if (this.windowState != AppWindowState.Reports) {
      this.windowState = AppWindowState.Reports;
    }
  }

  toggleAboutScreen() {
    if (this.windowState != AppWindowState.About) {
      this.windowState = AppWindowState.About;
    }
  }
}
