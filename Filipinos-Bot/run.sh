DISCORD_TOKEN=$(bashio::config 'discord_token')
MONGO_USER=$(bashio::config 'mongo_user')
MONGO_PASS=$(bashio::config 'mongo_pass')
GITHUB_TOKEN=$(bashio::config 'github_token')
TRAKT_API=$(bashio::config 'trakt_api_key')
WATCH_PARTY=$(bashio::config 'watch_party_api')

echo -e "APP_NAME=Filipinos Bot\nMONGO_USER=$MONGO_USER\nMONGO_PASS=$MONGO_PASS\nTOKEN_GITHUB=$GITHUB_TOKEN\nTRAKT_API_KEY=$TRAKT_API\nTOKEN=$DISCORD_TOKEN\nWATCH_PARTY_API=$WATCH_PARTY" > /.env

node index.js