# Architecture overview
The webmonitor is a single-page client-side application built using Angular. It is a tool for interactive BRIL DAQ monitoring.<br>
The application is designed with a plugin pattern at its core. The central component of the application is called "dashboard" and is a host for plugins called "widgets" in the context of the application.

## Definitions and Concepts
- dashboard: The main workspace, a container of widgets
- preset: A dashboard configuration (represented in a JSON file), accessible via a unique route (URL), defining a collection and the layout of widgets for that particular route
- widget: A visual element. An encapsulated unit of data visualisation/querying functionality (most widgets contain a single chart or a query form)
- layout: properties like order and dimensions, width and height, of widgets in a dashboard. It can be modified from the browser by clicking the "Layout mode" button, but after refreshing the page, the default layout will be loaded

In short:
> A **preset** is the configuration of a **dashboard** (which is a visual unit that contains **widgets**, smaller visual units) that is served in a **route** (url).

Example:<br>
The `<server>/summary` URL contains a dashboard that displays the widgets that are defined in `/src/assets/presets/summary.json`.<br>
It contains a Time Query widget (defined in `/src/app/widgets/time-query-widget/`), 7 Numeric Field widgets (defined `src/app/widgets/numeric-field/`) that each has a different title and displays different data and an Array Snapshot widget (defined in `src/app/widgets/array-snapshot`) on the bottom left.

<br>

In the application, most widgets extend `ChartWidget`, but not all.<br>
Each widget is made by many components, mostly shared, and a component that combines all these parts.

In a preset, apart from the widgets and their display layout, the timers used in this dashboard can be configured.<br>
Configurations in widgets are passed down to individual widget implementation so that it can set up itself as needed. One or more timers can be used by the widgets to poll the database at a specific interval.

The presets are the entry-point to configure or make new dashboards. One easy way to play around with presets and see what's happening is to use "import"/"export" configuration. The imported configuration is loaded in the "--sandbox--" route.

## Project structure
- `src/main.ts` - application entry point
- `src/index.html` - top level Angular template
- `src/assets/` - static content
  - `src/assets/presets/` - predefined dashboard configurations
- `src/app/` - application code
  - `src/app/config.ts` - global application configuration
  - `src/app/core/` - core functionality of the application
    - plugin pattern implementation
      - `src/app/core/dashboard` - dashboard setup
      - `src/app/core/dynamic-widget` - widget loading
    - core services (including lower level database querying)
  - `src/app/shared/` - shared functionality and definitions
      - reusable form components
      - `src/app/shared/widget` - general widget component
      - helpers and utilities
  - `src/app/widgets/` - implementations of individual widgets
  - `src/app/app-location/` - in application navigation functionality
  - `src/app/preset-routes.ts` - URL to presets mapping

## Module loading/Routing
The application uses an Angular feature called "lazy loading". This means that components/modules are only loaded when needed and not at the beginning, thus speeding up the application (especially the initIal loading time).<br>
The default lazy loading uses routes to load different modules (for example, `loadChildren: () => import('./items/items.module').then(m => m.ItemsModule)`), but, since our application loads multiple modules on the same route,a custom plugin manager (that lazily loads the modules) is needed.<br>
This is implemented in `src/app/core/dynamic-widget/dynamic-widget.service.ts`.

Inside this file, things happen in the following order:
- The dashboard.component HTML template contains the selector `<wm-dynamic-widget>` that loads the `dynamic-widget.component`.
- When the `dynamic-widget.component` is initialized, it calls the `load()` function.
- The `load()` function uses the `dynamic-widget.service` and outputs an error message if the widget is not able to be loaded.
- The `dynamic-widget.service` has the `loadWidget()` function which loads a module based on the name of the widget:
    - First, the widget name is being passed to the `selectWidget()` function that imports the code.
    - Then, it is being compiled with `compileModuleSync()` to create the factory and create the module's `ngModuleRef`.
    - The `componentFactoryResolver` of the resulting `NgModuleRef` is used to create the components inside the container element (`entryComponent` is specified).
    - Inside this file, there is also a functionality that enables registration of already-loaded modules, so that a module is not being loaded multiple times

