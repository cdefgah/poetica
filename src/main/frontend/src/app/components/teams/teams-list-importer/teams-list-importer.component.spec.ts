/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsListImporterComponent } from './teams-list-importer.component';

describe('TeamsListImporterComponent', () => {
  let component: TeamsListImporterComponent;
  let fixture: ComponentFixture<TeamsListImporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsListImporterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsListImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
