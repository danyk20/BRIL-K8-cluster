import { QueryEvent } from 'app/shared/query-event';
import { saveAs } from "file-saver";

declare var Plotly: any;

export type LegendPresetOptions = 'outside-left' | 'left' | 'outside-right' | 'right' | 'horizontal';

export interface DateRangeEvent {
    from: Date;
    to: Date;
    tsFrom: number;
    tsTo: number;
    msecFrom: number;
    msecTo: number;
    strFrom: string;
    strTo: string;
    utc: boolean;
}

export interface DateRangeQueryEvent extends DateRangeEvent, QueryEvent {}

export type FieldSeparatorConfig = {
    fieldname: string;
    lineColor: string;
    lineWidth: number;
    lineDash?: string;
    text: string;
    excludeWhenAggregated?: boolean;
}

export type TooltipInfoField = {
    fieldname: string;
    text?: string;
}

export const buttonDownloadImage = {
    name: 'toImage',
    title: 'Download plot as a png',
    icon: Plotly.Icons.camera,
    click: function(gd) {
        const opts = {
            format: 'png',
            width: 900,
            height: 600
        };
        Plotly.downloadImage(gd, opts);
    }
};

export const buttonDownloadCsv = {
    name: "downloadCsv",
    title: "Download plot as csv",
    icon: Plotly.Icons.disk,
    click: function (gd) {
      let extraKeys = [];
      let columnNames = [];

      let legendNameAvailable = false;
      let _extraAvailable = false;
      let errorYAvailable = false;
      let zAxisAvailable = false;

      if (gd.layout.xaxis.title !== undefined) {
        columnNames.push(gd.layout.xaxis.title.text);
      }else {
        columnNames.push("xaxis");
      }

      if (gd.layout.yaxis.title !== undefined) {
        columnNames.push(gd.layout.yaxis.title.text);
      }else {
        columnNames.push("yaxis");
      }

      if (gd.data[0].z !== undefined && gd.data[0].z.length) {
        zAxisAvailable = true;
        columnNames[0] = columnNames[1] + ' \\ ' + columnNames[0];
        delete columnNames[1];
        gd.data[0].x.forEach((xvalue, i) => {
            columnNames[i+1] = xvalue;
        });
      }

      if ("error_y" in gd.data[0]) {
        columnNames.push("error_y")
        errorYAvailable = true;
      }

      if ("name" in gd.data[0]) {
        columnNames.push("legendNames")
        legendNameAvailable = true;
      }
      
      if ("_extra" in gd.data[0]) {
        extraKeys = Object.keys(gd.data[0]._extra);
        
        const index = extraKeys.indexOf("errors", 0);
        if (index > -1 && errorYAvailable) {
            extraKeys.splice(index, 1);
        }
        columnNames = columnNames.concat(extraKeys);
        _extraAvailable = true;
      }

      let csvData = [
        columnNames.join(
          ","
        ),
      ];

      if (gd.data[0].type === "heatmap") {
        gd.data[0].y.forEach((yvalue, i) => {
            let row = [yvalue]; 
            gd.data[0].z[i].forEach((zvalue, j) => {
                row.push(zvalue);                                
            });
            csvData.push(row.join(","));
        });

      }else {
        gd.data[0].x.forEach((xvalue, i) => {
            gd.data.forEach(dataArray => {
                let row = [dataArray.x[i], dataArray.y[i]];
            
                if (zAxisAvailable) row.push(dataArray.z[i]);
                if (errorYAvailable) row.push(dataArray.error_y.array[i]);
                if (legendNameAvailable) row.push(dataArray.name);
                
                if (_extraAvailable) {
                    extraKeys.forEach((extraKey) => {
                        
                        row.push(dataArray._extra[extraKey][i]);
                    });            
                }

                csvData.push(row.join(","));
            });
        });
      }

      let blob = new Blob([csvData.join("\r\n")], { type: "text/csv" });

      saveAs(
        blob,
        "export.csv"
      );
    }
};

export function getDefaultLayout() {
    return {
        margin: {
            b: 48,
            l: 60,
            r: 36,
            t: 12
        },
        showlegend: true,
        legend: {
            orientation: 'v',
            bgcolor: '#EAFAFF90',
            bordercolor: 'whitesmoke',
            borderwidth: 1
        },
        autosize: true
    };
}

