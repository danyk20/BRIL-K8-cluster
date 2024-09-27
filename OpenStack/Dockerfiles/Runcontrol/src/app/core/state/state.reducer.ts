import { ActionReducer } from '@ngrx/store';
import * as configsReducer from './configurations.reducer';
import * as runningReducer from './running-configs.reducer';
import * as configDetailsReducer from './config-details.reducer';
import * as actionRequestsReducer from './action-requests.reducer';
import * as historyReducer from './history.reducer';

export interface State {
    configs: configsReducer.State;
    running: runningReducer.State;
    configDetails: configDetailsReducer.State;
    actionRequests: actionRequestsReducer.State;
    history: historyReducer.State;
}

export const reducers = {
    configs: configsReducer.reducer,
    running: runningReducer.reducer,
    configDetails: configDetailsReducer.reducer,
    actionRequests: actionRequestsReducer.reducer,
    history: historyReducer.reducer
};

export function makeLoggingReducer(reducer) {
    return function(state, action) {
        console.log(action);
        return reducer(state, action);
    }
}

export const selectConfigsIds = state => configsReducer.selectIds(state.configs);
export const selectConfigsEntities = state => configsReducer.selectEntities(state.configs);
export const selectConfigsRequest = state => configsReducer.selectRequest(state.configs);

export const selectRunningIds = state => runningReducer.selectIds(state.running);
export const selectRunningEntities = state => runningReducer.selectRunning(state.running);
export const selectRunningStates = state => runningReducer.selectStates(state.running);
export const selectRunningRequest = state => runningReducer.selectRequestRunning(state.running);
export const selectRunningRequestStates = state => runningReducer.selectRequestStates(state.running);

export const selectConfigDetailsIds = state => configDetailsReducer.selectIds(state.configDetails);
export const selectConfigDetailsEntities = state => configDetailsReducer.selectEntities(state.configDetails);
export const selectConfigDetailsRequests = state => configDetailsReducer.selectRequests(state.configDetails);
export function selectConfigDetailsById(id) {
    return state => configDetailsReducer.selectEntitiesById(id)(state.configDetails);
}
export function selectConfigDetailsRequestById(id) {
    return state => configDetailsReducer.selectRequestById(id)(state.configDetails);
}

export const selectActionRequests = state => actionRequestsReducer.selectRequests(state.actionRequests);

export const selectHistoryIds = state => historyReducer.selectIds(state.history);
export const selectHistoryEntities = state => historyReducer.selectHistory(state.history);
export const selectHistoryRequests = state => historyReducer.selectRequests(state.history);
export function selectHistoryById(id) {
    return state => historyReducer.selectHistoryById(id)(state.history);
}
export function selectHistoryRequestById(id) {
    return state => historyReducer.selectRequestById(id)(state.history);
}
