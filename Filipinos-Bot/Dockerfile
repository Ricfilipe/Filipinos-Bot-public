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
RUN cd / && npm install

CMD [ "/run.sh" ]