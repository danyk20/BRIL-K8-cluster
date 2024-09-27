import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ConfigDetails } from '@app/core/models/config-details';
import { STATES, RunningDetails } from '@app/core/models/running-details';
import { customConfigSortFn } from '@app/shared/utils/custom-sort';
import { ActionRequest } from '@app/core/models/action-request';

@Component({
    selector: 'overview-active-panel',
    templateUrl: './overview-active-panel.component.html',
    styleUrls: ['./overview-active-panel.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewActivePanelComponent implements OnInit {

    pathsWithVersion = {};

    protected _running: {string: RunningDetails};
    @Input() set running(newRunning) {
        this._running = newRunning;
        this.pathsWithVersion = {};
        Object.keys(newRunning).forEach(key => {
            this.pathsWithVersion[key] = key + '/v=' + newRunning[key].version;
        });
    }

    @Input() configDetails: {string: ConfigDetails};
    @Input() states: {string: string};
    @Input() actionRequests: {string: ActionRequest};

    protected _activePaths: Array<string>;
    @Input() set activePaths(newPaths: Array<string>) {
        this._activePaths = newPaths.sort(customConfigSortFn);
        this.refilter();
    }

    protected _filter: string;
    set filter(newFilter: string) {
        this._filter = newFilter;
        this.refilter();
    }
    get filter(): string {
        return this._filter;
    }

    filteredActivePaths: Array<string>;

    constructor() {}

    ngOnInit() {
        this.filter = '/global/';
    }

    refilter() {
        try {
            let regexp = new RegExp(this.filter, 'i');
            this.filteredActivePaths = this._activePaths.filter(path => {
                return path.search(regexp) >= 0;
            });
        } catch (err) {
            this.filteredActivePaths = [];
        }
    }

    isStateError(state) {
        return state === STATES.ERROR;
    }

    isStateOK(state) {
        return state === STATES.ON;
    }

}
