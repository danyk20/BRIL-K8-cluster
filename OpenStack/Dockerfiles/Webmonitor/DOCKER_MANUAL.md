# Run Webmonitor in Docker

## Build & run container locally

0. Navigate to the root directory of this project
1. Set your architecture in `.env` file (x86_64/aarch64)
2. Run app as docker container in detached mode

```shell
docker compose up -d
```

3. Clean up (delete container)

```shell
docker compose down
```

## Download from GitLab Container Repository & run 1+1 (1 load-balancer & 1 webmonitor) container

0. Connect Docker with GitLab

```shell
docker login gitlab.cern.ch
```

1. Select image base on your architecture (x86/ARM) from [Container Registry](https://gitlab.cern.ch/bril/webmonitor/container_registry/20899)

- e.g. ARM version 0.0.4

```shell
docker network create brilnet
docker run --name app-node --network brilnet -d gitlab-registry.cern.ch/bril/webmonitor:ALMA9_ARM_0.0.4
docker run --name webmonitor_lb --network brilnet -p 8080:80 -d gitlab-registry.cern.ch/bril/webmonitor:load-balancer_ALMA9_ARM_0.0.4
```

- e.g. x86 version 0.0.4

```shell
docker network create brilnet
docker run --name app-node --network brilnet -d gitlab-registry.cern.ch/bril/webmonitor:ALMA9_x86_0.0.4
docker run --name webmonitor_lb --network brilnet -p 8080:80 -d gitlab-registry.cern.ch/bril/webmonitor:load-balancer_ALMA9_x86_0.0.4
```

2. Stop both running containers

```shell
docker stop app-node
docker stop webmonitor_lb
```

3. Remove both containers

```shell
docker rm app-node
docker rm webmonitor_lb
```

4. Delete webmonitor related images with any tag

```shell
docker images | grep 'gitlab-registry.cern.ch/bril/webmonitor' | awk '{print $3}' | xargs docker rmi
```

5. Remove network

```shell
docker network remove brilnet
```
