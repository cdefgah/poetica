/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsListComponent } from './questions-list.component';

describe('QuestionsListComponent', () => {
  let component: QuestionsListComponent;
  let fixture: ComponentFixture<QuestionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionsListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
