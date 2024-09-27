import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, empty, of } from 'rxjs';
import { withLatestFrom, map, mergeMap, catchError } from 'rxjs/operators';

import * as coreState from './state.reducer';
import { ConfigurationsService } from '../services/configurations.service';
import * as actionRequestsActions from './action-requests.actions';


@Injectable()
export class ActionRequestsEffects {
    update$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(actionRequestsActions.SEND_ACTION),
        withLatestFrom(this.store$.select(coreState.selectActionRequests)),
        mergeMap(([action, actionRequests]) => {
            const payload = (<actionRequestsActions.SendActionAction>action).payload;
            if (actionRequests.hasOwnProperty(payload.configId) &&
                actionRequests[payload.configId].ignore) {
                console.log('Ignoring SEND_ACTION from effects', payload.configId, payload.actionType);
                return empty();
            }
            return this.configService.sendAction(payload.configId, payload.actionType).pipe(
                map((response) => (new actionRequestsActions.SendActionSuccessAction({
                    configId: payload.configId,
                    actionType: payload.actionType
                }))),
                catchError((err, caught) => of(
                    new actionRequestsActions.SendActionFailedAction({
                        configId: payload.configId,
                        actionType: payload.actionType,
                        message: 'Failed to send action ' + payload.actionType,
                        error: err
                    })))
            );
        })
    ));

    constructor(
        protected actions$: Actions,
        protected store$: Store<coreState.State>,
        protected configService: ConfigurationsService) {};
}
