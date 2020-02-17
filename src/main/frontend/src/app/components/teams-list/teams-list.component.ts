import { Component, OnInit } from "@angular/core";
import { Team } from "src/app/model/Team";

@Component({
  selector: "app-teams-list",
  templateUrl: "./teams-list.component.html",
  styleUrls: ["./teams-list.component.css"]
})
export class TeamsListComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  displayedColumns: string[] = ["number", "title"];

  dataSource: Team[];

  onRowClicked(row: any) {}
}
