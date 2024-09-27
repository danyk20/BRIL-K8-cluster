import { Action } from '@ngrx/store';
import { ConfigDetails } from '../models/config-details';

export const REQUEST = '[ConfigDetails] REQUEST';
export const REQUEST_SUCCESS = '[ConfigDetails] REQUEST_SUCCESS';
export const REQUEST_FAILED = '[ConfigDetails] REQUEST_FAILED';

export class RequestAction implements Action {
    readonly type = REQUEST;

    constructor(public payload: {id: string, withXML?: boolean}) {};
}

export class RequestSuccessAction implements Action {
    readonly type = REQUEST_SUCCESS;

    constructor(public payload: {id: string, withXML: boolean, result: any}) {}
}

export class RequestFailedAction implements Action {
    readonly type = REQUEST_FAILED;

    constructor(public payload: {id: string, message: string, error: any}) {}
}

export type Actions
    = RequestAction
    | RequestSuccessAction
    | RequestFailedAction;
