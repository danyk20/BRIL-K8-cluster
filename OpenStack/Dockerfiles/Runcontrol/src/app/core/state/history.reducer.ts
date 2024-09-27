import {
    RequestState, RequestInitiatedState, RequestFailedState,
    RequestCanceledState, RequestSuccessState, RequestNullState
} from '../models/request-state';
import * as actions from './history.actions';

export interface State {
    ids: string[];
    history: {string: Array<any>} | {};
    requests: {
        [id: string]: {
            state: RequestState,
            forNewest: boolean,
            ignore: boolean
        }
    };
}

export const initialState: State = {
    ids: [],
    history: {},
    requests: {},
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.GET_NEWEST: {
        const exists = state.ids.indexOf(action.payload.configId) > -1;
        const newState = Object.assign({}, state);
        if (!exists) {
            newState.ids = state.ids.slice();
            newState.ids.push(action.payload.configId);
            newState.history = Object.assign({}, state.history);
            newState.history[action.payload.configId] = [];
        }
        const newRequests = Object.assign({}, state.requests);
        newRequests[action.payload.configId] = {
            state: new RequestInitiatedState(),
            forNewest: true,
            ignore: false
        }
        newState.requests = newRequests;
        return newState;
    }
    case actions.GET_OLDER: {
        const newRequests = Object.assign({}, state.requests);
        if (state.requests.hasOwnProperty(action.payload.configId)) {
            if (!state.requests[action.payload.configId].state.loading) {
                newRequests[action.payload.configId] = {
                    state: new RequestInitiatedState(),
                    forNewest: false,
                    ignore: false
                }
                return Object.assign({}, state, {requests: newRequests});
            }
        }
        newRequests[action.payload.configId].ignore = true;
        return Object.assign({}, state, {requests: newRequests});
    }
    case actions.GET_SUCCESS: {
        const newRequests = Object.assign({}, state.requests);
        newRequests[action.payload.configId] = {
            state: new RequestSuccessState(),
            forNewest: action.payload.forNewest,
            ignore: false
        }
        const newHistory = Object.assign({}, state.history);
        if (action.payload.forNewest) {
            newHistory[action.payload.configId] = action.payload.result;
        } else {
            newHistory[action.payload.configId] =
                newHistory[action.payload.configId].concat(action.payload.result);
        }
        return Object.assign({}, state, {
            history: newHistory,
            requests: newRequests
        });
    }
    case actions.GET_FAILED: {
        const newRequests = Object.assign({}, state.requests);
        newRequests[action.payload.configId] = Object.assign(
            {},
            newRequests[action.payload.configId],
            {
                state: new RequestFailedState(
                    action.payload.message, action.payload.error)
            }
        );
        return Object.assign({}, state, {requests: newRequests});
    }
    default:
        return state;
    }
}

export const selectIds = (state: State) => state.ids;
export const selectHistory = (state: State) => state.history;
export const selectRequests = (state: State) => state.requests;
export const selectHistoryById = (id: string) => {
    return (state: State) => state.history[id]
};
export const selectRequestById = (id: string) => {
    return (state: State) => state.requests[id]
};
