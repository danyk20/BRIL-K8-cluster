import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, empty, of as ObservableOf} from 'rxjs';
import { withLatestFrom, map, mergeMap, catchError } from 'rxjs/operators';

import * as appState from './state.reducer';
import * as historyActions from './history.actions';
import { ConfigurationsService } from '../services/configurations.service';


@Injectable()
export class HistoryEffects {


    getHistory$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(historyActions.GET_NEWEST, historyActions.GET_OLDER),
        withLatestFrom(
            this.store$.select(appState.selectHistoryEntities),
            this.store$.select(appState.selectHistoryRequests)
        ),
        mergeMap(([action, history, historyRequests]) => {
            const payload = (<historyActions.GetNewestHistoryAction | historyActions.GetOlderHistoryAction> action).payload;
            const id = payload.configId;
            let below = null;
            if (action.type === historyActions.GET_OLDER) {
                if (!history.hasOwnProperty(id) || historyRequests[id].ignore) {
                    return empty();
                }
                below = history[id][history[id].length -1][0];
            }
            return this.configService.getHistory(id, payload.size, below).pipe(
                map((response) => (new historyActions.GetHistorySuccessAction({
                    configId: id,
                    forNewest: historyRequests[id].forNewest,
                    result: response
                }))),
                catchError((err, caught) => ObservableOf(
                    new historyActions.GetHistoryFailedAction({
                        configId: id,
                        message: 'HTTP request failed',
                        error: err
                    })
                ))
            );
        })
    ));

    constructor(
        protected actions$: Actions<historyActions.Actions>,
        protected configService: ConfigurationsService,
        protected store$: Store<appState.State>) {};
}
