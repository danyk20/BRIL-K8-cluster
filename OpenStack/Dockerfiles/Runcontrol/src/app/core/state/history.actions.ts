import { Action } from '@ngrx/store';

export const GET_NEWEST= '[History] GET_NEWEST_ACTION';
export const GET_OLDER= '[History] GET_OLDER_ACTION';
export const GET_SUCCESS = '[History] GET_SUCCESS_ACTION';
export const GET_FAILED = '[History] GET_FAILED_ACTION';

export class GetNewestHistoryAction implements Action {
    readonly type = GET_NEWEST;

    constructor(public payload: {configId: string, size: number}) {};
}

export class GetOlderHistoryAction implements Action {
    readonly type = GET_OLDER;

    constructor(public payload: {configId: string, size: number}) {};
}

export class GetHistorySuccessAction implements Action {
    readonly type = GET_SUCCESS;

    constructor(public payload: {
        configId: string,
        result: Array<any>,
        forNewest: boolean}) {};
}

export class GetHistoryFailedAction implements Action {
    readonly type = GET_FAILED;

    constructor(public payload: {
        configId: string,
        message: string,
        error: any}) {};
}

export type Actions
    = GetNewestHistoryAction
    | GetOlderHistoryAction
    | GetHistorySuccessAction
    | GetHistoryFailedAction;
