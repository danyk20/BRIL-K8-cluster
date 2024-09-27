# Basic usage

1. Open webmonitor application with a web browser.
2. Select preset from `Presets` dropdown (top left).
3. Watch live updating charts and/or query historic data using per widget or dashboard query panels


# Header

Application header is the sticky dark blue band at the top of the screen containing few global controls.

What is in the header (left to right):
1. Webmonitor logo
2. Preset selection dropdown: navigating the predefined presets
3. (optional) some handy links or messages, for example, where to find the old webmonitor
4. Global start button: broadcasting `start` signal to all the widgets in the current dashboard
5. Global stop button: broadcasting `stop` signal to all the widgets in the current dashboard
6. Layout mode button: for toggling layout mode, which is used for rearranging and resizing widgets in the current dashboard
7. Global settings button: opens a settings menu for the application level and current dashboard level options


# Dashboard

Dashboard is the area in the application window bellow the header. Dashboard parses the preset configuration and instantiates and arranges required widgets. Also timer signals are controlled by dashboard.


# Widget

Widget is an independent unit with its implementation of data retrieval from data sources, data presentation and interactivity functionality.

Most of the widgets are encapsulated in a common functionality wrapper which provides features like: title, common controls (start/stop, refresh, query, options), info panel, logging messages.

## Start/Stop

Start/Stop signal can be:
1. emitted directly to a widget by clicking the "Start"/"Stop" button at the upper left corner of the widget
2. broadcasted to all the widgets of the current dashboard by clicking "Start" or "Stop" button in the application header
3. emitted from custom widget code (either to itself or to other widgets via internal application's event bus)

If there is a timer assigned to a widget and the widget has not disabled start/stop functionality, the start/stop signal received by the widget subscribes to the timer events. Then custom widget implementation decides what to do each time the timer event is received (for example query for live data update).

## Refresh

Refresh signal is emitted to the widget by clicking "Refresh" button in the widget common controls panel. Widgets can be configured to enable/disable refresh signals. Each widget implements its own functionality for a refresh event, which in general is querying a small amount of newest data.

## Queries

Usually widgets implement query forms which are placed in the queries panel (toggleabe by the "Queries" button). Widgets can also listen for query events on the internal application's event bus, in such way dashboard wide query forms are implemented. Such forms send query events to the event bus with a channel id, and several widgets configured to listen for queries on that channel, receive the same query at the same moment.

## Options

Widget options are accessed by clicking "Options" button in the common controls panel. Options window is split into two tabs "General" and "Widget". "General" tab contains few general options like widget title and timer selection. "Widget" tab contains specific options for the type of the widget.


# Layout mode

Layout mode can be toggled on and off by clicking the "Layout mode" button at the right end of the application header. In layout mode, widgets are displayed with a dark curtain and a bright red border. While in layout mode, widgets can be rearranged by holding down on a red "target" icon and dragging/dropping, and resized by clicking red icon with two arrows and entering new dimensions.


# Global settings

Global settings menu can be accessed by clicking the "Settings" button on the right side of application header.

Global settings contain:
1. Timers - managing timers of the currently active dashboard (creating/removing timers)
2. Preset export - exporting current dashboard in a json format configuration
3. Preset import - importing a json format dashboard configuration as a sandbox preset


# Sandbox preset

Sandbox preset is a dashboard configuration to be imported by the user for experimentation purposes.

Sandbox preset is activated by selecting "-sandbox-" form the "Presets" dropdown on the left side of the application header.

Sandbox preset is imported by opening global settings menu (see [Global settings](#global-settings)), selecting the "Preset import" section, editing the preset int the appeared text editor and clicking "IMPORT AS SANDBOX PRESET".