export function configureDefaultLayout(widget) {
    const layout = getDefaultLayout();
    const update = {
        xaxis: {
            title: "Date UTC",
            type: "date"
        },
        yaxis: {
            title: widget['yAxisTitle'],
            type: widget['yAxisScale'] || 'lin'
        },
        legend: getLegendConfig(widget['legend'])
        }
        if (widget['yAxis2Enabled']) {
            update['yaxis2'] = {
                title: widget['yAxis2Title'],
                type: widget['yAxisScale'] || 'lin',
                overlaying: 'y',
                side: 'right'
            }
        }
        if (widget['scientific']) {
            update['yaxis']['showexponent'] = 'all';
            update['yaxis']['exponentformat'] = 'E';
        }
    return Object.assign(layout, update);
}

export function getLegendConfig(preset: LegendPresetOptions) {
    const common = {
        orientation: 'v',
        bgcolor: '#EAFAFFC0',
        bordercolor: 'whitesmoke',
        borderwidth: 1
    }
    let update;
    switch(preset) {
    case 'outside-left': {
        update = {x: -0.05, xanchor: 'right'};
        break;
    }
    case 'left': {
        update = {x: 0, xanchor: 'left'};
        break;
    }
    case 'outside-right': {
        update = {x: 1, xanchor: 'left', y: 0.97, yanchor: 'top'};
        break;
    }
    case 'right': {
        update = {x: 1, xanchor: 'right', y: 0.97, yanchor: 'top'};
        break;
    }
    case 'horizontal': {
        update = {orientation: 'h'};
        break;
    }
    default: {
        update = {x: 1, xanchor: 'left', y: 0.97, yanchor: 'top'};
    }
    }
    return Object.assign(common, update);
}


export function getDefaultConfig() {
    return {
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'toImage'],
        modeBarButtonsToAdd: [buttonDownloadImage, buttonDownloadCsv],
        displaylogo: false
    }
}

export function disableNavigation2d(layout, config) {
    const xaxis = layout['xaxis'] = layout['xaxis'] || {};
    xaxis['fixedrange'] = true;
    xaxis['autorange'] = false;
    config['modeBarButtonsToRemove'] = [
        'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'select2d'
    ].concat(config['modeBarButtonsToRemove']);
}

export function makeDefaultReflowFunction(element) {
    return () => {
        setTimeout(() => {
            Plotly.relayout(element, {width: null, height: null});
        });
    }
}

export function subscribeReflow(eventBus, reflow) {
    return eventBus.getEvents(0, 'global_reflow').subscribe(reflow);
}

export function setAutorange(layout) {
    const xaxis = layout['xaxis'] = (layout['xaxis'] || {});
    const yaxis = layout['yaxis'] = (layout['yaxis'] || {});
    xaxis['autorange'] = true;
    xaxis['range'] = undefined;
    yaxis['autorange'] = true;
    yaxis['range'] = undefined;
    return {xaxis: xaxis, yaxis: yaxis};
}

export function setXRange(layout, min, max) {
    const xaxis = layout['xaxis'] = (layout['xaxis'] || {});
    const newRange = [min, max];
    xaxis['range'] = newRange;
    xaxis['autorange'] = false;
    return {xaxis: xaxis};
}

export function detectWebGLContext() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    let detected = false;
    if (gl && gl instanceof WebGLRenderingContext) {
        detected = true;
    }
    canvas.remove();
    return detected;
}

export function parseUNIXTimestamp(ts) {
    return new Date(ts*1000);
}

export function parseStringTimestamp(ts) {
    return new Date(ts);
}

export function makeQueryRangeFromZoomEvent(event): DateRangeEvent {
    if (!event['xaxis.range[0]'] || !event['xaxis.range[1]']) {
        return undefined;
    }
    const min = event['xaxis.range[0]'] + 'Z';
    const max = event['xaxis.range[1]'] + 'Z';
    return {
        'from': new Date(min),
        'to': new Date(max),
        'tsFrom': (new Date(min)).getTime() / 1000,
        'tsTo': (new Date(max)).getTime() / 1000,
        'msecFrom': (new Date(min)).getTime(),
        'msecTo': (new Date(max)).getTime(),
        'strFrom': (new Date(min)).toISOString().split('.')[0] + 'Z',
        'strTo': (new Date(max)).toISOString().split('.')[0] + 'Z',
        'utc': true
    };
}

