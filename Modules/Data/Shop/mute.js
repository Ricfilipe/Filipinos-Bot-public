const { MessageEmbed } = require('discord.js');
const shopItem = require("../shopItem")



module.exports= class  shopMute extends shopItem {
    constructor() {super();
    this.func= this.mute;
    }

    async buildParam(msg,client,user,guild,member,interaction) {
        const str = await msg.split(/\s+/);
        const userStr = str[0].match(/<@!\d+>/)

        if (!userStr) {
           return [false,"Please tag a valid user!"];
        } else {
            str[0] = str[0].replace("<@!","").replace(">","");
            if (str.length >= 2) {
                if(!Number( str[1])){
                    return [false,"Please insert a number..."];
                } else {
                    console.log(str[0])
                    let taggedUser = await guild.members.fetch(str[0]);
                    console.log(taggedUser)
                    return [true,[taggedUser,Number( str[1
                        ])]];
                }
            }else{
                return [false,"Not enough parameters, try again..."];
            }
        }
    }

    getPrice(param){
        return Math.pow(10000,Number(param[1])/10);
    }

    getBuyCommand() {
        return "mute @target <time>"
    }


    getDescription(){
        return"Mutes a person for a desired amount of time\n" +
            "Price: 10000^(seconds/10) points";
    }

    getDisplayBuyMessage(msg,param,user){
        const embed = new MessageEmbed();
        embed.setTitle( param[1][0].displayName +" has been muted for "+ param[1][1] + " seconds")
        embed.setAuthor({name:"Muted by "+user.tag,iconURL: user.avatarURL()})

        return {embeds:[embed]};

    }

    mute(target,time){

        this.repeatTask(unmutePerson,mutePerson,time*1000,0,[target,time])
        console.log("mute "+ target + " for " + time);
    }

    repeatTask(unfunc,func,max,current,param){
        let counter = 0;
        const interval = setInterval(function () {

                if (counter >= max) {
                    unfunc.apply(null, [param])
                    clearInterval(interval);
                }else{
                    func.apply(null, [param])
                }
                console.log(counter/1000)
                counter = counter+100;
            },100)

    }
}



function     mutePerson(param){
    if(!param[0].voice.serverMute){
        param[0].voice.setMute(true,"I am just a mercenary");
    }

}

function     unmutePerson(param){
    param[0].voice.setMute(false,"You are free")
}
