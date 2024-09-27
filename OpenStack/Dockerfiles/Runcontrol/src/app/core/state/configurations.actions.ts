import { Action } from '@ngrx/store';
import { Configuration } from '../models/configuration';

export const UPDATE = '[Configurations] UPDATE';
export const UPDATE_SUCCESS = '[Configurations] UPDATE_SUCCESS';
export const UPDATE_FAILED = '[Configurations] UPDATE_FAILED';

export class UpdateAction implements Action {
    readonly type = UPDATE;
}

export class UpdateSuccessAction implements Action {
    readonly type = UPDATE_SUCCESS;

    constructor(public payload: any) {}
}

export class UpdateFailedAction implements Action {
    readonly type = UPDATE_FAILED;

    constructor(public payload: {message: string, error: any}) {}
}

export type Actions
    = UpdateAction
    | UpdateSuccessAction
    | UpdateFailedAction;
