#!/usr/bin/with-contenv bashio
set -e
CONFIG="/etc/dhcpd.conf"
LEASES="/data/dhcpd.lease"

bashio::log.info "Loading Environment..."

DISCORD_TOKEN=$(bashio::config 'discord_token')
MONGO_USER=$(bashio::config 'mongo_user')
MONGO_PASS=$(bashio::config 'mongo_pass')
GITHUB_TOKEN=$(bashio::config 'github_token')
TRAKT_API=$(bashio::config 'trakt_api_key')
WATCH_PARTY=$(bashio::config 'watch_party_api')
TOKEN_USER_IMGFLIP=$(bashio::config 'imgflip_user')
TOKEN_PASS_IMGFLIP=$(bashio::config 'imgflip_pass')

echo -e "APP_NAME=Filipinos Bot\nMONGO_USER=$MONGO_USER\nMONGO_PASS=$MONGO_PASS\nTOKEN_GITHUB=$GITHUB_TOKEN\nTRAKT_API_KEY=$TRAKT_API\nTOKEN=$DISCORD_TOKEN\nWATCH_PARTY_API=$WATCH_PARTY\nTOKEN_USER_IMGFLIP=$TOKEN_USER_IMGFLIP\nTOKEN_PASS_IMGFLIP=$TOKEN_PASS_IMGFLIP" > /.env

bashio::log.info "Starting Bot..."
node index.js