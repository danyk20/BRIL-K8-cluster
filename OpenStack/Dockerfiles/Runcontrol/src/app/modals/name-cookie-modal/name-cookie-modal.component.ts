import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Modal } from '../modal';

import { Store } from '@ngrx/store';
import * as appState from '@app/core/state/state.reducer';
import * as appReducer from '@app/state/app.reducer';
import * as appActions from '@app/state/app.actions';

@Component({
    selector: 'name-cookie-modal',
    templateUrl: './name-cookie-modal.component.html',
    styleUrls: ['./name-cookie-modal.component.css']
})
export class NameCookieModalComponent extends Modal {

    name: string;

    constructor(protected store: Store<appState.State>) {
        super();
    }

    setName() {
        if (!this.name) {
            return;
        }
        this.store.dispatch(new appActions.SetCookieAction(
            {name: 'clientname', value: this.name, days: 270}
        ));
        this.cancel();
    }

    cancel() {
        this.modal.close();
    }

}
