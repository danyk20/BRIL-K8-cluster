import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject, BehaviorSubject, Subscription, empty } from 'rxjs';
import { map, take, takeUntil, skip, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as appState from '@app/core/state/state.reducer';
import * as editorReducer from './state/editor.reducer';

import * as configDetailsActions from '@app/core/state/config-details.actions';
import * as actionRequestsActions from '@app/core/state/action-requests.actions';
import * as historyActions from '@app/core/state/history.actions';
import * as editorActions from './state/editor.actions';
import { ConfigDetails } from '@app/core/models/config-details';


@Component({
    selector: 'bc-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    protected historySubscription: Subscription;

    @ViewChild('confirmModal', { static: true }) confirmModal;
    @ViewChild('responseModal', { static: true }) responseModal;

    protected _path: string;
    @Input('path') set path(newPath: string) {
        this._path = newPath;
        this.reselectWorkingConfiguration();
    }
    get path() {
        return this._path;
    }

    urlSegments = [];
    selectedVersion = null;
    firstLoadVersionSelected = false;

    history$: Observable<any>;
    historyRequest$: Observable<any>;
    editorMode$: Observable<string>;
    isEditorModeExpert$: Observable<boolean>;
    configDetails$: Observable<ConfigDetails>;
    previewModal$: Observable<any>;
    responseModal$: Observable<any>;

    constructor(protected store: Store<any>, protected route: ActivatedRoute) {
        this.configDetails$ = empty();
        this.historyRequest$ = empty();
        this.history$ = empty();
        this.historySubscription = this.history$.subscribe();
        this.editorMode$ = this.store.select(s => {
            return editorReducer.selectMode(s['editorModule']);
        });
        this.previewModal$ = this.store.select(s => {
            return editorReducer.selectXMLViewModal(s['editorModule']);
        });
        this.responseModal$ = this.store.select(s => {
            return editorReducer.selectResponseModal(s['editorModule']);
        });
        this.isEditorModeExpert$ = this.editorMode$.pipe(map(val => val === 'expert'));
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    switchMode() {
        this.editorMode$.pipe(take(1)).subscribe(val => {
            let newMode = 'expert';
            if (val === 'expert') {
                newMode = 'easy';
            }
            this.store.dispatch(new editorActions.SwitchModeAction(newMode));
        });
    }

    reselectWorkingConfiguration() {
        this.firstLoadVersionSelected = false;

        this.history$ = this.store.select(appState.selectHistoryById(this.path));
        this.historyRequest$ = this.store.select(appState.selectHistoryRequestById(this.path));

        this.store.dispatch(new historyActions.GetNewestHistoryAction({
            configId: this.path, size: 10
        }));
        this.historySubscription.unsubscribe();
        this.historySubscription = this.history$.pipe(
            takeUntil(this.ngUnsubscribe),
            skip(1), // skip initial value - avoid useless updates
            withLatestFrom(this.historyRequest$)
        ).subscribe(([history, request]) => {
            if (!request.forNewest) {
                return;
            }
            if (!history.length) {
                return;
            }
            this._selectVersion(history[0][0])
            this.firstLoadVersionSelected = true;
        });

    }

    protected _selectVersion(newVersion: number) {
        this.selectedVersion = newVersion;
        this.configDetails$ = this.store.select(
            appState.selectConfigDetailsById(
                this.path + '/v=' + this.selectedVersion));
        this.updateConfigDetails();
    }

    selectVersion(newVersion: number) {
        if (!this.firstLoadVersionSelected) {
            return;
        }
        this._selectVersion(newVersion);
    }

    updateConfigDetails() {
        this.store.dispatch(new configDetailsActions.RequestAction({
            id: this.path + '/v=' + this.selectedVersion,
            withXML: true
        }));
    }

    loadOlderHistory() {
        this.store.dispatch(new historyActions.GetOlderHistoryAction({
            configId: this.path, size: 20
        }));
    }

    showXMLFromFields(fields) {
        this.store.dispatch(
            new editorActions.RequestXMLFromFieldsAction({
                path: this.path,
                version: this.selectedVersion,
                fields: fields
            }));
    }

    showFinalXML(event: {xml: string, executive}) {
        this.store.dispatch(
            new editorActions.RequestFinalXMLAction({
                path: this.path,
                version: this.selectedVersion,
                xml: event.xml,
                executive: event.executive
            }));
    }

    submitFields(fields) {
        try {
            this.confirmModal.close();
        } catch (e) {}
        this.confirmModal.setCallback((comment) => {
            this.store.dispatch(
                new editorActions.SubmitFieldsAction({
                    comment: comment,
                    path: this.path,
                    version: this.selectedVersion,
                    fields: fields
                }));
            setTimeout(this.reselectWorkingConfiguration.bind(this), 5500);
        });
        this.confirmModal.open();
    }

    submitXML(event: {xml, executive}) {
        try {
            this.confirmModal.close();
        } catch (e) {}
        this.confirmModal.setCallback((comment) => {
            this.store.dispatch(
                new editorActions.SubmitXMLAction({
                    comment: comment,
                    path: this.path,
                    version: this.selectedVersion,
                    xml: event.xml,
                    executive: event.executive
                }));
            setTimeout(this.reselectWorkingConfiguration.bind(this), 5500);
        });
        this.confirmModal.open();
    }

    closeModal(name) {
        switch(name) {
        case 'preview': {
            this.store.dispatch(new editorActions.CloseXMLViewModalAction());
        }
        case 'response': {
            // if (!this.responseModal.badStatus()) {
            //     setTimeout(this.reselectWorkingConfiguration.bind(this), 100);
            // }
            this.store.dispatch(new editorActions.CloseResponseModalAction());
        }
        }
    }

}
