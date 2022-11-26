FROM node

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
RUN cd / && npm install
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]