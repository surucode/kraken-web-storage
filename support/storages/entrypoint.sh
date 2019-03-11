#!/bin/ash

# generate host keys if not present
ssh-keygen -A

mkdir -p /home/data/files
mkdir -p /home/data/tmp

authorized_keys="/home/data/.ssh/authorized_keys"

rm $authorized_keys
for publickey in /home/data/.ssh/keys/*; do
    cat "$publickey" >> $authorized_keys
done

usermod -u $(stat -c '%u' /home/data) data
groupmod -g $(stat -c '%g' /home/data) data

chown -R data:data /home/data
chmod 600 "/home/data/.ssh/authorized_keys"

# do not detach (-D), log to stderr (-e), passthrough other arguments
exec /usr/sbin/sshd -D -e "$@"
