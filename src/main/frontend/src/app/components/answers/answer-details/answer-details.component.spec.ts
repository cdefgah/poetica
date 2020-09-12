/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerDetailsComponent } from './answer-details.component';

describe('AnswerDetailsComponent', () => {
  let component: AnswerDetailsComponent;
  let fixture: ComponentFixture<AnswerDetailsComponent>;

  beforeEach(async(() => {
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
