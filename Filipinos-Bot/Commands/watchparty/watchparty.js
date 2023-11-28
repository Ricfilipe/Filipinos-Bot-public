const { EmbedBuilder } = require('discord.js');
const urllib = require("urllib");
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

            urllib.request(
                'https://api.w2g.tv/rooms/create.json',
                {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    content:  JSON.stringify({
                        w2g_api_key: WATCH_PARTY_API,
                    }),
                }).then(response=>
                {
                    if(response.res.status !== 200)
                    {
                        console.error(response.res.statusText);
                        return response.res.statusText;
                    }
                   const body = JSON.parse(response.data)
                    embed.setAuthor({name:"Watch Party",iconURL:guild.iconURL()})
                        .setTitle("Click here to join the Party!")
                        .setURL("https://w2g.tv/rooms/" + body.streamkey)
                        .setThumbnail("https://w2g.tv/static/watch2gether-share.jpg")
                        .setFooter({text:"Created by " + member.displayName, iconURL: user.avatarURL()});
                    interaction.reply({embeds:[embed]});
                })
                .catch(function(err) {
                    console.error(err);
                    return err
                })
        }else{
                const ytlink =args.getString("url").trim();

            urllib.request(
                    'https://w2g.tv/rooms/create.json',
                {
                            method:"POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            content:  JSON.stringify({
                                w2g_api_key: WATCH_PARTY_API,
                                share:ytlink
                            }),
                         }).then(response=>
                            {
                                if(response.res.status !== 200)
                                {
                                    console.error(response.res.statusText);
                                    return response.res.statusText;
                                }
                                const body = JSON.parse(response.data)
                                embed.setAuthor({name:"Watch Party",iconURL:guild.iconURL()})
                                    .setTitle("Click here to join the Party!")
                                    .setURL("https://w2g.tv/rooms/" + body.streamkey)
                                    .setThumbnail("https://w2g.tv/static/watch2gether-share.jpg")
                                    .setFooter({text:"Created by " + member.displayName, iconURL: user.avatarURL()});
                                interaction.reply({embeds:[embed]});
                            })
                        .catch(function(err) {
                            console.error(err);
                            return err
                        })

    }
        return null;
}
}




