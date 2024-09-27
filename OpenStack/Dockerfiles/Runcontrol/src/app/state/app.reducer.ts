import * as actions from './app.actions';
import { Alert, AlertAction } from '../models/alert';

export interface State {
    alerts: {
        entities: Array<Alert>,
        handleAlert: boolean,
        handleAction: AlertAction
    },
    modals: ModalsState,
    newestBuildNumber: number
}

export const initialState: State = {
    alerts: {
        entities: [],
        handleAlert: false,
        handleAction: undefined
    },
    modals: {
        modalNameCookie: {open: false},
        modalAppRefresh: {open: false},
        modalTest: {open: false}
    },
    newestBuildNumber: -1
};

export type ModalsState = {
    modalNameCookie: ModalState;
    modalAppRefresh: ModalState;
    modalTest: ModalState;
};

export type ModalState = {
    open: boolean
};

export const alertTypeSeverity = {
    success: 0,
    info: 1,
    warning: 2,
    danger: 3
}

export function severityComparator(a: Alert, b: Alert) {
    return alertTypeSeverity[a.type] - alertTypeSeverity[b.type];
}

export function reverseSeverityComparator(a: Alert, b: Alert) {
    return severityComparator(a, b) * -1;
}

export function insertAlertSorted(alerts: Array<Alert>, newAlert: Alert) {
    if (!alerts) {
        return [newAlert];
    }
    const newAlerts = alerts.slice(0);
    newAlerts.push(newAlert);
    newAlerts.sort(reverseSeverityComparator);
    return newAlerts;
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.ADD_ALERT: {
        const newEntities = insertAlertSorted(state.alerts.entities, action.payload);
        const newAlerts = Object.assign({}, state.alerts, {entities: newEntities});
        return Object.assign({}, state, {alerts: newAlerts});
    }
    case actions.HANDLE_ALERT: {
        const index = state.alerts.entities.indexOf(action.payload.alert);
        let newAlerts;
        if (index < 0) {
            const update = {handleAlert: false, handleAction: undefined};
            newAlerts = Object.assign({}, state.alerts, update);
        } else {
            const newEntities = state.alerts.entities.slice()
            newEntities.splice(index, 1);
            const update = {
                entities: newEntities,
                handleAlert: true,
                handleAction: action.payload.alert.actions[action.payload.actionName]
            }
            newAlerts = Object.assign({}, state.alerts, update);
        }
        return Object.assign({}, state, {alerts: newAlerts});
    }
    case actions.OPEN_MODAL: {
        const newModals = Object.assign({}, state.modals);
        newModals[action.payload.id] = {open: true};
        return Object.assign({}, state, {modals: newModals});
    }
    case actions.CLOSE_MODAL:
    case actions.MODAL_CLOSED: {
        if (state.modals.hasOwnProperty(action.payload.id)) {
            if (state.modals[action.payload.id].open) {
                const newModals = Object.assign({}, state.modals);
                newModals[action.payload.id] = {open: false};
                return Object.assign({}, state, {modals: newModals});
            }
        }
        return state
    }
    case actions.SUCCESS_GET_BUILD_NUMBER: {
        return Object.assign({}, state, {newestBuildNumber: action.payload});
    }
    case actions.FAIL_GET_BUILD_NUMBER: {
        return Object.assign({}, state, {newestBuildNumber: -1});
    }
    default:
        return state;
    }
}

export const selectAlerts = (state: State) => state.alerts;
export const selectAlertsEntities = (state: State) => state.alerts.entities;
export const selectModals = (state: State) => state.modals;
export const selectBuildNumber = (state: State) => state.newestBuildNumber;
