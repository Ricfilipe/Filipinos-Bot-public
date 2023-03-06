const {EmbedBuilder} = require("discord.js");
const RouletteAction = require("../RouletteAction");

module.exports= class DisconnectAction extends RouletteAction {
    execute(member)
    {
        member.voice.disconnect()
    }

    getMessage(member,self) {
        let message = new EmbedBuilder();
        if(self)
        {
            message.setAuthor({ name: "Unlucky, you got disconnected.", iconURL: member.guild.iconURL() })
        }
        else
        {
            message.setAuthor({ name: member.displayName + " got shot, they got disconnected.", iconURL: member.guild.iconURL() })
        }
        return message;
    }

    getName() {
        return "Disconnect";
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

function addTimeout(guildId, userId,time)
{
    if(!nextTime[guildId])
    {
        nextTime[guildId] = {}
    }
    nextTime[guildId][userId] = time
}