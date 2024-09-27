#!/bin/sh
dnf install -y nano
cat <<EOF | sudo tee /etc/hosts
$MASTER_IP     Master-Node
$SLAVE_IP_1    Slave-Node-1
$SLAVE_IP_2    Slave-Node-2
EOF
dnf makecache --refresh
dnf update -y
reboot