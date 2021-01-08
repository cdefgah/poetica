/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractViewModel } from './AbstractViewModel';
import { TeamDataModel } from '../data-model/TeamDataModel';

export class TeamViewModel extends AbstractViewModel {

    private readonly teamDataModel: TeamDataModel;

    constructor(teamDataModel: TeamDataModel) {
        super();
        this.teamDataModel = teamDataModel;
    }

    public get number(): number {
        return this.teamDataModel.number;
    }

    public get title(): string {
        const maxDisplayedLength = 64;
        if (this.teamDataModel.title.length > maxDisplayedLength) {
            return this.teamDataModel.title.substring(0, maxDisplayedLength) + '...';
        } else {
            return this.teamDataModel.title;
        }
    }
 }