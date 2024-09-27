import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import * as appState from '@app/core/state/state.reducer';
import * as actionRequestsActions from '@app/core/state/action-requests.actions';
import { ActionRequest } from '@app/core/models/action-request';
import * as CONTROL_ACTIONS from '@app/core/models/control-actions';
import { STATES as CONFIG_STATES } from '@app/core/models/running-details';
import * as APP_CONFIG from '@app/../app-config-constants';


class DisabledActionButtons {
    turnon: boolean
    turnoff: boolean
    reset?: boolean
    create: boolean
    destroy: boolean
}

@Component({
    selector: 'config-action-menu',
    templateUrl: './action-menu.component.html',
    styleUrls: ['./action-menu.component.css']
})
export class ActionMenuComponent implements OnInit {

    name: string;
    webLogsURL: string;
    disabledActionButtons: DisabledActionButtons = {
        turnon: false,
        turnoff: false,
        reset: false,
        create: false,
        destroy: false
    };

    protected _path;
    @Input() set path(newPath: string) {
        this._path = newPath;
        this.name = newPath.split('/').pop();
    }
    get path(): string {
        return this._path;
    }

    @Input('hideEditLink') hideEditLink = false;

    protected _configDetails;
    @Input() set configDetails(newConfigDetails) {
        this._configDetails = newConfigDetails;
        if (newConfigDetails) {
            this.updateWebLogsURL();
        }
    };
    get configDetails() {
        return this._configDetails;
    }

    protected _actionRequest: ActionRequest;
    @Input() set actionRequest(newActionRequest) {
        this._actionRequest = newActionRequest;
        this.updateButtonDisables();
    }

    stateIsON: boolean;
    protected _state;
    @Input() set state(newState) {
        this._state = newState;
        this.stateIsON = newState === CONFIG_STATES.ON;
        this.updateButtonDisables();
    }

    constructor(protected store: Store<appState.State>) {};

    ngOnInit() {
    }

    updateButtonDisables() {
        if (this._actionRequest && this._actionRequest.state.loading) {
            Object.keys(this.disabledActionButtons).forEach(key => {
                this.disabledActionButtons[key] = true;
            });
            return;
        }
        this.disabledActionButtons.reset = false;
        this.disabledActionButtons.destroy = false;
        let change = {};
        if (this._state === CONFIG_STATES.ON) {
            change = {turnon: true, turnoff: false, create: true};
        } else if (this._state === CONFIG_STATES.OFF) {
            change = {turnon: false, turnoff: true, create: true};
        } else if (this._state === CONFIG_STATES.ERROR) {
            change = {turnon: true, turnoff: true, create: true};
        } else if (this._state === CONFIG_STATES.NO_FM) {
            change = {turnon: true, turnoff: true, reset: true, create: false, destroy: true};
        } else {
            change = {turnon: true, turnoff: true, create: true, destroy: true};
        }
        this.disabledActionButtons = Object.assign(this.disabledActionButtons, change);
    }

    sendTurnON() {
        this.sendAction(CONTROL_ACTIONS.TURN_ON);
    }

    sendTurnOFF() {
        this.sendAction(CONTROL_ACTIONS.TURN_OFF);
    }

    sendReset() {
        this.sendAction(CONTROL_ACTIONS.RESET);
    }

    sendCreate() {
        this.sendAction(CONTROL_ACTIONS.CREATE_FM);
    }

    sendDestroy() {
        this.sendAction(CONTROL_ACTIONS.DESTROY_FM);
    }

    protected sendAction(action) {
        this.store.dispatch(new actionRequestsActions.SendActionAction(
            {configId: this._path, actionType: action}));
    }

    protected updateWebLogsURL() {
        const exec = this.configDetails.executive;
        if (!exec) {
            this.webLogsURL = '';
            return;
        }
        this.webLogsURL = APP_CONFIG.WEBLOGREADER_BASE +
            '?host=' + exec.host.split('.')[0] +
            '&port=' + exec.port +
            '&group=' + (exec.logURL === 'xml://cmsrc-lumi.cms:26010' ? 'lumipro' : 'lumidev');
    }

}
