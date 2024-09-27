import {
    RequestState, RequestInitiatedState, RequestFailedState,
    RequestCanceledState, RequestSuccessState, RequestNullState
} from '@app/core/models/request-state';
import * as actions from './editor.actions';

export interface State {
    editorMode: 'easy' | 'expert';
    XMLViewModal: {
        isOpen: boolean,
        xml: string
    },
    responseModal: {
        title: string,
        isOpen: boolean,
        showLoading: boolean,
        response: any,
    }
}

export const initialState: State = {
    editorMode: 'easy',
    XMLViewModal: {
        isOpen: false,
        xml: ''
    },
    responseModal: {
        title: '',
        isOpen: false,
        showLoading: false,
        response: null
    }
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
    case actions.SWITCH_MODE: {
        return Object.assign({}, state, {editorMode: action.payload});
    }
    case actions.REQUEST_FINAL_XML: {
        const responseModal = {
            title: 'Waiting for final XML to be generated',
            isOpen: true,
            showLoading: true,
            response: null
        }
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.REQUEST_XML_FROM_FIELDS: {
        const responseModal = {
            title: 'Waiting for XML to be generated',
            isOpen: true,
            showLoading: true,
            response: null
        }
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.SUCCESS_REQUEST_XML: {
        const responseModal = Object.assign(
            {},
            state.responseModal,
            {isOpen: false, showLoading: false, message: 'Success', code: null});
        const XMLViewModal = {
            isOpen: true,
            xml: action.payload.xml
        }
        console.log('success', XMLViewModal);
        return Object.assign(
            {},
            state,
            {responseModal: responseModal, XMLViewModal: XMLViewModal});
    }
    case actions.FAIL_REQUEST_XML: {
        const responseModal = {
            title: 'Failed',
            isOpen: true,
            showLoading: false,
            response: action.payload.response,
        }
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.SUBMIT_XML: {
        const responseModal = {
            title: 'Submitting...',
            isOpen: true,
            showLoading: true,
            response: null
        }
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.SUBMIT_FIELDS: {
        const responseModal = {
            title: 'Submitting',
            isOpen: true,
            showLoading: true,
            response: null
        }
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.SUCCESS_SUBMIT: {
        const responseModal = {
            isOpen: true,
            showLoading: false,
            message: 'Success',
            response: action.payload.response
        };
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.FAIL_SUBMIT: {
        const responseModal = {
            isOpen: true,
            showLoading: false,
            message: 'Failed',
            response: action.payload.response
        };
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.CLOSE_RESPONSE_MODAL: {
        const responseModal = Object.assign({}, state.responseModal, {isOpen: false});
        return Object.assign({}, state, {responseModal: responseModal});
    }
    case actions.CLOSE_XML_VIEW_MODAL: {
        const XMLViewModal = Object.assign({}, state.XMLViewModal, {isOpen: false});
        return Object.assign({}, state, {XMLViewModal: XMLViewModal});
    }
    default:
        return state;
    }
}

export const selectMode = (state: State) => state.editorMode;
export const selectXMLViewModal = (state: State) => state.XMLViewModal;
export const selectResponseModal = (state: State) => state.responseModal;
