import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatRippleModule } from "@angular/material";
import { MatButtonModule } from "@angular/material";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDividerModule } from "@angular/material/divider";

import { CreditedQuestionsListComponent } from "./credited-questions-list/credited-questions-list.component";
import { NotCreditedQuestionsListComponent } from "./not-credited-questions-list/not-credited-questions-list.component";
import { GeneralQuestionsListComponent } from "./general-questions-list/general-questions-list.component";
import { TeamsListComponent } from "./teams-list/teams-list.component";
import { AnswersListComponent } from "./answers-list/answers-list.component";
import { ReportsComponent } from "./reports/reports.component";
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    CreditedQuestionsListComponent,
    NotCreditedQuestionsListComponent,
    GeneralQuestionsListComponent,
    TeamsListComponent,
    AnswersListComponent,
    ReportsComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatRippleModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
