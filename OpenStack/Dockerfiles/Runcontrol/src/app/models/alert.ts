import { Action } from '@ngrx/store';

export interface AlertAction {
    text: string;
    action: Action;
}

export interface Alert {
    type: "success" | "info" | "warning" | "danger";
    text: string;
    closable: boolean;
    actions: {
        closeAction: AlertAction | undefined,
        firstAction: AlertAction | undefined,
        secondAction: AlertAction | undefined
    }
}

export type AlertActionNames = 'closeAction' | 'firstAction' | 'secondAction';
