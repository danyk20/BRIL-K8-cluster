import {throwError as observableThrowError} from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/';
import { map, catchError } from 'rxjs/operators';


import { Configuration } from '../models/configuration';
import * as CONTROL_ACTIONS from '../models/control-actions';


@Injectable()
export class ConfigurationsService {

    public static readonly postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    protected owner: Observable<string>;
    configs: Observable<Array<Configuration>>;

    constructor(protected http: HttpClient) {}

    getConfigs() {
        return this.http.get('api/configurations').pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    getRunning(owner: string) {
        return this.http.get('api/running/' + owner).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    getStates(uris: Array<string>) {
        return this.http.post(
            'api/states',
            JSON.stringify(uris),
            {headers: ConfigurationsService.postHeaders}).pipe(
                catchError((err) => observableThrowError(err))
            );
    }

    getState(path: string) {
        return this.http.get<string>('api/state' + path).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    getConfigDetails(id: string, withXML = false) {
        let url = 'api/config' + id;
        if (!withXML) {
            url += '/noxml';
        }
        return this.http.get(url).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    sendAction(id: string, actionType: string) {
        let url = 'api';
        switch (actionType) {
        case CONTROL_ACTIONS.CREATE_FM:
            url += '/create';
            break;
        case CONTROL_ACTIONS.DESTROY_FM:
            url += '/destroy';
            break;
        case CONTROL_ACTIONS.TURN_ON:
        case CONTROL_ACTIONS.TURN_OFF:
        case CONTROL_ACTIONS.RESET:
            url += '/send/' + actionType;
            break;
        default:
            return observableThrowError('Unknown action ' + actionType);
        }
        url += id;
        return this.http.get(url).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    getHistory(id: string, size=20, below=null) {
        let url = 'api/history' + id + '/limit=' + size;
        if (below) {
            // yes. url parameter has double 'l'...
            url += '/bellow=' + below;
        }
        return this.http.get<any>(url).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    buildFinalXML(path: string, version: number, xml: string, executive: any) {
        const url = 'api/buildfinalxml';
        return this.http.post(url, {
            path: path,
            version: version,
            xml: xml,
            executive: executive
        }, {responseType: 'text'}).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    buildXML(path: string, version: number, fields: any) {
        const url = 'api/buildxml';
        return this.http.post(url, {
            path: path,
            version: version,
            fields: fields
        }, {responseType: 'text'}).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    submitFields(comment: string, path: string, version: number, fields: any) {
        const url = 'api/submitfields';
        return this.http.post(url, {
            comment: comment,
            path: path,
            version: version,
            fields: fields
        }).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

    submitXML(comment: string, path: string, version: number, xml: string, executive: any) {
        const url = 'api/submitxml';
        return this.http.post(url, {
            comment: comment,
            path: path,
            version: version,
            xml: xml,
            executive: executive
        }).pipe(
            catchError((err) => observableThrowError(err))
        );
    }

}
