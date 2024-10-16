export { environment } from 'app/../environments/environment';

export const DATA_SOURCES = {
    'DEFAULT': {
        'endpoint': 'http://srv-s2d16-22-01.cms:9200'
    },
    'main_daq_monitoring': {
        'endpoint': 'http://srv-s2d16-22-01.cms:9200'
    },
    'analysis_store': {
        'endpoint': 'http://srv-s2d16-25-01.cms:9200'
    }
}

export const initialSandboxPreset = {
    widgets: [{
        type: 'static-label',
        config: {
            container: {
                width: 100
            },
            widget: {
                pretext: undefined,
                maintext: 'SANDBOX',
                posttext: 'Sandbox is for importing custom dashboard presets. Go to "Settings" -> "Preset import"'
            }
        }
    }]
};
