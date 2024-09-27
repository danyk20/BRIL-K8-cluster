# BRILDAQ controls client

Web client for accessing brildaq-controls-server.

## Prerequisites

`npm`

## Getting started - Development
```shell
git clone https://gitlab.cern.ch/bril/brildaq-controls-client.git
cd brildaq-controls-client
npm install -f
npm run serve
```
In order for the application to be fully functional, it needs to make successful requests to a server. In order to meet this criterion for local development and testing, use a proxy.<br>
Proxy settings need to be configured in `src/proxy.config.json`.<br>
Enabling the proxy can happen through `angular.json`
```
...
  "serve": {
    ...
    "options": {
      "browserTarget": "configurator-client:build",
      "proxyConfig": "src/proxy.config.json"
    }
    ...
  }
...
```
This way, simply run `ng serve` to serve the the app locally and open http://localhost:4200.<br>
Otherwise, run `npm run serve` (after making sure the script is properly configured in `package.json`)

The proxied port (`10770` in the example config) must either run a local server, or host an ssh tunnel to the production server, by using the following command for example:
```
ssh -t <username>@lxplus.cern.ch -L 10770:localhost:10775 "ssh -t -L 10775:localhost.cms:8090 <username>@cmsusr.cern.ch 'ssh -L 8090:localhost:80 <username>@srv-s2d16-22-01.cms'"
```

## Build
``` shell
npm run build
```
(or directly `ng build --configuration production`)

Note: See https://github.com/angular/angular-cli/issues/20760#issuecomment-840608632 for the production build optimization configuration.

## Deploy

1. Build as instructed above. It puts the build files inside `dist/browser/` folder
2. Copy the files from `dist/browser/` to where they will be served from (e.g. "`/var/www/html/runcontrol`")

### Docker

Create runcontrol client image called "runcontrol-client" and run it as a container under name runcontrol-angular18 with exposed port 3000.

```shell
docker build -t runcontrol-client:0.0.1 --build-arg ARCHITECTURE=aarch64 --build-arg VERSION=0.0.1 --build-arg NODE_VERSION=22.4.1 .
docker run --name runcontrol-angular18 -p 3000:3000 runcontrol-client:0.0.1 
```

Stop running container. (Kill the process)

```shell
docker stop runcontrol-angular18
```

Remove saved container.

```shell
docker rm runcontrol-angular18
```

Remove saved image.

```shell
docker rmi runcontrol-client:0.0.1
```

# Developing

## Technologies

The application is built with Angular 18 framework (https://angular.io/), NGRX state management library/method (https://ngrx.io/), and Clarity UI design system (https://clarity.design/).

## Notes

Each module of the application (including top level module) has its own state management defined in the style of NGRX:
`app/state/`, `app/core/state/`, `app/features/editor/state/`, `app/features/overview/state/`. The idea being that components do not modify shared application state, but instead they only dispatch predefined actions, state mutations are handled by reducers and side effects (written in ngrx style), and updated state is published to the interested/subscribed components.
