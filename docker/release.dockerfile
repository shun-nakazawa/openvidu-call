FROM node:lts-alpine3.11

ARG RELEASE=2.13.0

RUN apk add wget unzip

WORKDIR /opt/openvidu-call

# Install openvidu-call
RUN wget "https://github.com/OpenVidu/openvidu-call/releases/download/v${RELEASE}/openvidu-call-${RELEASE}.tar.gz" -O openvidu-call.tar.gz && \
    tar zxf openvidu-call.tar.gz  && \
    rm openvidu-call.tar.gz

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD /usr/local/bin/entrypoint.sh