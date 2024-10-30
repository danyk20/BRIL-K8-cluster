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
    minikube start --vm-driver=docker
    ```

2. pull images from local repository (it takes around 1 min)
    ```shell
    minikube image load bril-webmonitor:0.0.1
    minikube image load bril-runcontrol-client:0.0.1
    minikube image load bril-nginx:0.0.1
    ```

### Minikube Instruction (Manual)

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

### Minikube Instruction (Helm)

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

### Custom Kubernetes CLuster Instruction

```shell
# Create Secret & ConfigMap component
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
# Create persistent storage
kubectl apply -f storage.yaml
# Start all pods
kubectl apply -f runcontrol-deployment.yaml
kubectl apply -f webmonitor-deployment.yaml
# Attach kubernetes services to the running pods
kubectl apply -f runcontrol-service.yaml
kubectl apply -f webmonitor-service.yaml
# Start Ingress component to route the traffic
kubectl apply -f ingress.yaml
```

-Note: `secret.yaml` allows to change `db.ini` file, "backed" in the image, containing database credentials without need
to build new image, also the same is true for `configmap.yaml` allows to change flask configuration `cherry.config` and
database configuration `config.json` without need to rebuild the image. Keep in mind you need to [restart](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_restart/) the 
deployment after applying the change in the ConfigMap or Secret.

### Cluster Minikube entrypoint exposure

1. get entrypoint url
   ```shell
   minikube service entrypoint
   ``` 

### Delete Minikube cluster (Manual)

```shell
kubectl delete all --all
minikube stop
minikube delete --all=true --purge=true
```

### Delete Minikube cluster (Helm)

```shell
helm delete bril-nginx
helm delete bril-webmonitor    
helm delete bril-runcontrol-client    
minikube stop
minikube delete --all=true --purge=true
```