# Creating Kubernetes cluster using CERN OpenStack

## Prerequisites

- Public key uploaded
- Created project

## Instructions

### Create Master Node VM

1. Log in to https://openstack.cern.ch/project/
2. Select project from top menu
   ![Selecting personal Project](assets/project.png)
3. Navigate to `Project` -> `Compute` -> `Instances` in left bar menu
   ![Left bar menu](assets/instances.png)
4. Click on `LAUNCH INSTANCE` to create a new VM
   ![Creating new VM](assets/launch_instance.png)
5. Create Master Node by filling following data into form:
   - Details: 
      - Instance Name: `Master-Node`
      - Count: `1`
   ![Details form fill](assets/master_details.png)
   - Source: click on up arrow next to `ALMA9 - x86_64`
   ![Source form fill](assets/source.png)
   - Flavour: click on up arrow next to `m2.medium`
   ![Flavour form fill](assets/master_flavour.png)
   - Key Pair: click on up arrow next to public key you want to use
   ![Choosing a public key](assets/key_pair.png)
     - Note: You can add your public key by: 
       - clicking on `IMPORT KEY PAIR`
       ![Import key pair](assets/add_key.png)
       - filling the form
       ![Filling public key form](assets/public_key.png)
   - Configuration: default settings
   - Metadata: default settings
6. Confirm by clicking on `LAUNCH INSTANCE`
   ![Confirm configuration](assets/launch.png)

### Create Master Node VM

1. Log in to https://openstack.cern.ch/project/
2. Select project from top menu
   ![Selecting personal Project](assets/project.png)
3. Navigate to `Project` -> `Compute` -> `Instances` in left bar menu
   ![Left bar menu](assets/instances.png)
4. Click on `LAUNCH INSTANCE` to create a new VM
   ![Creating new VM](assets/launch_instance.png)
5. Create Master Node by filling following data into form:
   - Details:
      - Instance Name: `Master-Node`
      - Count: `1`
        ![Details form fill](assets/master_details.png)
   - Source: click on up arrow next to `ALMA9 - x86_64`
     ![Source form fill](assets/source.png)
   - Flavour: click on up arrow next to `m2.medium`
     ![Flavour form fill](assets/master_flavour.png)
   - Key Pair: click on up arrow next to public key you want to use
     ![Choosing a public key](assets/key_pair.png)
      - Note: You can add your public key by:
         - clicking on `IMPORT KEY PAIR`
           ![Import key pair](assets/add_key.png)
         - filling the form
           ![Filling public key form](assets/public_key.png)
   - Configuration: default settings
   - Metadata: default settings
6. Confirm by clicking on `LAUNCH INSTANCE`
   ![Confirm configuration](assets/launch.png)
7. Wait ~ 15min until the Master Node is ready

### Create Slave Node VMs

1. Log in to https://openstack.cern.ch/project/
2. Select project from top menu
   ![Selecting personal Project](assets/project.png)
3. Navigate to `Project` -> `Compute` -> `Instances` in left bar menu
   ![Left bar menu](assets/instances.png)
4. Click on `LAUNCH INSTANCE` to create a new VM
   ![Creating new VM](assets/launch_instance.png)
5. Create Master Node by filling following data into form:
   - Details:
      - Instance Name: `Slave-Node`
      - Count: `2`
        ![Details form fill](assets/slave_details.png)
   - Source: click on up arrow next to `ALMA9 - x86_64`
     ![Source form fill](assets/source.png)
   - Flavour: click on up arrow next to `m2.large`
     ![Flavour form fill](assets/slave_flavour.png)
   - Key Pair: click on up arrow next to public key you want to use
     ![Choosing a public key](assets/key_pair.png)
      - Note: You can add your public key by:
         - clicking on `IMPORT KEY PAIR`
           ![Import key pair](assets/add_key.png)
         - filling the form
           ![Filling public key form](assets/public_key.png)
   - Configuration: default settings
   - Metadata: default settings
6. Confirm by clicking on `LAUNCH INSTANCE`
   ![Confirm configuration](assets/launch.png)
7. Wait ~ 15min until the Master Node is ready

### Configure Kubernetes in Master Node

1. Connect to Master Node
   - Note: you need to be in internal network (e.g. lxplus)
   ```shell
   ssh -i ~/.ssh/<PRIVATE_KEY> root@<MASTER_NODE_IP>
   ```
2. Run `general-init.sh` 
   - Note: be aware of used variables there (replace them with values or initialize variables with right values)
3. Run `master-config.sh`
   - Note: Save the last line of the output, you will need it (token and hash) for the registering slaves

### Configure Kubernetes in Slave Node

1. Connect to Master Node
   - Note: you need to be in internal network (e.g. lxplus)
   ```shell
   ssh -i ~/.ssh/<PRIVATE_KEY> root@<SLAVE_NODE_IP>
   ```
2. Run `general-init.sh`
   - Note: be aware of used variables there (replace them with values or initialize variables with right values)
3. Run `slave-config.sh`
   - Note: Use token and hash from last line in master node, if you didn't save it just run `kubeadm token create --print-join-command` on master node

### Validate cluster

Run `kubectl get nodes` and you should see something like this:

```text
NAME                   STATUS     ROLES           AGE   VERSION
master-node.cern.ch    Ready      control-plane   34m   v1.31.1
slave-node-1.cern.ch   Ready      <none>          26s   v1.31.1
slave-node-2.cern.ch   NotReady   <none>          10s   v1.31.1
```

## Resources

To understand each individual command form the script have a look into this blog https://kanzal.com/kubernetes-with-kubeadm-on-redhat-9/