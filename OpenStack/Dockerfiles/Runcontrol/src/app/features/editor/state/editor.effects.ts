import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, empty, of as ObservableOf} from 'rxjs';
import { withLatestFrom, map, switchMap, catchError } from 'rxjs/operators';

import { ConfigurationsService } from '@app/core/services/configurations.service';
import * as editorActions from './editor.actions';

@Injectable()
export class EditorEffects {
    finalXML$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(editorActions.REQUEST_FINAL_XML, editorActions.CLOSE_RESPONSE_MODAL),
        switchMap((action) => {
            if (action.type === editorActions.CLOSE_RESPONSE_MODAL) {
                return empty();
            }
            const payload = (<editorActions.RequestFinalXMLAction>action).payload;
            return this.configService.buildFinalXML(
                payload.path, payload.version, payload.xml, payload.executive)
                .pipe(
                    map(response => new editorActions.SuccessRequestXMLAction({
                        xml: response
                    })),
                    catchError((err, caught) => ObservableOf(
                        new editorActions.FailRequestXMLAction({
                            response: err
                        })
                    ))
                );
        })
    ));


    fromFieldsXML$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(editorActions.REQUEST_XML_FROM_FIELDS, editorActions.CLOSE_RESPONSE_MODAL),
        switchMap((action) => {
            if (action.type === editorActions.CLOSE_RESPONSE_MODAL) {
                return empty();
            }
            const payload = (<editorActions.RequestXMLFromFieldsAction>action).payload;
            return this.configService.buildXML(
                payload.path, payload.version, payload.fields).pipe(
                    map(response => new editorActions.SuccessRequestXMLAction({
                        xml: response
                    })),
                    catchError((err, caught) => ObservableOf(
                        new editorActions.FailRequestXMLAction({
                            response: err
                        })
                    ))
                );
        })
    ));


    submitFields$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(editorActions.SUBMIT_FIELDS, editorActions.CLOSE_RESPONSE_MODAL),

        switchMap((action) => {
            if (action.type === editorActions.CLOSE_RESPONSE_MODAL) {
                return empty();
            }
            const payload = (<editorActions.SubmitFieldsAction>action).payload;
            return this.configService.submitFields(
                payload.comment, payload.path, payload.version, payload.fields).pipe(
                    map(response => new editorActions.SuccessSubmitAction({
                        response: response
                    })),
                    catchError((err, caught) => ObservableOf(
                        new editorActions.FailSubmitAction({
                            response: err
                        })
                    ))
                );
        })
    ));



    submitXML$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(editorActions.SUBMIT_XML, editorActions.CLOSE_RESPONSE_MODAL),
        switchMap((action) => {
            if (action.type === editorActions.CLOSE_RESPONSE_MODAL) {
                return empty();
            }
            const payload = (<editorActions.SubmitXMLAction>action).payload;
            return this.configService.submitXML(
                payload.comment, payload.path, payload.version, payload.xml, payload.executive)
                .pipe(
                    map(response => new editorActions.SuccessSubmitAction({
                        response: response
                    })),
                    catchError((err, caught) => ObservableOf(
                        new editorActions.FailSubmitAction({
                            response: err
                        })
                    ))
                );
        })
    ));

    constructor(protected actions$: Actions<editorActions.Actions>,
                protected configService: ConfigurationsService) {};
}
