import { Action } from '@ngrx/store';
import { Alert, AlertActionNames } from '../models/alert';

export const ADD_ALERT = '[App] ADD_ALERT';
export const HANDLE_ALERT = '[App] HANDLE_ALERT';

export const OPEN_MODAL = '[App] OPEN_MODAL';
export const CLOSE_MODAL = '[App] CLOSE_MODAL';
export const MODAL_CLOSED = '[App] MODAL_CLOSED';

export const SET_COOKIE = '[App] SET_COOKIE';

export const GET_BUILD_NUMBER = '[App] GET_BUILD_NUMBER';
export const SUCCESS_GET_BUILD_NUMBER = '[App] SUCCESS_GET_BUILD_NUMBER';
export const FAIL_GET_BUILD_NUMBER = '[App] FAIL_GET_BUILD_NUMBER';

export class AddAlertAction implements Action {
    readonly type = ADD_ALERT;

    constructor(public payload: Alert) {};
}

export class HandleAlertAction implements Action {
    readonly type = HANDLE_ALERT;

    constructor(public payload: {alert: Alert, actionName: AlertActionNames}) {};
}

export class OpenModalAction implements Action {
    readonly type = OPEN_MODAL;

    constructor(public payload: {id: string}) {};
}

export class CloseModalAction implements Action {
    readonly type = CLOSE_MODAL;

    constructor(public payload: {id: string}) {};
}

export class ModalClosedAction implements Action {
    readonly type = MODAL_CLOSED;

    constructor(public payload: {id: string}) {};
}

export class SetCookieAction implements Action {
    readonly type = SET_COOKIE;

    constructor(public payload: {name: string, value: string, days: number}) {};
}

export class GetNewestAppBuildNumberAction implements Action {
    readonly type = GET_BUILD_NUMBER;
}

export class SuccessGetNewestAppBuildNumberAction implements Action {
    readonly type = SUCCESS_GET_BUILD_NUMBER;

    constructor(public payload: number) {};
}

export class FailGetNewestAppBuildNumberAction implements Action {
    readonly type = FAIL_GET_BUILD_NUMBER;
}


export type Actions =
    AddAlertAction |
    HandleAlertAction |
    OpenModalAction |
    CloseModalAction |
    ModalClosedAction |
    SetCookieAction |
    GetNewestAppBuildNumberAction |
    SuccessGetNewestAppBuildNumberAction |
    FailGetNewestAppBuildNumberAction;
