FROM alpine:3.6
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 22
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

RUN apk add --no-cache openssh shadow

RUN addgroup -S -g 1000 data

RUN adduser -S -D -s /bin/ash -G data -u 1000 -H -h /home/data data

RUN echo -e "\
# The PAM configuration file for the Shadow 'chpasswd' service\n\
#\n\
\n\
auth       sufficient   pam_rootok.so\
" > /etc/pam.d/chpasswd

RUN pwd=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 255 | head -n 1) && echo "data:$pwd" | chpasswd

RUN sed -i s/#PasswordAuthentication.*/PasswordAuthentication\ no/ /etc/ssh/sshd_config
