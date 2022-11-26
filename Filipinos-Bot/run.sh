DISCORD_TOKEN=$(bashio::config 'discord_token')
MONGO=$(bashio::config 'mongodb_token')
echo -e "APP_NAME=Filipinos Bot\nTOKEN_MONGODB_GAMBLE=$MONGO\nTOKEN=$DISCORD_TOKEN\n" > /.env

node index.js