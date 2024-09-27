import { Action } from '@ngrx/store';

export const SEND_ACTION = '[ActionRquests] SEND_ACTION';
export const SEND_ACTION_SUCCESS = '[ActionRquests] SEND_ACTION_SUCCESS';
export const SEND_ACTION_FAILED = '[ActionRquests] SEND_ACTION_FAILED';

export class SendActionAction implements Action {
    readonly type = SEND_ACTION;

    constructor(public payload: {configId: string, actionType: string}) {};
}

export class SendActionSuccessAction implements Action {
    readonly type = SEND_ACTION_SUCCESS;

    constructor(public payload: {configId: string, actionType: string}) {};
}

export class SendActionFailedAction implements Action {
    readonly type = SEND_ACTION_FAILED;

    constructor(public payload: {
        configId: string,
        actionType: string,
        message: string,
        error: any}) {};
}

export type Actions
    = SendActionAction
    | SendActionSuccessAction
    | SendActionFailedAction;
