const { EmbedBuilder } = require('discord.js');
const request = require('request');
const responseInterface = require("../../Modules/response")
require('dotenv').config();
const WATCH_PARTY_API = process.env.WATCH_PARTY_API;

module.exports= {
    json: {
        "name": "watchparty",
        "description": "Creates a watch2gether room",
        "options": [
            {
                "name": "url",
                "description": "youtube link",
                "type": 3,
                "required": false,
            },]

    },
    callback: async ({client,interaction ,args,guild,member,user}) => {
        let embed = new EmbedBuilder();

        if(!args.getString("url") || !args.getString("url").startsWith("https://www.youtube.com/watch?v=") &&
            !args.getString("url").startsWith("https://youtu.be/" )) {

            request.post(
                'https://w2g.tv/rooms/create.json',
                {
                    json: {
                        w2g_api_key: WATCH_PARTY_API,
                    },
                },
                (error, res, body) => {
                    if (error) {
                        console.error(error)
                        return error
                    }
                    embed.setAuthor({name:"Watch Party",iconURL:guild.iconURL()})
                        .setTitle("Click here to join the Party!")
                        .setURL("https://w2g.tv/rooms/" + body.streamkey)
                        .setThumbnail("https://w2g.tv/static/watch2gether-share.jpg")
                        .setFooter({text:"Created by " + member.displayName, iconURL: user.avatarURL()});
                    interaction.reply({embeds:[embed]});

                })
        }else{
                const ytlink =args.getString("url").trim();

                request.post(
                    'https://w2g.tv/rooms/create.json',
                    {
                        json: {
                            w2g_api_key: WATCH_PARTY_API,
                            share:ytlink
                        },
                    },
                    (error, res, body) => {
                        if (error) {
                            console.error(error)
                            return
                        }

                        embed.setAuthor({name:"Watch Party",iconURL:guild.iconURL()})
                            .setTitle("Click here to join the Party!")
                            .setURL("https://w2g.tv/rooms/" + body.streamkey)
                            .setThumbnail("https://w2g.tv/static/watch2gether-share.jpg")
                            .setFooter({text:"Created by " + member.displayName, iconURL: user.avatarURL()});
                        interaction.reply({embeds:[embed]});
                    }
                )




    }
        return null;
}
}




