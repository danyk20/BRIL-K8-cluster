export const SANDBOX_PATH = '/--sandbox';

export class PresetRoute {
    title?: string;
    path: string;
    config_url: string;
}

export const ROUTES: Array<PresetRoute> = [{
    title: 'Summary',
    path: '/summary',
    config_url: 'assets/presets/summary.json'
}, {
    title: 'Luminosity',
    path: '/lumi',
    config_url: 'assets/presets/lumi.json'
}, {
    title: 'Per bunch luminosity',
    path: '/bxlumi',
    config_url: 'assets/presets/bxlumi.json'
}, {
    title: 'Pileup',
    path: '/pileup',
    config_url: 'assets/presets/pileup.json'
}, {
    title: 'BPTX',
    path: '/bptx',
    config_url: 'assets/presets/bptx.json'
}, {
    title: 'BCML',
    path: '/bcml',
    config_url: 'assets/presets/bcml.json'
}, {
    title: 'BCML Prototype',
    path: '/bcml_prototype',
    config_url: 'assets/presets/bcml_prototype.json'
}, {
    path: '/bcml90',
    config_url: 'assets/presets/bcml.json'
}, {
    title: 'BCM1FUTCA',
    path: '/bcm1futca',
    config_url: 'assets/presets/bcm1futca.json'
}, {
    title: 'BCM1FUTCA RATES',
    path: '/bcm1futca_rates',
    config_url: 'assets/presets/bcm1futca_rates.json'
},{
    title: 'BCM1F VME',
    path: '/bcm1fvme',
    config_url: 'assets/presets/bcm1fvme.json'
},{
    title: 'BCM1F VME Rates',
    path: '/bcm1frhu',
    config_url: 'assets/presets/bcm1frhu.json'
}, {
    title: 'BCM1F VME ADC',
    path: '/bcm1fadc',
    config_url: 'assets/presets/bcm1fadc.json'
}, {
    title: 'Background',
    path: '/background',
    config_url: 'assets/presets/background.json'
}, {
    title: 'HF',
    path: '/hf',
    config_url: 'assets/presets/hf.json'
}, {
    title: 'PLT',
    path: '/plt',
    config_url: 'assets/presets/plt.json'
}, {
    title: 'PLT offline',
    path: '/plt-offline',
    config_url: 'assets/presets/plt_offline.json'
}, {
    title: 'PLTSLINK',
    path: '/pltslink',
    config_url: 'assets/presets/pltslink.json'
}, {
    title: 'VDM online',
    path: '/vdm-online',
    config_url: 'assets/presets/vdm-online.json'
}, {
    title: 'VDM offline',
    path: '/vdm-offline',
    config_url: 'assets/presets/vdm-offline.json'
}, {
    title: 'VDM offline PLT',
    path: '/vdm-offline-plt',
    config_url: 'assets/presets/vdm-offline-plt.json'
}, {
    title: 'VDM offline BCM1FUTCA',
    path: '/vdm-offline-bcm1futca',
    config_url: 'assets/presets/vdm-offline-bcm1futca.json'
}, {
    title: 'REMUS',
    path: '/remus',
    config_url: 'assets/presets/remus.json'
}, {
    path: '/bril-hosts',
    config_url: 'assets/presets/bril-hosts.json'
}, {
    path: '/test',
    config_url: 'assets/presets/test.json'
}];
