ARG BUILD_FROM
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
        g++=11.2.1_git20220219-r2 \
        gcc=11.2.1_git20220219-r2 \
        libc-dev=0.7.2-r3 \
        linux-headers=5.16.7-r1 \
        make=4.3-r0 \
        py3-pip=22.1.1-r0 \
        python3-dev=3.10.8-r0 \
        python3=3.10.8-r0 \
    \
    && apk add --no-cache \
        git=2.36.3-r0 \
        icu-data-full=71.1-r2 \
        nodejs=16.17.1-r0 \
        npm=8.10.0-r0 \
        patch=2.7.6-r7

RUN cd / && npm install
RUN chmod a+x /run.sh
CMD [ "/run.sh" ]