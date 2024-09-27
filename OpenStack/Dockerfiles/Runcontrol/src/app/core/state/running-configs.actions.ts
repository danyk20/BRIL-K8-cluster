import { Action } from '@ngrx/store';

export const UPDATE = '[Running] UPDATE';
export const UPDATE_CANCEL = '[Running] UPDATE_CANCEL';
export const UPDATE_SUCCESS = '[Running] UPDATE_SUCCESS';
export const UPDATE_FAILED = '[Running] UPDATE_FAILED';
export const UPDATE_STATES = '[Running] UPDATE_STATES';
export const UPDATE_STATES_CANCEL = '[Running] UPDATE_STATES_CANCEL';
export const UPDATE_STATES_SUCCESS = '[Running] UPDATE_STATES_SUCCESS';
export const UPDATE_STATES_FAILED = '[Running] UPDATE_STATES_FAILED';

export class UpdateAction implements Action {
    readonly type = UPDATE;

    constructor(public payload: string) {}
}

export class UpdateCancelAction implements Action {
    readonly type = UPDATE_CANCEL;

    constructor(public payload: void) {}
}

export class UpdateSuccessAction implements Action {
    readonly type = UPDATE_SUCCESS;

    constructor(public payload: {result: any, rcmsUser: string}) {}
}

export class UpdateFailedAction implements Action {
    readonly type = UPDATE_FAILED;

    constructor(public payload: {message: string, error: any}) {}
}

export class UpdateStatesAction implements Action {
    readonly type = UPDATE_STATES;

    constructor(public payload: Array<string>) {}
}

export class UpdateStatesCancelAction implements Action {
    readonly type = UPDATE_STATES_CANCEL;

    constructor(public payload: void) {}
}

export class UpdateStatesSuccessAction implements Action {
    readonly type = UPDATE_STATES_SUCCESS;

    constructor(public payload: any) {}
}

export class UpdateStatesFailedAction implements Action {
    readonly type = UPDATE_STATES_FAILED;

    constructor(public payload: {message: string, error: any}) {}
}

export type Actions
    = UpdateAction
    | UpdateCancelAction
    | UpdateSuccessAction
    | UpdateFailedAction
    | UpdateStatesAction
    | UpdateStatesCancelAction
    | UpdateStatesSuccessAction
    | UpdateStatesFailedAction;
