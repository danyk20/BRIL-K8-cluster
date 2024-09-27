import { Action } from '@ngrx/store';

export const SWITCH_MODE = '[Editor] SWITCH_MODE';

export const REQUEST_FINAL_XML = '[Editor] REQUEST_FINAL_XML';
export const REQUEST_XML_FROM_FIELDS = '[Editor] REQUEST_XML_FROM_FIELDS';
export const SUCCESS_REQUEST_XML = '[Editor] SUCCESS_REQUEST_XML';
export const FAIL_REQUEST_XML = '[Editor] FAIL_REQUEST_XML';

export const SUBMIT_XML = '[Editor] SUBMIT_XML';
export const SUBMIT_FIELDS = '[Editor] SUBMIT_FIELDS';
export const SUCCESS_SUBMIT = '[Editor] SUCCESS_SUBMIT';
export const FAIL_SUBMIT = '[Editor] FAIL_SUBMIT';

export const CLOSE_XML_VIEW_MODAL = '[Editor] CLOSE_XML_VIEW_MODAL';
export const CLOSE_RESPONSE_MODAL = '[Editor] CLOSE_RESPONSE_MODAL';
export const CLOSE_CONFIRM_MODAL = '[Editor] CLOSE_CONFIRM_MODAL';

export class SwitchModeAction implements Action {
    readonly type = SWITCH_MODE;

    constructor(public payload: string) {};
}

export class RequestFinalXMLAction implements Action {
    readonly type = REQUEST_FINAL_XML;

    constructor(public payload: {
        path: string, version: number, xml: string, executive: any}) {};
}

export class RequestXMLFromFieldsAction implements Action {
    readonly type = REQUEST_XML_FROM_FIELDS;

    constructor(public payload: {path: string, version: number, fields: any}) {};
}

export class SuccessRequestXMLAction implements Action {
    readonly type = SUCCESS_REQUEST_XML;

    constructor(public payload: {xml: string}) {};
}

export class FailRequestXMLAction implements Action {
    readonly type = FAIL_REQUEST_XML;

    constructor(public payload: {response: any}) {};
}

export class SubmitXMLAction implements Action {
    readonly type = SUBMIT_XML;

    constructor(
        public payload: {
            comment: string,
            path: string,
            version: number,
            xml: string,
            executive: any
        }
    ) {};
}

export class SubmitFieldsAction implements Action {
    readonly type = SUBMIT_FIELDS;

    constructor(
        public payload: {
            comment: string,
            path: string,
            version: number,
            fields: any
        }
    ) {};
}

export class SuccessSubmitAction implements Action {
    readonly type = SUCCESS_SUBMIT;

    constructor(public payload: {response: any}) {};
}

export class FailSubmitAction implements Action {
    readonly type = FAIL_SUBMIT;

    constructor(public payload: {response: any}) {};
}

export class CloseXMLViewModalAction implements Action {
    readonly type = CLOSE_XML_VIEW_MODAL;
}

export class CloseResponseModalAction implements Action {
    readonly type = CLOSE_RESPONSE_MODAL;
}

export class CloseConfirmModalAction implements Action {
    readonly type = CLOSE_CONFIRM_MODAL;
}

export type Actions =
    SwitchModeAction |
    RequestFinalXMLAction |
    RequestXMLFromFieldsAction |
    SuccessRequestXMLAction |
    FailRequestXMLAction |
    SubmitFieldsAction |
    SubmitXMLAction |
    SuccessSubmitAction |
    FailSubmitAction |
    CloseConfirmModalAction |
    CloseResponseModalAction |
    CloseXMLViewModalAction;
