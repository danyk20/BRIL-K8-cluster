export interface RunningDetails {
    version: number;
    resGID: number;
    URI: string;
}

export class STATES {
    static ON = 'ON';
    static OFF = 'OFF';
    static NO_FM = 'NO_FM';
    static UNKNOWN = 'UNKNOWN';
    static ERROR = 'Error';
    static TURNING_ON = 'GoingOn';
    static TURNING_OFF = 'GoingOff';
    static RESETTING = 'Resetting';

    static stateIsStable(state) {
        return state === STATES.ON || state === STATES.OFF ||
            state === STATES.NO_FM || state === STATES.ERROR ||
            state === STATES.UNKNOWN;
    }

}
