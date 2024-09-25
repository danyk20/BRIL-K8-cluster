#!/bin/sh
dnf install -y nano
cat <<EOF | sudo tee /etc/hosts
188.185.123.242   Master-Node
188.184.95.212    Slave-Node-1
188.184.74.198    Slave-Node-2
EOF
dnf makecache --refresh
dnf update -y
reboot