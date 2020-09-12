/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDetailsComponent } from './team-details.component';

describe('TeamDetailsComponent', () => {
  let component: TeamDetailsComponent;
  let fixture: ComponentFixture<TeamDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