export function makeQueryRangeFromStrings(min, max): DateRangeEvent {
    return {
        'from': new Date(min),
        'to': new Date(max),
        'tsFrom': (new Date(min)).getTime() / 1000,
        'tsTo': (new Date(max)).getTime() / 1000,
        'msecFrom': (new Date(min)).getTime(),
        'msecTo': (new Date(max)).getTime(),
        'strFrom': min,
        'strTo': max,
        'utc': true
    };
}

function getFieldChanges(chartData, fields: Array<FieldSeparatorConfig>) {
    const changes = [];
    chartData.forEach(series => {
        if (!series['_extra']) {
            return;
        }
        const perSeries = {};
        fields.forEach(field => {
            if (!series['_extra'][field.fieldname]) {
                return;
            }
            const values = series['_extra'][field.fieldname];
            const perField = [];
            values.forEach((v, i) => {
                if (i === 0) {
                    perField.push({
                        changedFrom: undefined,
                        changedTo: v,
                        index: i,
                        x: series.x[i],
                        x_ts: (new Date(series.x[i])).getTime()
                    });
                    return;
                }
                if (values[i-1] !== v && typeof v != 'undefined') {
                    perField.push({
                        changedFrom: values[i-1],
                        changedTo: v,
                        index: i,
                        x: series.x[i],
                        x_ts: (new Date(series.x[i])).getTime()
                    });
                }
            });
            perSeries[field.fieldname] = perField;
        });
        changes.push(perSeries);
    });
    return changes;
}

function filterGlobalFieldChanges(changes, fields: Array<FieldSeparatorConfig>) {
    function tsSort(a, b) {
        if (a.x_ts < b.x_ts) {
            return -1;
        }
        if (a.x_ts > b.x_ts) {
            return 1;
        }
        return 0;
    };
    const globalChanges = {};
    fields.forEach(field => {
        let fromAllSeries = [];
        changes.forEach(perSeries => {
            if (!perSeries[field.fieldname]) {
                return;
            }
            fromAllSeries = fromAllSeries.concat(perSeries[field.fieldname]);
        });
        fromAllSeries.sort(tsSort);
        const filtered = [];
        fromAllSeries.forEach(v => {
            if (!filtered.length) {
                filtered.push(v);
                return;
            }
            if (v['changedTo'] !== filtered[filtered.length -1]['changedTo']) {
                filtered.push(v);
            }
        });
        if (filtered.length > 0 && filtered[0]['index'] === 0) {
            filtered.shift();
        }
        globalChanges[field.fieldname] = filtered;
    });
    return globalChanges;
}

export function makeSeparatorLines(
    chartData, fields: Array<FieldSeparatorConfig>, aggregated=false) {
    if (aggregated) {
        fields = fields.filter(f => !f.excludeWhenAggregated);
    }
    const changes = getFieldChanges(chartData, fields);
    const globalChanges = filterGlobalFieldChanges(changes, fields);
    const shapes = [];
    const annotations = [];
    fields.forEach(field => {
        globalChanges[field.fieldname].forEach(change => {
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: change['x'],
                x1: change['x'],
                y0: 0,
                y1: 1,
                line: {
                    color: field.lineColor,
                    width: field.lineWidth,
                    dash: field.lineDash
                }
            });
            annotations.push({
                xref: 'x',
                yref: 'paper',
                x: change['x'],
                xanchor: 'left',
                y: 1,
                yanchor: 'top',
                text: (field.text || '') + change['changedTo'],
                textangle: -90,
                showarrow: false
            });
        });
    });
    return {shapes: shapes, annotations: annotations};
}

export function makeTooltipText(chartDataPoint, fields: Array<TooltipInfoField>) {
    if (!fields || fields.length < 1) {
        return '';
    }
    return fields.map(f => {
        if (typeof chartDataPoint[f.fieldname] != 'undefined') {
            return (f.text || f.fieldname) + ': ' + chartDataPoint[f.fieldname];
        } else {
            return undefined;
        }
    }).filter(Boolean).join('<br>');
}
