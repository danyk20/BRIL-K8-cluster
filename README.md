# BRIL Cluster

## Development 

### Prerequisites
- Docker
- Git
- minikube

### Instruction

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
3. start all apps
    ```shell
    kubectl apply -f webmonitor-deployment.yaml
    kubectl apply -f runcontrol-deployment.yaml
    ```
4. attach "services" to running apps
    ```shell
    kubectl apply -f webmonitor-service.yaml
    kubectl apply -f runcontrol-service.yaml
    ```
5. start load balancer
    ```shell
    kubectl apply -f  nginx-deployment.yaml
    ```
6. forward port
   ```shell
   kubectl port-forward $(kubectl get pods | grep nginx-loadbalancer | awk '{print $1}') 4200:80
   ```
   
### Delete cluster 
```shell
kubectl delete all --all
minikube stop
minikube delete --all=true --purge=true
```