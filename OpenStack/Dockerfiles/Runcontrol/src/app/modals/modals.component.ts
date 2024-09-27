import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import * as appState from '@app/core/state/state.reducer';
import * as appReducer from '@app/state/app.reducer';
import * as appActions from '@app/state/app.actions';

@Component({
    selector: 'app-modals',
    templateUrl: './modals.component.html',
    styleUrls: ['./modals.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalsComponent implements OnInit {

    modals$: Observable<appReducer.ModalsState>;

    constructor(protected store: Store<appState.State>) {
        this.modals$ = this.store.select(state => {
            return appReducer.selectModals(state['appModule']);
        });
    }

    ngOnInit() {
    }

    closed(modalId: string) {
        console.log('closed modal', modalId)
        this.store.dispatch(new appActions.ModalClosedAction({id: modalId}));
    }

}
