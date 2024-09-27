import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, empty, of as ObservableOf} from 'rxjs';
import { withLatestFrom, map, switchMap, catchError } from 'rxjs/operators';

import { ConfigurationsService } from '../services/configurations.service';
import { Configuration } from '../models/configuration';
import * as configsActions from './configurations.actions';


@Injectable()
export class ConfigurationsEffects {
    update$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(configsActions.UPDATE),
        switchMap(() => {
            return this.configService.getConfigs().pipe(
                map((response) => (new configsActions.UpdateSuccessAction(response))),
                catchError((err, caught) => ObservableOf(
                    new configsActions.UpdateFailedAction({
                        message: 'HTTP request failed',
                        error: err
                    })
                ))
            );

        })
    ));

    constructor(protected actions$: Actions, protected configService: ConfigurationsService) {
    };
}
