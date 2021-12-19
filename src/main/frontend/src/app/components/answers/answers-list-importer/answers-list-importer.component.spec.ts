/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnswersListImporterComponent } from './answers-list-importer.component';

describe('AnswersListImporterComponent', () => {
  let component: AnswersListImporterComponent;
  let fixture: ComponentFixture<AnswersListImporterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswersListImporterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswersListImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