There is no `<router-outlet>` because the "default" angular routing is not used.<br>
The routes (that correspond to dashboard presets) are being parsed manually, at `src/app/preset-resolve.service.ts` and `src/app/app.component.ts`.

Essentially, the visual components are structured like this:
- The app entry point (`index.html`) contains `app.component`
- `app.component` contains `dashboard.component`
- `dashboard.component` contains all the widget components that are loaded with the process described above.

There is no need for routing, everything happens on the same page. The URL just defines what widgets will be loaded.

## Data Querying/Aggregation
Each of the chart widget types has its own data service (for example `src/app/widgets/numeric-field/data.service.ts`). That's where the ES queries are defined (on a higher level).

One important parameter in these files is `MAX_QUERY_SIZE`. It is the maximum number of ES docs that can be returned by a single query. Setting this too low can lead to only a small part of the queried data being displayed, even if the query does find the rest.

Since the amount of space (both actual space on the screen and in memory) as well as processing power for each chart is limited, query results longer than a fixed amount are aggregated.<br>
This amount is the parameter `aggregationThreshold` in the chart's config in the preset. Every query of a time range greater than this threshold, will be aggregated. The threshold is usually set to 2h for most 1h and 2h charts. Exceptions:
- Instantaneous lumi charts with LS as the time unit, where the threshold is 12h (this is made possible by the fact that there are a lot less datapoints per time unit since an LS is ~23s)
- pltslink charts, where the threshold is 20h

Aggregation queries have two other important parameters. One is `buckets`, which is set at `1800`. This is the number of bins the aggregated data will go in. So, an aggregation query will always return a fixed number of points that will be aggregations of more neighboring datapoints. The other parameter is the aggregation algorithm. It is called `aggregationAlgo` in the config, and it's value can be things like `avg`, `max` or `sum` (for more look at the documentation below).

As a consequence of the above, `MAX_QUERY_SIZE` has to be more than the number of datapoints allowed by `aggregationThreshold`. Since the latter variable is in milliseconds and not number of datapoints, a conversion is needed depending on the time scale of each chart (whether for example there is a datapoint every lumisection or every 4 nibbles or every second).


# Recipes
## Add/remove/modify preset names/paths
Preset paths are defined in `src/app/preset-routes.ts`. A constant named `ROUTES` describes the available paths in the webmonitor application. Each element of `ROUTES` is defined as follows:

```
title?: string; # Name of the preset visible in the preset selection dropdown (no entry if no title provided)
path: string; # Sub-URL for the preset, e.g. 'http://srv-s2d16-22-01.cms/webmonitor/<path>'
config_url: string; # Configuration json location from the root of the application, e.g. 'assets/presets/my-preset.json'. In theory this url can also be a remote location, but in such case the serving side needs to allow Cross-Origin Resource Sharing
}
```

## Add/remove/modify preset
Presets are stored at `src/assets/presets/`. After adding/removing a preset json config file, one should also update accordingly the preset routes at `src/app/preset-routes.ts`.

