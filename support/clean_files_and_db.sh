#!/bin/sh
cd $(dirname $0)
sudo rm -rfv mongo/data/* storages/**/data/files storages/**/data/tmp
