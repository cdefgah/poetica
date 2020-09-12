/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswersListComponent } from './answers-list.component';

describe('AnswersListComponent', () => {
  let component: AnswersListComponent;
  let fixture: ComponentFixture<AnswersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnswersListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
