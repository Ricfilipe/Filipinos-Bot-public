ARG BUILD_FROM
FROM $BUILD_FROM

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
RUN apk add --no-cache  nodejs=16.16.0-r0  npm=8.16.0-r0
RUN cd / && npm install

CMD [ "/run.sh" ]