## Create new widget
Create a directory in `src/app/widgets` for the new widget. Inside the directory place module and component files of the widget. [`ng generate`](https://angular.io/cli/generate) command can help with this.<br>
Add the widget component to the `entryComponents` in the module's `NgModule` decorator. Make the exported module class define static member `entry` and assign the component to it.

Example:
```
@NgModule({
\\...
declarations: [MyNewWidgetComponent],
entryComponents: [MyNewWidgetComponent]
})
export class MyNewWidgetModule {
static entry = MyNewWidgetComponent;
}
```

Add a new entry to `src/app/widgets/widget-module-selector.ts` so that the new widget will be recognized by dashboards and will be added to the list of modules that can be compiled.<br>Specifying the path and the module name (like with the existing modules) is not completely necessary (at this point only the name is being used).

Also, add a switch case inside `src/app/core/dynamic-widget/dynamic-widget.service.ts`, in the function `selectWidget()` so that the path from which the module code will be loaded is known by the app.<br>
**Note(!)** So far it has not been possible to generate these statements programmatically. Maybe this feature will work with future Angular versions (and for this reason it might be a good idea to keep around an updated `widget-module-selector` object).

For more info see [Developing widgets](#developing-widgets)


# Existing widgets
## Description of common configuration options
Many (not all) widgets have some (not all) of the configuration options listed below. The meaning is explained here not to repeat the same explanations.

```
timestampUNIX: boolean; # Timestamp value in the database (unix or string)
queryChannel: number; # On which event bus channel widget should listen for query events
fieldChangeSeparators: {enabled: boolean, fields: Array<ChartUtils.FieldSeparatorConfig>}; # For which fields to apply vertical separation lines (e.g on run or fill number change)
legend: ChartUtils.LegendPresetOptions; # Chart legend position
database: string; # Database selector form predefined names (e.g. "") or direct http URL
index: string; # Index name in a database
yAxisTitle?: string; # Title for the Y axis of the chart
yAxisScale?: 'lin' | 'log'; # Linear or logarithmic scale for the Y axis
documentType: string; # Document type in a database index
nestedPath?: string; # Path to the fields, if fields are not on the root of the document
timestampField: string; # Name of the timestamp field of the document
refreshSize: number; # Number of documents to query for a refresh action
liveWindow: number; # Amount of milliseconds to maintain x-axis zoom while widget is in auto-update mode (started)
aggregationThreshold: number; # Interval in milliseconds. Queries with date range greater than the interval will be aggregation queries, otherwise simple queries
aggregationAlgo: string; # The aggregation algorithme for the chart. Currently allowed values are "avg", "max", "min", "sum", "extended_stats" and "value_count" (self explanatory). Default fallback is "avg".
histogramAggregatedQuery?: boolean; # The aggregation type used for the chart. If false (default) aggregations are based on the timestamp, if true aggregation can be based on any custom field.
aggregationQueryParams?: Array<any>; # If histogramAggregatedQuery is true then aggregationQueryParams contains the necessary configuration options for the aggregation (eg. field, interval etc).
tooltipInfo?: Array<ChartUtils.TooltipInfoField>; # Custom formatting of the tooltip information ('<text>: <field_value>')
terms?: { string: any }; # Query filter conditions on some fields e.g. 'terms': {'flash_key': '<specific_flashkey>'}
scientific?: boolean; # If this value is set to true, Y axis tick labels will be in scientific E notation (mEn)
```

```
ChartUtils.FieldSeparatorConfig: {
fieldname: string; # Field name on which to detect changes over time
lineColor: string; # Separator line color
lineWidth: number; # Separator line width in pixels
lineDash?: string; # Separator line style ('solid', 'dashed', 'dotted', etc.)
text: string; # Separator value prefix
excludeWhenAggregated?: boolean; # Hide separators on aggregation query results
}
```

```
ChartUtils.LegendPresetOptions: 'outside-left' | 'left' | 'outside-right' | 'right' | 'horizontal';
```

```
ChartUtils.TooltipInfoField: {
fieldname: string;
text?: string; # Text in the tooltip before value (equals to fieldname if undefined)
}
```

## Widget: static-label
Simple widget displaying static text. Configuration:
```
pretext: string;
maintext: string;
posttext: string;
```

Examples in: `app/config.ts` `const initialSandboxPreset`

## Widget: numeric-field
Widget for querying and displaying numeric field values over time. Configuration:
```
timestampUNIX?: boolean;
queryChannel?: number;
fieldChangeSeparators?: {enabled: boolean, fields: Array<ChartUtils.FieldSeparatorConfig>};
legend?: ChartUtils.LegendPresetOptions;
database: string;
yAxisTitle?: string;
yAxisScale?: 'lin' | 'log';
yAxis2Enabled?: boolean; # Enable second Y axis (goes on the right of the chart)
yAxis2Title?: string; # Title for the second Y axis
refreshSize: number;
liveWindow: number;
aggregationThreshold: number;
tooltipInfo?: Array<ChartUtils.TooltipInfoField>;
sources: Array<SourceParameter>; # What to query. See SourceParameter below
fillQueriesEnabled?: boolean; # Enable Fill number query panel and event listener (source fields must have fillField)
runQueriesEnabled?: boolean; # Enable Run number query panel and event listener (source fields must have runField)
rangeQueries?: Array<{fieldname: string, label?: string}>; # Enable additional (non-date-range) range queries
rangeRefresh?: { # Make refresh query retrieve maximum of some field and then query a range from the maximum
queryDetectors?: boolean; # Enable quering for the detector names
queryFits?: boolean; # Enable quering based on the fit names
enabled: boolean, # Enable this type of refresh
index: string, # Database index of the field
nestedPath?: string, # Nested path of the field
documentType?: string, # Document type of the field
field: string, # Field name
range: number # Range for the refresh query in units of the field: [max-range, max]
},
forceMarkers?: boolean; # Force to draw data point markers, otherwise markers are automatically hidden by Plotly
quickDateOptions?: Array<QuickDateOption>; # Show quick date queries (e.g. last few hours, last days). See QuickDateOption
```

```
SourceParameter: {
index: string;
fields: Array<{
name: string; # Name of the field to query
seriesName?: string; # Name of the field to display in the legend of the chart
color?: string; # Color of the series in the chart
yAxis?: number; # This field must be set to 2 if the field should be displayed on the 2nd Y axis
errorField?: string; # Field for error bars (+/- value)
forceMarkers?: boolean;
}>;
extraFields: Array<{ # Extra fields for tooltips, separation lines, etc.
name: string; # Field name in the database document
renameTo?: string; # Rename the field in the query result (to match names form different sources, if needed)
}>;
nestedPath?: string;
documentType?: string;
timestampField?: string;
terms?: { string: any };
}
```
Examples in presets: `background.json`, `bptx.json`, `hf.json`, `lumi.json`, `plt.json`, `summary.json`, `vdm-offline.json`, `vdm-online.json`.

## Widget: numeric-field-with-ratios
Extended numeric-field widget with another chart below to display ratios. Configuration (in addition to numeric-field config):
```
ratioYRangeZoom: [number, number]; # Fixed Y axis zoom [min,max] for the ratios chart
ratios: Array<{ # Which ratios and how to plot
denominator: {source: number, field: number}; # Zero based index of source and field in numeric-field sources
nominator: {source: number, field: number}; # Same as denominator
name: string; # Name of the ratio in the chart
} >;
```
Examples in presets: `lumi.json`, `remus.json`.

## Widget: numeric-field-split
Extended numeric-field widget with splitting query results by a field value. `SourceParameter` (as ParentSourceParameter) form `numeric-field` is exteded as follows:
```
SourceParameter extends ParentSourceParameter {
split: { # Values for each source to be split by the following parameters
field: string; # Field on which the split is based
text: string; # Series names in the legend will be appended with this text + value of the split field
values: Array<number>; # Field values driving the splitting
}
}
```
Examples in presets: `vdm-offline-bcm1futca.json`, `vdm-offline-plt.json`.

## Widget: array-snapshot
Widget for displaying a snapshot of an array value. Usually X axis is element index in the array, and Y axis is for values of the elements. Configuration:
```
timestampUNIX?: boolean;
queryChannel?: number;
legend?: ChartUtils.LegendPresetOptions;
yAxisTitle?: string;
yAxisScale?: 'lin' | 'log';
database: string;
index: string;
documentType?: string;
timestampField?: string;
fields: Array<FieldParameter>; # Which fields to query and display. See FieldParameter below
terms?: { string: any };
runField?: string; # Field with run number value (for queries)
lsField?: string; # Field with lumisection number value (for queries)
nestedPath?: string;
runLsQueriesEnabled?: boolean; # Enable query panel (and event listener) for RUN+LS queries
chartType?: 'scattergl' | 'scatter' | 'bar'; # Vizualisation type: bar or scatter chart. 'scattergl' is for scatter chart with WebGL technology (for many data points)
xAxisTitle?: string;
xOffset?: number; # Offset X values in the displayed chart (useful when adjusting 0-1 based indexing or shifting values to the negative side)
```

```
FieldParameter: {
name: string; # Field name in the database document
seriesName?: string; # Name visible on the chart
mask?: string; # Another field (of the same dimension) which values are used for masking the main field data
error?: string; # For error bars (+/- error value)
color?: string; # Displayd color in the chart
}
```

Examples in presets: `bptx.json`, `hf.json`, `lumi.json`, `summary.json`.

## Widget: array-lines
Widget for displaying numeric values for an array field over time. Configuration:
```
timestampUNIX?: boolean;
queryChannel?: number;
fieldChangeSeparators?: {enabled: boolean, fields: Array<ChartUtils.FieldSeparatorConfig>};
legend?: ChartUtils.LegendPresetOptions;
yAxisTitle?: string;
yAxisScale?: 'lin' | 'log';
database: string;
index: string;
documentType?: string;
timestampField?: string;
field: string; # Database field to query for values
series: Array<number>; # Set of array indices to display from the field
extraFields: Array<string>; # Extra fields for tooltips and separartors
nestedPath?: string;
terms?: { string: any };
fillField?: string; # Field with fill number (for queries)
runField?: string; # Field with run number (for queries)
errorField?: string; # Database field to query for error bar values (+/- error)
legendNames?: Array<string>; # Series names in the chart (in the order of indices in the 'series' configuration)
liveWindow?: number;
refreshSize?: number;
aggregationThreshold?: number;
histogramAggregatedQuery?: boolean;
aggregationQueryParams?: Array<any>;
tooltipInfo?: Array<ChartUtils.TooltipInfoField>;
fillQueriesEnabled?: boolean;
runQueriesEnabled?: boolean;
```

Examples in presets: `bcm1frhu.json`, `bcml.json`, `plt_offline.json`, `pltslink.json`.

## Widget: array-heatmap
Widget for displaying array values over time in a heatmap format. Configuration (mostly as for array-lines with some options removed and some added):
```
timestampUNIX?: boolean;
queryChannel?: number;
legend?: ChartUtils.LegendPresetOptions;
yAxisTitle?: string;
database: string;
index: string;
documentType?: string;
timestampField?: string;
field: string;
extraFields: Array<string>;
nestedPath?: string;
terms?: { string: any };
fillField?: string;
runField?: string;
zAxisTitle?: string; # Title for the third axis. Heatmap color is considered Z axis
filterZThreshold?: number; # Filter out values below threshold (filtered values appear transparent)
filterZeros?: boolean; # Filter out zeroes
liveWindow?: number;
refreshSize?: number;
fillQueriesEnabled?: boolean;
runQueriesEnabled?: boolean;
yOffset?: # Offset Y values by this amount. Similar to xOffset for array-snapshot charts, but for charts were bunch indexes are on the Y axis.
```

Examples in presets: `bptx.json`, `bxlumi.json`.
## Widget: array-lines-basicx

Widget extends array-lines widget for displaying array values over numeric index instead of over time. Configuration as for array-lines with extension as below:
```
xField: string; # Field for the x axis values (timestampField will be ignored)
xAxisTitle?: string; # Custom x axis title
xAxisType?: 'category' | 'lin'; # Axis type - as categories or linear interpolation
```
Examples in presets: `bcm1fadc.json`, `bcm1futca_rate.json`.
## Widget: pileup

Widget for displaying luminosity pileup histograms. The widget extends array-snapshot with additional configuration as below:
```
histogramStep: number; # Pileup value distance between two histogram buckets
minbias: number; # Minimum bias
statisticsFilter: number; # Calculate statistics info with pileups only greater or equal than statisticsFilter
```

Examples in presets: `pileup.json`.

## Widget: images
Widget for displaying binary images. Configuration:

```
database: string;
index: string;
useDocumentType: boolean; # should document type be used for image type/group
typeField?: string; # Database document field for image type/group
imageDataField: string; # Database document field with base64 encoded image data
timestampField?: string;
timestampFormat?: 's' | 'ms' | 'string';
imageWidth?: number; # How big images should be scaled for display (in pixels)
sortBy?: string; # Metafield name to sort by
groupBy?: string; # Metafield name to group by
metaFields: {string: {type: 'string' | 'number', label: string}}; # Metafields for display, sorting, grouping and filtering
queryConfig: QueryConfig; # What kindo of queries are available. See QueryConfig below

interface QueryConfig {
typesDisabled?: boolean; # Disable types for querying
typeSelectionTitle?: string; # Displayed text title for type selection section in the query panel
availableTypes?: Array<string>; # List of available types to choose from
featuresDisabled?: boolean; # Disable feature conditions
featuresSelectionTitle?: string; # Displayed text title for feature selcetion section in the query panel
featuresSelectionFormFields?: Array<FormlyFieldConfig>; # Dynamic form definition fro generating query terms
querySelectionTitle?: string; # Displayed text title for query type selection section in the query panel
availableQueries: Array<Query>; # List of available query types. See Query below
}

interface Query {
type: 'daterange' | 'range' | 'list'; # Query type
label: string; # Query label in the selection dropdown
field?: string; # On which field the query is based
fieldType?: 'number' | 'string'; # What is the type of the field
}
```

Examples in presets: `bcm1fadc.json`;

## Widget: vdm-bx
Widget for displaying VDM per bunch values. Configuration as for array-snapshot with extension as below:

```
detectorField: string; # Field to use for determining detector name
detectorFieldCase: 'upcase' | 'lowcase' | 'original'; # When querying by detector name should query text be capitalized, lowercase or unchanged (so that users would not need to care about correct capitalization)
```

This widget listens for special query type `string_plus_date_query` which can be emitted by string-plus-date-query widget.

Examples in presets: `vdm-offline.json`, `vdm-online.json`.

## Widget: time-query
Widget for broadcasting date+time range queries to the dashboard. Configuration:
```
channel: number; # To which channel to emit the query event
```

Examples in presets: `bcml.json`, `bptx.json`, `bptx.json`, `plt.json`, `pltslink.json`, `summary.json`.

## Widget: range-query
Widget for broadcasting range (not date range - numeric or string) queries. Configuration:
```
key: string; # Identifier for receiving widgets to understand for which field the range query is received
inputType: 'string' | 'number'; # Input fields for range should be strings or numbers
channel: number; # To which channel to emit the query event
database?: string; # Used for fetching data
index?: string; # Used for fetching data
```

Examples in presets: `vdm-offline-bcm1futca.json`, `vdm-offline-plt.json`, `vdm-offline.json`, `vdm-online.json`;

## Widget: fill-run-ls-query
Widget for broadcasting fill/run/lumisection queries.
```
fillEnabled: boolean; # Fill number input field enabled
runEnabled: boolean; # Run number input field enabled
lsEnabled: boolean; # Lumisection number input field enabled
channel: number; # To which channel to emit the query event
```

Examples in presets: `lumi.json`, `pileup.json`.

## Widget: string-plus-date-query
Widget emitting queries with string and date. Useful for VDM per bunch queries (detector name + date). Configuration:
```
channel: number; # To which channel to emit the query event
label: string; # Label for the text input field
```

Examples in presets: `vdm-offline.json`, `vdm-online.json`.


# Developing widgets
## Widget requirements
First steps would be to follow recipe [Create new widget](#create-new-widget). Widget component is required to have a public `config` property, which receives the widget configuration (from the preset) when created by the dashboard.

Convention for the `config` is:
```
{
    "container": { # Container properties read by the dashboard automatically
        "width": number, # Widget width in percentage of screen widht
        "height": number # Widget height in pixels
    },
    "wrapper": { # Wrapper options - if the widget uses common widget wrapper from app/shared/widget, the widget should pass this config to the wrapper
        title: string;
        controlsEnabled: boolean;
        infoEnabled: boolean;
        startEnabled: boolean;
        started: boolean;
        refreshEnabled: boolean;
        optionsEnabled: boolean;
        optionsOpen: boolean;
        queriesDetectors: boolean;
        queriesEnabled: boolean;
        queriesOpen: boolean;
        initialTimer: number
    },
    "widget": {} # Any other widget specific configuration
}
```

## Widget wrapper
Most of the time, new widgets should be wrapped in a common widget wrapper `app/shared/widget/widget.component.ts`. This wrapper provides some useful common functionality: title, info bar, control buttons (refresh, start/stop, queries, options), alert display for (info/warn/error), timer subscription.

How to use the wrapper: in the widget template add `wm-widget` component (with inputs `config`, `info`, and outputs `start`, `stop`, `refresh`, `timer`) as a root element:
```
<wm-widget
    [config]="config.wrapper" <!-- pass the wrapper config -->
    [info]="info" <!-- pass the info object for the info panel -->
    (start)="onStartEvent()" <!-- event callback on start event -->
    (stop)="onStopEvent()" <!-- event callback on stop event -->
    (refresh)="onRefreshEvent()" <!-- event callback on refresh event -->
    (timer)="updateLive()" <!-- event callback on timer event (for live update) -->
    #widgetWrapper> <!-- reference to this wrapper to access from widget component code -->

    <div class="widget-options">
        <!-- here goes template for options, visible when options modal is open -->
    </div>

    <div class="widget-queries">
        <!-- here goes template for queries, visible when queries panel is open -->
    </div>

    <div class="widget-content">
        <!-- here goes the content for the widget -->
    </div>
</wm-widget>
```

## Widgets with charts
Most of the widgets have a chart or more in them. In such cases there is a base `app/widgets/base/chart-widget` implemented which handles some common functionality. The suggestion is to extend the base `ChartWidget` when implementing widgets that deal with charts.

Base `ChartWidget` handles:
  - default chart layout/configuration
  - timestamp conversions from/to unix/string
  - registering on query channels
  - field change separators (vertical lines for a field value change)
  - legend placement options
  - Y axis title and scale
  - browser window resize events (to update chart dimensions)
  - chart interaction enable/disable control

Base `ChartWidget` requires the reference to the `wm-widget` wrapper to be called `widgetWrapper` and the reference to the `plotly` plot container to be called `plot`, otherwise it cannot interact with these instances.

See extending `ChartWidget` examples: `app/widgets/array-field/array-lines.component.ts`, `app/widgets/array-field/array-heatmap.component.ts`, `app/widgets/array-snapshot/array-snapshot.component.ts`, `app/widgets/numeric-field/numeric-field.component.ts`.

## Extending widgets
One way of quickly developing a widget in an organised manner is by extending already existing widget and adding/modifying a part of functionality. There are few considerations to keep in mind:

1. New widget component class must extend the class of the base widget component
2. Services passed to constructor by angular dependency injector can be modified if different services are needed
3. Template and styles (in the component decorator) are not 'extendable' - they either need to be used as it is from parent widget, or rewritten. Suggestion is not to rewrite templates when extending components, because in such case it is very easy to update parent component and break something in the child without any early errors.

Some tips for extending widgets:

  - **How to extend `widget-content` in `wm-widget`**: you cannot - use as it is or rewrite whole widget template.
  - **How to extend `widget-options` in `wm-widget`**: pass dynamic form configuration (as `Array<FormlyFieldConfig>`) to the `WidgetComponet` (`app/shared/widget/widget.component.ts`) public property `extraOptions` and subscribe to `extraOptionsModelChange` observable for changes. See `app/widgets/pileup/pileup.component.ts` for example.
  - **How to extend `widget-queries` in `wm-widget`**: pass dynamic form configuration (as `Array<{component: any, config: any}>`) to the `WidgetComponet` (`app/shared/widget/widget.component.ts`) public property `extraQueries` and subscribe for query events from `extraQueriesEvents` observable. See `app/widgets/vdm-bx/vdm-bx.component.ts` for example.
  - **How to subscribe to more query events when extending `ChartWidget`**: add new query event type (as string) to the `ChartWidget.queryEventTypes` array and call `ChartWidget.resubscribeQueryEvents()`. See `app/widgets/vdm-bx/vdm-bx.component.ts` for example.
