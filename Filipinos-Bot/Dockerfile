ARG BUILD_FROM=ghcr.io/hassio-addons/base:13.0.0
FROM $BUILD_FROM


SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Copy data for add-on
COPY Commands/ /Commands/
COPY GraphQL/ /GraphQL/
COPY Modules/ /Modules/
COPY CommandLoader.js /
COPY index.js /
COPY package.json /
COPY package-lock.json /
COPY Procfile /
COPY discord-bot-sitepoint.iml /
COPY run.sh /

RUN \
    apk add --no-cache --virtual .build-dependencies \
        g++=12.2.1_git20220924-r4 \
        gcc=12.2.1_git20220924-r4 \
        libc-dev=0.7.2-r3 \
        linux-headers=5.19.5-r0 \
        make=4.3-r1 \
        py3-pip=22.3.1-r1 \
        python3-dev=3.10.9-r1 \
        python3=3.10.9-r1

RUN apk add --no-cache \
        git=2.38.2-r0 \
        icu-data-full=72.1-r1 \
        nodejs=18.12.1-r0 \
        npm=9.1.2-r0 \
        patch=2.7.6-r7\
        ffmpeg=2.8.11-r0

RUN cd / && npm install
RUN chmod a+x /run.sh
CMD [ "/run.sh" ]