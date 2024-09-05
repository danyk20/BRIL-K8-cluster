# BRIL Cluster

## Development 

### Prerequisites
- Docker
- Git
- minikube

### Environment preparation

0. Build/download all (bril-webmonitor, bril-runcontrol-client, bril-nginx) containers. 
    ```shell
    docker build -t bril-nginx:0.0.1 --build-arg ARCHITECTURE="aarch64" .
    ```
1. initialize minikube
    ```shell
    minikube start —vm-driver=docker
    ```
   
2. pull images from local repository (it takes around 1 min)
    ```shell
    minikube image load bril-webmonitor:0.0.1
    minikube image load bril-runcontrol-client:0.0.1
    minikube image load bril-nginx:0.0.1
    ```

### Instruction (Manual)

1. start all apps
    ```shell
    kubectl apply -f webmonitor-deployment.yaml
    kubectl apply -f runcontrol-deployment.yaml
    ```
2. attach "services" to running apps
    ```shell
    kubectl apply -f webmonitor-service.yaml
    kubectl apply -f runcontrol-service.yaml
    ```
3. start nginx as load balancer and expose it using service component
    ```shell
    kubectl apply -f  nginx-deployment.yaml
    kubectl apply -f  nginx-service.yaml
    ```

### Instruction (Helm)

1. Start runcontrol client with attached service
   ```shell
   helm install bril-runcontrol-client angular-apps --values angular-apps/runcontrol_values.yaml
   ```

2. Start webmonitor with attached service
   ```shell
   helm install bril-webmonitor angular-apps --values angular-apps/webmonitor_values.yaml
   ```

3. Start nginx as loadbalancer attached service
   ```shell
   helm install bril-nginx angular-apps --values angular-apps/nginx_values.yaml
   ```


### Cluster entrypoint exposure

1. get entrypoint url
   ```shell
   minikube service entrypoint
   ``` 


### Delete cluster (Manual)

```shell
kubectl delete all --all
minikube stop
minikube delete --all=true --purge=true
```

### Delete cluster (Helm)
```shell
helm delete bril-nginx
helm delete bril-webmonitor    
helm delete bril-runcontrol-client    
minikube stop
minikube delete --all=true --purge=true
```