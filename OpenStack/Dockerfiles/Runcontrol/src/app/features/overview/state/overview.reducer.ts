import * as actions from './overview.actions';

export interface State {
    selectedRCMSUser: string;
}

export const initialState: State = {
    selectedRCMSUser: 'lumipro'
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.SELECT_RCMS_USER: {
        return Object.assign({}, state, {selectedRCMSUser: action.payload});
    }
    default:
        return state;
    }
}

export const selectRCMSUser = (state: State) => state.selectedRCMSUser;
