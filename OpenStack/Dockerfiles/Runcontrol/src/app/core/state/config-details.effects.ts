import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, empty, of as ObservableOf } from 'rxjs';
import { withLatestFrom, map, mergeMap, catchError } from 'rxjs/operators';

import { ConfigurationsService } from '../services/configurations.service';
import * as cfgDetailsActions from './config-details.actions';


@Injectable()
export class ConfigDetailsEffects {

    update$: Observable<cfgDetailsActions.Actions> = createEffect(() => this.actions$.pipe(
        ofType(cfgDetailsActions.REQUEST),
        mergeMap((action) => {
            const payload = (<cfgDetailsActions.RequestAction>action).payload;
            return this.configService.getConfigDetails(payload.id, payload.withXML).pipe(
                map((response) => (new cfgDetailsActions.RequestSuccessAction({
                    id: payload.id,
                    withXML: payload.withXML,
                    result: response
                }))),
                catchError((err, caught) => ObservableOf(
                    new cfgDetailsActions.RequestFailedAction({
                        id: payload.id,
                        message: 'HTTP request failed',
                        error: err
                    })
                ))
            );
        })
    ));

    constructor(protected actions$: Actions,
                protected configService: ConfigurationsService) {};
}
