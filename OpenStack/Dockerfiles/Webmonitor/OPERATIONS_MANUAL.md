# Prerequisites
  - internet for `npm install` step
  - npm - https://www.npmjs.com/get-npm ( npm>=v6.7.0, and node >=v8.x )


# Getting started
```
git clone https://gitlab.cern.ch/bril/webmonitor.git
cd webmonitor
npm install
npm run serve
# open http://localhost:4200
```

The above will run angular CLI `ng serve` command which builds the application, serves it on localhost:4200 and watches for source changes to rebuild when needed.

`Tip:` Try to update the `package.json` everytime that the modules used by the application change and keep it as much detailed as possible. In case the application breaks
        because of conflicts between your npm/node version and the module versions specified in the `package.json`, you can install the full dependency tree of the last 
        working version of the application from the file `package-lock.json`, using the command  `npm ci`.

# Build
```
npm run build
```

The above packages the application into `dist/` directory. Contents of the directory can be served by a web server.


# Deploy
1. Build the application with `npm run build`
2. Move contents of `dist/` directory to the area from where the application is supposed to be served
3. Modify `base` tag inside `index.html` to have correct base e.g. `/webmonitor-test/`

(with BRIL's current setup, application is served by NGINX running on srv-s2d16-22-01 from a directory `/var/www/html/webmonitor`. This is the directory where contents of `dist/` must go. And in this case the default `base` tag `/` must be replaced with `/webmonitor/`')

After uploading the new files to the directory, restarting the server is recommended.

# Web server configuration
In general the application can be served by any web server which can be configured to:
1. First trying to return files (with basic file type headers) by path
2. AND failing to locate files by path, serve `index.html` from application root

Current choice for BRIL's webmonitor is an NGINX server with a configuration snippet (at `/etc/nginx/nginx.conf`):
```
...
http {
...
    server {
        listen 80;
...
        location /webmonitor {
            alias /var/www/html/webmonitor;
            index index.html;
            try_files $uri $uri/ /index.html =404;
        }
...
```

# Database Server Configuration (CORS)
Normally widgets use a common `database.service.ts` to query the Elasticsearch instance, but in some cases a custom database service is used by a particular widget.<br>
In order to allow Elasticsearch to respond to requests from anyone, the Cross-Origin Resource Sharing (CORS) must be enabled in the ES server configuration as follows:
```
http.cors.enabled: true
http.cors.allow-origin: “*”
```   

# Database access configuration
In case Elasticsearch instances would be moved, application should be redeployed with updated default endpoint addresses. File `src/app/config.ts` contains pointers to the existing databases in the following format:
```
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
```

Then `endpoint` values should be updated accordingly, in case of relocation of database instances.
