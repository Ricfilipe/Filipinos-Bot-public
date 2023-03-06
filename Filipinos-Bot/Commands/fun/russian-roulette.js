
const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const path = require("path");
const fs = require("fs");
const {RussianRouletteMenu, activeRoulettes} = require('../../Modules/RussianRouletteMenu');
const {generateDependencyReport} = require("@discordjs/voice");



module.exports= {
    json: {
        "name": "russian-roulette",
        "description": "Starts a russian roulette",
        "options":[   {
            "name": "punishment",
            "description": "Selects a punishment after getting hit, otherwise is random",
            "type": 3,
            "choices": generateChoices(),
            "required": false,
        },
        ]

    },
    callback: async ({client, interaction, args, guild, member, user, commandLoader}) => {
        const embed = new EmbedBuilder()
        let error = true
        const punishment = args.getString('punishment')

        if(!member.voice.channel)
        {
            embed.setAuthor({ name: "You must be in a voice channel", iconURL: guild.iconURL() })
        }
        else
        {
            if(!activeRoulettes[guild.id])
            {
                let roulette =  new RussianRouletteMenu(commandLoader, guild, interaction.channel, punishment)
                activeRoulettes[guild.id] = {action: roulette, channelId: member.voice.id}
                embed.setAuthor({ name: "A roulette has started", iconURL: guild.iconURL() })
                error = false

                await roulette.start()
            }
            else
            {
                embed.setAuthor({ name: "A roulette is already active in " + guild.name, iconURL: guild.iconURL() })
            }
        }

        return {embeds: [embed], ephemeral: error}
    },
    buttons:
        {
            cancelRoulette : cancel,
            selfShoot : selfShoot,
        },
}

async function cancel({interaction, player}) {
    let embed = new EmbedBuilder();

    if(activeRoulettes[interaction.guild.id])
    {
        await activeRoulettes[interaction.guild.id].action.cancel()
        activeRoulettes[interaction.guild.id] = null
        embed.setAuthor({ name: "Canceled russian roulette.", iconURL: interaction.guild.iconURL() })
        delete activeRoulettes[interaction.guild.id]
    }
    else
    {
        embed.setAuthor({ name: "Failed to cancel because roulette has been ended.", iconURL: interaction.guild.iconURL() })
    }

    return {embeds: [embed], ephemeral:true};
}

async function selfShoot({interaction, player}) {

    let embed = new EmbedBuilder();

    if(activeRoulettes[interaction.guild.id]) {
        if(!interaction.member.voice)
        {
            embed.setAuthor({ name: "You must join the voice channel.", iconURL: interaction.guild.iconURL() })
        }
        else if(activeRoulettes[interaction.guild.id].channelId === interaction.member.voice.id)
        {
            embed = await activeRoulettes[interaction.guild.id].action.shoot(interaction.member, interaction.member)
            if(activeRoulettes[interaction.guild.id].action.hasEnded())
            {
                delete activeRoulettes[interaction.guild.id]
            }
        }
        else
        {
            embed.setAuthor({ name: "You are in the wrong voice channel.", iconURL: interaction.guild.iconURL() })
        }
    }
    else
    {
        embed.setAuthor({ name: "Failed to shot because roulette has been ended.", iconURL: interaction.guild.iconURL() })
    }
    return {embeds: [embed], ephemeral:true};
}

function generateChoices()
{
    let choices = []
    getFiles("./Modules/Data/Russian-Roulette").forEach(file => {
        file = path.basename(file).replace("Action.js", "")
        choices.push({"name": file,
            "value": file})
    })

    return choices
}

// TODO: Create utils
function getFiles (dir, files_){
    files_ = files_ || [];
    const files = fs.readdirSync(dir);
    for (let i in files){
        let name = path.join(dir, files[i]);
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}