import { RequestState } from './request-state';

export interface ActionRequest {
    actionType: string;
    state: RequestState;
    ignore: boolean;
}
