/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionDetailsComponent } from './question-details.component';

describe('QuestionDetailsComponent', () => {
  let component: QuestionDetailsComponent;
  let fixture: ComponentFixture<QuestionDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
