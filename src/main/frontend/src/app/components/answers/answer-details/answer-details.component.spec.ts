/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnswerDetailsComponent } from './answer-details.component';

describe('AnswerDetailsComponent', () => {
  let component: AnswerDetailsComponent;
  let fixture: ComponentFixture<AnswerDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
