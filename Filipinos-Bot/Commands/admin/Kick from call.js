
const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const AdministrationDB = require("../../Modules/Connections/AdministrationDB");

let nextTime = {}
const NON_ADMIN_TIME=30
const FAILED_TIME=30

let messages;

const fs = require("fs");
fs.readFile("Modules/Data/json/kickMessages.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    messages = JSON.parse(jsonString)
});

module.exports= {
    json: {
        "name": "Kick from call",
        "type": "2",
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const target_member = guild.members.cache.find(member => member.id === interaction.targetId)
        const option = Math.random()
        const embed = new EmbedBuilder()
        const currentTime = new Date()
        let ephemeral = true

        if(!member.voice.channel)
        {
            embed.setAuthor({ name: "You must be in a voice channel", iconURL: guild.iconURL() })
        }
        else if(!target_member.voice.channel)
        {
            embed.setAuthor({ name: "Target must be in a voice channel", iconURL: guild.iconURL() })
        }
        else if(member.voice.channel.id !== target_member.voice.channel.id)
        {
            embed.setAuthor({ name: "Target must be in the same voice channel as you", iconURL: guild.iconURL() })
        }
            else if(!nextTime[guild.id] || !nextTime[guild.id][user.id] || nextTime[guild.id][user.id] < currentTime)
        {
            const adminRole = await AdministrationDB.getAdminRole(guild.id);
            if(adminRole && member.roles.cache.some(role => role.id === adminRole)) {
                addTimeout(guild.id, user.id, new Date(currentTime.getTime() + NON_ADMIN_TIME*1000))
            }

            ephemeral = false
            if(0.8 > option) {

                embed.setAuthor({
                    name: getRandomMessage("kick", member.displayName, target_member.displayName),
                    iconURL: guild.iconURL()
                })
                await target_member.voice.disconnect()
            }
            else if(0.87 > option)
            {
                // nothing happens
                embed.setAuthor({ name: getRandomMessage("failed kick", member.displayName, target_member.displayName), iconURL: guild.iconURL() })
                addTimeout(guild.id, user.id, new Date(currentTime.getTime() + FAILED_TIME*1000))

            }
            else if(0.90 > option)
            {
                // kick someone at random
                let member_list = []

                guild.channels.get(member.voice.channel.id).members.forEach((member).forEach(member => {
                    member_list.push(member)
                }))
                const random_member = member_list[Math.round(Math.random()*member_list.length-1)]
                await random_member.voice.disconnect()
                embed.setAuthor({ name: getRandomMessage("random kick", member.displayName, target_member.displayName, random_member.displayName), iconURL: guild.iconURL() })
            }
            else if(0.95 > option)
            {
                // mute himself
                repeatTask(unmutePerson,mutePerson,60*1000,0,[member,60])
                embed.setAuthor({ name: getRandomMessage("self mute", member.displayName, target_member.displayName), iconURL: guild.iconURL() })
            }
            else if(0.99 > option)
            {
                // self-kick
                await member.voice.disconnect()
                embed.setAuthor({ name: getRandomMessage("self kick", member.displayName, target_member.displayName), iconURL: guild.iconURL() })
            }
            else
            {
                //kick everyone
                embed.setAuthor({ name: getRandomMessage("kick everyone", member.displayName, target_member.displayName, guild.name), iconURL: guild.iconURL()})
                guild.channels.get(member.voice.channel.id).members.forEach((member).forEach(member => {
                    member.voice.disconnect()
                }))
            }
        }
        else
        {
            const waitTime = Math.round((nextTime[guild.id][user.id] - currentTime) / (1000))
            embed.setAuthor({ name: "You have to wait " + waitTime + " seconds to use this command!", iconURL: guild.iconURL()})
        }

        return {embeds: [embed], ephemeral: ephemeral}
    }
}



function repeatTask(unfunc,func,max,current,param){
    let counter = 0;
    const interval = setInterval(function () {

        if (counter >= max) {
            unfunc.apply(null, [param])
            clearInterval(interval);
        }else{
            func.apply(null, [param])
        }
        counter = counter+500;
    },100)
}




function mutePerson(param){
    if(!param[0].voice.serverMute){
        param[0].voice.setMute(true,"I am just a mercenary");
    }

}

function unmutePerson(param){
    param[0].voice.setMute(false,"You are free")
}

function getRandomMessage(action, ...args)
{
    let limit = messages[action].length - 1
    let message = messages[action][Math.round(Math.random()*limit)]
    for(let i = 0; i<args.length; i++)
    {
        message = message.replace("$"+(i+1), args[i])
    }
    return message
}

function addTimeout(guildId, userId,time)
{
    if(!nextTime[guildId])
    {
        nextTime[guildId] = {}
    }
    nextTime[guildId][userId] = time
}