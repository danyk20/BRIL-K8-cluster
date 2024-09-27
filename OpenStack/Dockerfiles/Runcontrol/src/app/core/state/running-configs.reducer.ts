import { RunningDetails } from '../models/running-details';
import {
    RequestState, RequestInitiatedState, RequestFailedState,
    RequestCanceledState, RequestSuccessState, RequestNullState
} from '../models/request-state';
import * as actions from './running-configs.actions';

export interface State {
    ids: string[];
    running: {  string: RunningDetails } | {};
    states: { string: string } | {};
    rcmsUser: string;
    requestRunning: RequestState;
    requestStates: RequestState;
}

export const initialState: State = {
    ids: [],
    running: {},
    states: {},
    rcmsUser: '',
    requestRunning: new RequestNullState(),
    requestStates: new RequestNullState()
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.UPDATE: {
        return Object.assign({}, state, {
            requestRunning: new RequestInitiatedState()
        });
    }
    case actions.UPDATE_CANCEL: {
        return Object.assign({}, state, {
            requestRunning: new RequestCanceledState()
        });
    }
    case actions.UPDATE_SUCCESS: {
        let newRunning = action.payload.result;
        let newIds = Object.keys(newRunning);
        if (JSON.stringify(newRunning) === JSON.stringify(state.running)) {
            newRunning = state.running;
            newIds = state.ids;
        }
        return Object.assign({}, state, {
            ids: newIds,
            running: newRunning,
            rcmsUser: action.payload.rcmsUser,
            requestRunning: new RequestSuccessState()
        });
    }
    case actions.UPDATE_FAILED: {
        return Object.assign({}, state, {
            ids: [],
            running: {},
            states: {},
            requestRunning: new RequestFailedState(
                action.payload.message, action.payload.error)
        });
    }

    case actions.UPDATE_STATES: {
        return Object.assign({}, state, {requestStates: new RequestInitiatedState()});
    }
    case actions.UPDATE_STATES_CANCEL: {
        return Object.assign({}, state, {requestStates: new RequestCanceledState()});
    }
    case actions.UPDATE_STATES_SUCCESS: {
        const newStates = {};
        state.ids.forEach(id => {
            newStates[id] = action.payload[state.running[id].URI]
        });
        return Object.assign({}, state, {
            states: newStates,
            requestStates: new RequestSuccessState()
        });
    }
    case actions.UPDATE_STATES_FAILED: {
        return Object.assign({}, state, {
            states: {},
            requestStates: new RequestFailedState(
                action.payload.message, action.payload.error)
        });
    }


    default:
        return state;
    }
}

export const selectIds = (state: State) => state.ids;
export const selectRunning = (state: State) => state.running;
export const selectStates = (state: State) => state.states;
export const selectRequestRunning = (state: State) => state.requestRunning;
export const selectRequestStates = (state: State) => state.requestStates;
