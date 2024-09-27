import {Injectable} from '@angular/core';
import {Store, Action} from '@ngrx/store';
import {createEffect, Actions, ofType} from '@ngrx/effects';
import {Observable, empty, of as ObservableOf} from 'rxjs';
import {withLatestFrom, map, switchMap, catchError} from 'rxjs/operators';


import * as appState from './state.reducer';
import {ConfigurationsService} from '../services/configurations.service';
import {RunningDetails} from '../models/running-details';
import * as runningActions from './running-configs.actions';


@Injectable()
export class RunningConfigsEffects {
    update$: Observable<runningActions.Actions> = createEffect(() => this.actions$.pipe(
        ofType(runningActions.UPDATE, runningActions.UPDATE_CANCEL),
        switchMap((action) => {
            if (action.type === runningActions.UPDATE_CANCEL) {
                return empty();
            }
            const payload = (<runningActions.UpdateAction>action).payload;
            return this.configService.getRunning(payload).pipe(
                map((response) => (new runningActions.UpdateSuccessAction({
                    result: response,
                    rcmsUser: payload
                }))),
                catchError(err => (ObservableOf(
                    new runningActions.UpdateFailedAction({
                        message: 'Failed retrieving running',
                        error: err
                    })
                )))
            );
        })
    ));

    updateSucces$: Observable<runningActions.Actions> = createEffect(() => this.actions$.pipe(
        ofType(runningActions.UPDATE_SUCCESS),
        withLatestFrom(this.store$.select(appState.selectRunningEntities)),
        switchMap(([action, running]) => {
            const uris = Object.keys(running).map((key) => {
                return running[key].URI;
            });
            return ObservableOf(new runningActions.UpdateStatesAction(uris));
        })
    ));

    updateStates$: Observable<runningActions.Actions> = createEffect(() => this.actions$.pipe(
        ofType(runningActions.UPDATE_STATES, runningActions.UPDATE_STATES_CANCEL),
        switchMap(action => {
            if (action.type === runningActions.UPDATE_STATES_CANCEL) {
                return empty();
            }
            const payload = (<runningActions.UpdateStatesAction>action).payload;
            return this.configService.getStates(payload).pipe(
                map((response) => (new runningActions.UpdateStatesSuccessAction(response))),
                catchError(err => (ObservableOf(
                    new runningActions.UpdateFailedAction({
                        message: 'Failed retrieving states',
                        error: err
                    })
                )))
            );
        })
    ));

    constructor(
        protected actions$: Actions<runningActions.Actions>,
        protected store$: Store<appState.State>,
        protected configService: ConfigurationsService) {
    };
}
