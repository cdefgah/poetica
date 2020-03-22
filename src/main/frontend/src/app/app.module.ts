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
  MatTableModule
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

import { QuestionsListComponent } from "./components/questions-list/questions-list.component";
import { TeamsListComponent } from "./components/teams-list/teams-list.component";
import { AnswersListComponent } from "./components/answers-list/answers-list.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { AboutComponent } from "./components/about/about.component";
import { QuestionDetailsComponent } from "./components/question-details/question-details.component";
import { ConfirmationDialogComponent } from "./components/confirmation-dialog/confirmation-dialog.component";
import { QuestionsListImporterComponent } from "./components/questions-list-importer/questions-list-importer.component";
import { AnswerDetailsComponent } from "./components/answer-details/answer-details.component";
import { MessageBoxComponent } from "./components/message-box/message-box.component";
import { TeamDetailsComponent } from "./components/team-details/team-details.component";

@NgModule({
  declarations: [
    AppComponent,
    QuestionsListComponent,
    TeamsListComponent,
    AnswersListComponent,
    ReportsComponent,
    AboutComponent,
    QuestionDetailsComponent,
    ConfirmationDialogComponent,
    QuestionsListImporterComponent,
    AnswerDetailsComponent,
    MessageBoxComponent,
    TeamDetailsComponent
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
    MatStepperModule
  ],

  entryComponents: [
    QuestionDetailsComponent,
    ConfirmationDialogComponent,
    QuestionsListImporterComponent,
    AnswerDetailsComponent,
    MessageBoxComponent,
    TeamDetailsComponent,
    QuestionsListImporterComponent
  ],

  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
