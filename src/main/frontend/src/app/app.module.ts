import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  MatRippleModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatTableModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
} from "@angular/material";
import { MatButtonModule } from "@angular/material";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDividerModule } from "@angular/material/divider";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material";
import { MatInputModule } from "@angular/material";
import { MatStepperModule } from "@angular/material/stepper";

import { ReportsComponent } from "./components/reports/reports.component";
import { AboutComponent } from "./components/about/about.component";
import { ConfirmationDialogComponent } from "./components/core/confirmation-dialog/confirmation-dialog.component";
import { MessageBoxComponent } from "./components/core/message-box/message-box.component";
import { AnswersListComponent } from "./components/answers/answers-list/answers-list.component";
import { AnswerDetailsComponent } from "./components/answers/answer-details/answer-details.component";
import { AnswersListImporterComponent } from "./components/answers/answers-list-importer/answers-list-importer.component";
import { QuestionsListComponent } from "./components/questions/questions-list/questions-list.component";
import { QuestionsListImporterComponent } from "./components/questions/questions-list-importer/questions-list-importer.component";
import { QuestionDetailsComponent } from "./components/questions/question-details/question-details.component";
import { TeamDetailsComponent } from "./components/teams/team-details/team-details.component";
import { TeamsListComponent } from "./components/teams/teams-list/teams-list.component";
import { EmailDetailsComponent } from "./components/answers/email-details/email-details.component";
import { DatePipe } from "@angular/common";
import { DisplayRoundPipe } from "./components/answers/support/display-round-pipe/display-round.pipe";
import { TeamsListImporterComponent } from "./components/teams/teams-list-importer/teams-list-importer.component";

@NgModule({
  declarations: [
    AppComponent,
    MessageBoxComponent,
    ConfirmationDialogComponent,
    AnswersListImporterComponent,
    QuestionsListComponent,
    QuestionDetailsComponent,
    QuestionsListImporterComponent,
    TeamsListComponent,
    TeamDetailsComponent,
    AnswersListComponent,
    AnswerDetailsComponent,
    ReportsComponent,
    EmailDetailsComponent,
    AboutComponent,
    DisplayRoundPipe,
    TeamsListImporterComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatRippleModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatDividerModule,
    MatRadioModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatTableModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],

  entryComponents: [
    QuestionDetailsComponent,
    ConfirmationDialogComponent,
    QuestionsListImporterComponent,
    AnswerDetailsComponent,
    MessageBoxComponent,
    TeamDetailsComponent,
    EmailDetailsComponent,
    QuestionsListImporterComponent,
    AnswersListImporterComponent,
    TeamsListImporterComponent,
  ],

  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: MAT_DATE_LOCALE, useValue: "ru" },
    DatePipe,
    DisplayRoundPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
