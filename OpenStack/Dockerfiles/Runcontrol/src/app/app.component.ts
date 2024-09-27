import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';

import * as APP_CONFIG from '@app/../app-config-constants';
import { Alert, AlertActionNames } from './models/alert';
import { Store } from '@ngrx/store';
import * as appState from '@app/core/state/state.reducer';
import * as appReducer from './state/app.reducer';
import * as appActions from './state/app.actions';
import * as configsActions from './core/state/configurations.actions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    alerts$: Observable<Array<Alert>>;
    newestBuildNumber$: Observable<number>;

    constructor(private store: Store<appState.State>) {
        console.log('CONSTRUCT app');
        this.alerts$ = this.store.select(state => {
            return appReducer.selectAlertsEntities(state['appModule']);
        });
        this.newestBuildNumber$ = this.store.select(state => {
            return appReducer.selectBuildNumber(state['appModule']);
        });

    }

    ngOnInit() {
        console.log('APP INIT');

        // NOTE:
        // until the problem is fixed, we cannot dispatch actions between two
        // ngrx stre initializations, with devtools enabled
        if (document.cookie.indexOf('clientname') < 0) {
            setTimeout(this.pushNameCookieAlert.bind(this), 2000);
        }

        interval(APP_CONFIG.BUILD_NUMBER_CHECK_INTERVAL).subscribe(() => {
            this.store.dispatch(new appActions.GetNewestAppBuildNumberAction());
        });
        this.newestBuildNumber$.subscribe((val) => {
            if (val > APP_CONFIG.BUILD_NUMBER) {
                this.store.dispatch(
                    new appActions.OpenModalAction({id: 'modalAppRefresh'}));
            }
        });

    }

    ngAfterViewInit() {
    }

    handleAlert(event: {alert: Alert, actionName: AlertActionNames}) {
        this.store.dispatch(new appActions.HandleAlertAction({
            alert: event.alert,
            actionName: event.actionName
        }));
    }

    pushNameCookieAlert() {
        const nameCookieModalAction = new appActions.OpenModalAction(
            {id: 'modalNameCookie'}
        );
        const autoNameCokieAction = new appActions.SetCookieAction(
            {name: 'clientname', value: Date.now().toString().substring(5, 10), days: 30}
        );
        const text = 'Would you mind setting your name into a cookie? ' +
            'It would be associated with your actions in server logs.';

        this.store.dispatch(new appActions.AddAlertAction({
            type: 'info',
            text: text,
            closable: true,
            actions: {
                closeAction: {action: null, text: ''},
                firstAction: {action: nameCookieModalAction, text: 'Set name'},
                secondAction: {action: autoNameCokieAction, text: 'Hide this'}
            }
        }));
    }

}
