export interface RequestState {
    loading: boolean;
    loaded: boolean;
    message: string;
    error: any;
}

export class RequestNullState implements RequestState{
    loading = false;
    loaded = false;
    message = '';
    error = null;
}

export class RequestInitiatedState implements RequestState{
    loading = true;
    loaded = false;
    message = 'Waiting';
    error = null;
}

export class RequestSuccessState implements RequestState{
    loading = false;
    loaded = true;
    message = 'OK';
    error = null;
}

export class RequestCanceledState implements RequestState{
    loading = false;
    loaded = false;
    message = 'Canceled';
    error = null;
}


export class RequestFailedState implements RequestState{
    loading = false;
    loaded = false;

    constructor(public message: string, public error: any) {};
}
