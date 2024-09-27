import {
    RequestState, RequestInitiatedState, RequestFailedState,
    RequestCanceledState, RequestSuccessState, RequestNullState
} from '../models/request-state';
import { ActionRequest } from '../models/action-request';
// import * as CONTROL_ACTIONS from '../models/control-actions';
import * as actions from './action-requests.actions';

export interface State {
    requests: {string: ActionRequest} | {};
}

export const initialState: State = {
    requests: {}
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.SEND_ACTION: {
        const newRequests = Object.assign({}, state.requests);
        if (state.requests.hasOwnProperty(action.payload.configId)) {
            if (state.requests[action.payload.configId].state.loading) {
                console.log('SEND_ACTION should be ignored',
                            action.payload.configId, action.payload.actionType);
                newRequests[action.payload.configId].ignore = true;
                return Object.assign({}, state, {requests: newRequests});
            }
        }
        newRequests[action.payload.configId] = {
            actionType: action.payload.actionType,
            state: new RequestInitiatedState(),
            ignore: false
        };
        return Object.assign({}, state, {requests: newRequests});
    }
    case actions.SEND_ACTION_SUCCESS: {
        const newRequests = Object.assign({}, state.requests);
        newRequests[action.payload.configId] = {
            actionType: action.payload.actionType,
            state: new RequestSuccessState(),
            ignore: false
        }
        return Object.assign({}, state, {requests: newRequests});
    }
    case actions.SEND_ACTION_FAILED: {
        const newRequests = Object.assign({}, state.requests);
        newRequests[action.payload.configId] = {
            actionType: action.payload.actionType,
            state: new RequestFailedState(
                action.payload.message, action.payload.error),
            ignore: false
        }
        return Object.assign({}, state, {requests: newRequests});
    }
    default:
        return state;
    }
}

export const selectRequests = (state: State) => state.requests;
