const {EmbedBuilder} = require("discord.js");
const {activeRoulettes} = require("../../Modules/RussianRouletteMenu");


module.exports= {
    json: {
        "name": "shoot",
        "description": "Shoots someone when you are the gun holder",
        "options":[            {
            "name": "target",
            "description": "Target",
            "type": 6,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user, commandLoader}) => {
        let embed = new EmbedBuilder();
        let target = guild.members.cache.get(args.getUser('target').id);

        if(activeRoulettes[guild.id]) {
            if(!member.voice)
            {
                embed.setAuthor({ name: "You must join the voice channel.", iconURL: guild.iconURL() })
            }
            else if(activeRoulettes[guild.id].channelId === member.voice.channel.id)
            {
                if(activeRoulettes[guild.id].action.isGunHolder(member)) {
                    embed = await activeRoulettes[guild.id].action.shoot(member, target)
                    if(activeRoulettes[guild.id].action.hasEnded())
                    {
                        delete activeRoulettes[guild.id]
                    }
                }
                else
                {
                    embed.setAuthor({ name: "You must be the gun holder.", iconURL: guild.iconURL() })
                }
            }
            else
            {
                embed.setAuthor({ name: "You are in the wrong voice channel.", iconURL: guild.iconURL() })
            }
        }
        else
        {
            embed.setAuthor({ name: "Failed to shot because roulette there is no active roulette.", iconURL: guild.iconURL() })
        }
        return {embeds: [embed], ephemeral:true};
    },
}
