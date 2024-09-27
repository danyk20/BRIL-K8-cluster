import { Action } from '@ngrx/store';

export const SELECT_RCMS_USER = '[Overview] SELECT_RCMS_USER';

export class SelectRCMSUserAction implements Action {
    readonly type = SELECT_RCMS_USER;

    constructor(public payload: string) {};
}

export type Actions
    = SelectRCMSUserAction;
