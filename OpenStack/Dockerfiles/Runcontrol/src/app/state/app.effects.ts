import {map, catchError, switchMap, withLatestFrom} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {createEffect, Actions, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable, empty, of as ObservableOf, EMPTY} from 'rxjs';

import {AppService} from '@app/services/app.service';
import * as coreState from '@app/core/state/state.reducer';
import * as appReducer from './app.reducer';
import * as appActions from './app.actions';

@Injectable()
export class AppEffects {


    handleAlert$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(appActions.HANDLE_ALERT),
        withLatestFrom(this.store$.select(state => {
            return appReducer.selectAlerts(state['appModule']);
        })),
        switchMap(([action, alerts]) => {
            if (alerts.handleAlert) {
                const payload = (<appActions.HandleAlertAction>action).payload;
                const newAction = payload.alert.actions[payload.actionName].action;
                if (newAction) {
                    return ObservableOf(newAction);
                }
            }
            return empty();
        })
    ));


    setCookiew$: Observable<Action> = createEffect(() => this.actions$.pipe(
            ofType(appActions.SET_COOKIE),
            switchMap(action => {
                const payload = (<appActions.SetCookieAction>action).payload;
                const date = new Date();
                date.setTime(date.getTime() + (payload.days * 24 * 60 * 60 * 1000));
                const expires = '; expires=' + date.toUTCString();
                document.cookie = payload.name + '=' + payload.value + expires + '; path=/';
                return empty();
            })
        ),
        {dispatch: false}
    );


    getBuildNumber$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(appActions.GET_BUILD_NUMBER),
        switchMap(action => {
            return this.appService.getBuildNumber().pipe(
                map(response => (
                    new appActions.SuccessGetNewestAppBuildNumberAction(response)
                )),
                catchError((err, caught) => ObservableOf(
                    new appActions.FailGetNewestAppBuildNumberAction()
                ))
            );
        })
    ));

    constructor(
        protected actions$: Actions<appActions.Actions>,
        protected store$: Store<coreState.State>,
        protected appService: AppService) {
    }

}
