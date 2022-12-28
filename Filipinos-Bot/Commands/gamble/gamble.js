
const { EmbedBuilder, MessageActionRow, MessageButton, Modal, TextInputComponent, MessageSelectMenu} = require('discord.js');
const responseInterface = require("../../Modules/response")
const Discord = require('discord.js');
const Admin = require('../../Modules/administration');

const GambleUser = require('../../Modules/Data/gambleUser');
const currentGamba = {};

let current_choices
let commandID =[]


const updateTime = 5;

module.exports= {
    json: {
        "name": "gamble",
        "description": "Starts betting!",
        "options":[            {
            "name": "time",
            "description": "the amount of time that this betting lasts (needs to be lower than 895)",
            "type": 4,
            "required": true,
        },
            {
                "name": "title",
                "description": "title of bet",
                "type": 3,
                "required": true,
            },
            {
                "name": "choices",
                "description": "betting choices should be seperated by '$'",
                "type": 3,
                "required": true,
            }]
    },
    callback: async ({client, interaction, args, guild, member, user,commandLoader}) => {
        return {content:`WIP...`, ephemeral:true};
        let name = member.guild.nick || member.user.username;
        let id = user.id;
        let time = args.getInteger("time");
        if(time>15*60-5){
            return {content:"Bet can only be open for 895 seconds", ephemeral:true}
        }
        let choices = args.getString("choices").split(/\s*\$\s*/);

        if(currentGamba[guild.id]){
           return {content:`A bet is already in process`, ephemeral:true};
        }

        else if(choices.length>=2) {
            let title = args.getString("title");

            let gambleEmbed = createEmbedGamba(user,title,time,choices);
            const gambaCommands = generateCommands(user.id,guild.id)
            commandID = (commandLoader.addCommands(client,gambaCommands,guild.id))

            currentGamba[guild.id] = new GambleEntity(id,user,title,time,choices,interaction,client);
            currentGamba[guild.id].interval = setInterval(update,updateTime*1000,client,interaction,currentGamba[guild.id]);

            interaction.reply(gambleEmbed)
            return false
        }else{
            return {content:`Not enough choices, try again...`, ephemeral:true};
        }
    },
    buttons:
        {
            bet : gamba,
            endGamble : endGambling,
            cancelGamble : cancelGamble
        },
    modal:
        {
            winnerModal: pickWinner,
            gambaModal: betLogic
        }
}

function generateCommands(userID,guildID) {

    return {
        gamba:{
            json: {
                "name"
            :
                "gamba",
                    "description"
            :
                "bets on option",
                    "options"
            :
                [{
                    "name": "option",
                    "description": "the amount of time that this betting lasts",
                    "type": 4,
                    "required": true,
                },
                    {
                        "name": "points",
                        "description": "the amount of points you want to bet",
                        "type": 4,
                        "required": true,
                    },]
            }
        ,
            callback: async ({client, interaction, args, guild, member, user}) => {
                const opt = args.getInteger("option") - 1;
                const ammount = args.getInteger("points");
                const guser = new GambleUser(user.id);
                let pts = guser.getPoints();
                if (!currentGamba[guild.id]) {
                    return {content:"No bets started yet", ephemeral:true};
                } else if (currentGamba[guild.id].choices.length < opt || currentGamba[guild.id].choices.length < 0) {
                    return {content:"There only " + currentGamba[guild.id].choices.length + " choices", ephemeral:true};
                } else if (currentGamba[guild.id].currentTime >= currentGamba[guild.id].time) {
                    return {content:"Sorry, bets are closed...", ephemeral:true};
                } else if (currentGamba[guild.id].hasUserBetonOtherOptions(user.id, opt)) {
                    return {content:user.tag + " has already betted in other option.", ephemeral:true};
                } else if (guser.getPoints() < ammount) {
                    return {content:user.tag + `only has ` + pts + " points.", ephemeral:true};
                } else {
                    guser.removePoints(ammount)
                    currentGamba[guild.id].addUserbet(user.id, ammount, opt);
                    return {content:user.tag + ' betted!', ephemeral:true};
                }


            }
        }
    ,
        endgamble:{
            json: {
                "name": "endgamble",
                "description":  "Finishes a gamble!",
                "options":
                [{
                    "name": "winner",
                    "description": "the option that win the bet",
                    "type": 4,
                    "required": true,
                }],
                "default_permission": false

            }
        ,
            callback: async ({client, interaction, args, guild, member, user}) => {

                let winner = args.getInteger("winner") - 1;
                if(user.id === userID) {
                    if (currentGamba[guild.id].currentTime < currentGamba[guild.id].time) {
                        return {content:"Wait for bets to close", ephemeral:true};
                    } else if (user.id !== currentGamba[guild.id].id) {
                        return {content:`You dont have permission to finish the bet`, ephemeral:true};
                    } else if (winner < 0 || winner > currentGamba[guild.id].bets.length) {
                        return {content:`Wrong parameter!`, ephemeral:true};
                    } else {
                        let subtotal = 0;
                        for (let i = 0; i < currentGamba[guild.id].bets.length; i++) {
                            if (i === winner) {
                                continue;
                            }
                            subtotal += currentGamba[guild.id].bets[0];
                        }
                        let ratio = currentGamba[guild.id].total / subtotal;
                        for (let key of currentGamba[guild.id].dict.keys()) {
                            if (winner !== currentGamba[guild.id].dictWhere.get(key)) {
                                continue;
                            }
                            let guser = new GambleUser(key);
                            guser.addPoints(Math.round(currentGamba[guild.id].dict.get(key) * ratio));
                        }
                        await deleteCommands(client, guild.id)
                        currentGamba[guild.id].winnerScreen(winner + 1);
                        currentGamba[guild.id] = null;
                        return {content:"Gamble ended", ephemeral:true};
                    }
                }
                else {
                    return {content:"Only the user that created the bet can end it!", ephemeral:true}
                }

            },
        }
    ,
        cancelgamble: {
            json: {
                "name": "cancelgamble",
                "description": "Cancels a bet",
                "default_permission": false
            }
        ,
            callback: async ({client, interaction, args, guild, member, user}) => {
                const permission = new Discord.Permissions(Number(member.guild.permissions));
                if (permission.has('ADMINISTRATOR')) {
                    for (let key of currentGamba[guild.id].dict.keys()) {
                        let guser = new GambleUser(key);
                        guser.addPoints(currentGamba[guild.id].dict.get(key));
                    }

                    await responseInterface.delete(client, currentGamba[guild.id].msg)

                    deleteCommands(client, guild.id)
                    clearInterval(currentGamba[guild.id].interval);
                    currentGamba[guild.id] = null;
                    return {content:"Bet cancelled..."};
                } else {
                    return {content:"You don't have permissions :)", ephemeral:true};
                }
            },
        }
    }
}


function getApp(client,guildId ){
    const app = client.api.applications(client.user.id);
    if (guildId){
        app.guilds(guildId);
    }
    return app
}



async function deleteCommands(client,guildID){

    commandID.forEach(( value)=> {
        const app = getApp(client,guildID);
        app.commands(value).delete();
    })

}

async function cancelGamble(interaction) {
    const guild = interaction.member.guild
    if(currentGamba[guild.id]){
        const guild = interaction.member.guild;
        for (let key of currentGamba[guild.id].dict.keys()) {
            let guser = new GambleUser(key);
            guser.addPoints(currentGamba[guild.id].dict.get(key));
        }
        currentGamba[guild.id].msg.deleteReply()
        deleteCommands(interaction.client, guild.id)
        clearInterval(currentGamba[guild.id].interval);
        currentGamba[guild.id] = null;
        return {content:"Bet cancelled...",ephemeral:true};
    }
}

async function gamba(interaction) {
    const guild = interaction.member.guild
    if (currentGamba[guild.id]) {
        let options = []
        let index = 1
        for (let choice of currentGamba[guild.id].choices) {
            options.push(
                {
                    label: choice,
                    value: index.toString(),
                }
            )
            index = index + 1
        }

        const choiceSelector = new TextInputComponent()
            .setCustomId('choice')
            .addOptions(options);

        const amountInput = new TextInputComponent()
            .setCustomId("amount")
            .setLabel("How much do you want to bet?")
            .setStyle('SHORT');

        const choiceRow = new MessageActionRow().addComponents(choiceSelector)
        const amountRow = new MessageActionRow().addComponents(amountInput)

        const modal = new Modal()
            .setCustomId('gambaModal')
            .setTitle(currentGamba[guild.id].title)
            .addComponents(choiceRow, amountRow);

        await interaction.showModal(modal);
    }
}

async function betLogic(interaction) {
    const guild = interaction.member.guild
    if(currentGamba[guild.id]) {
        return {content:"Feature does not work waiting for FIX from DISCORD.JS", ephemeral:true};
        const opt = 1 - 1; // TODO: DOES NOT WORK, WAITING FOR DISCORD.JS FIX
        const amount = parseInt(interaction.fields.getTextInputValue("amount"));
        const guser = new GambleUser(interaction.user.id);
        let pts = guser.getPoints();
        if (!currentGamba[guild.id]) {
            return {content: "No bets started yet", ephemeral: true};
        }else if(isNaN(amount) || amount <= 0 ) {
            return {content:"The amount must be a value higher than 0", ephemeral:true};
        } else if (currentGamba[guild.id].choices.length < opt || currentGamba[guild.id].choices.length < 0) {
            return {content:"There only " + currentGamba[guild.id].choices.length + " choices", ephemeral:true};
        } else if (currentGamba[guild.id].currentTime >= currentGamba[guild.id].time) {
            return {content:"Sorry, bets are closed...", ephemeral:true};
        } else if (currentGamba[guild.id].hasUserBetonOtherOptions(interaction.user.id, opt)) {
            return {content:interaction.user.tag + " has already betted in other option.", ephemeral:true};
        } else if (guser.getPoints() < amount) {
            return {content:interaction.user.tag + `only has ` + pts + " points.", ephemeral:true};
        } else {
            guser.removePoints(amount)
            currentGamba[guild.id].addUserbet(user.id, amount, opt);
            return {content:interaction.user.tag + ' betted!', ephemeral:true};
        }
    }
}

async function pickWinner(interaction) {
    const guild = interaction.member.guild
    if(currentGamba[guild.id]) {
        return {content:"Feature does not work waiting for FIX from DISCORD.JS", ephemeral:true};
        let winner = 1 - 1; // TODO: DOES NOT WORK, WAITING FOR DISCORD.JS FIX
        if (currentGamba[guild.id].currentTime < currentGamba[guild.id].time) {
            return {content:"Wait for bets to close", ephemeral:true};
        } else if (interaction.user.id !== currentGamba[guild.id].id) {
            return {content:`You dont have permission to finish the bet`, ephemeral:true};
        } else if (winner < 0 || winner > currentGamba[guild.id].bets.length) {
            return {content:`Wrong parameter!`, ephemeral:true};
        } else {
            let subtotal = 0;
            for (let i = 0; i < currentGamba[guild.id].bets.length; i++) {
                if (i === winner) {
                    continue;
                }
                subtotal += currentGamba[guild.id].bets[0];
            }
            let ratio = currentGamba[guild.id].total / subtotal;
            for (let key of currentGamba[guild.id].dict.keys()) {
                if (winner !== currentGamba[guild.id].dictWhere.get(key)) {
                    continue;
                }
                let guser = new GambleUser(key);
                guser.addPoints(Math.round(currentGamba[guild.id].dict.get(key) * ratio));
            }
            await deleteCommands(interaction.client, guild.id)
            currentGamba[guild.id].winnerScreen(winner + 1);
            currentGamba[guild.id] = null;
            return {content:"Gamble ended", ephemeral:true};
        }
    }
}

async function endGambling(interaction) {
    const guild = interaction.member.guild
    if(currentGamba[guild.id]) {
        if(interaction.user.id === currentGamba[guild.id].id) {
            let options = []
            let index = 1
            for (let choice of currentGamba[guild.id].choices) {
                options.push(
                    {
                        label: choice,
                        value: "" + index,
                    }
                )
                index = index + 1
            }

            const winnerSelector = new MessageSelectMenu()
                .setCustomId('winnerSelector')
                .addOptions(options);

            const row = new MessageActionRow().addComponents(winnerSelector)

            const modal = new Modal()
                .setCustomId('winnerModal')
                .setTitle(currentGamba[guild.id].title)
                .addComponents(row);

            await interaction.showModal(modal);
        }
        else
        {
            return {content:"Only the user that created the bet can end it!", ephemeral:true}
        }
    }
}



function update(client,interaction,gambaEnt) {
    gambaEnt.currentTime = gambaEnt.currentTime+ updateTime;
    const embed = new EmbedBuilder()
        .setColor('#d2c153')
        .setTitle(gambaEnt.title)
        .setAuthor({name:'Gamba'})
        .setDescription('To bet type "/gamba [choice] [points]"')
        .setFooter({text:'Created by ' + gambaEnt.name.tag,iconURL:gambaEnt.name.avatarURL()});

    if(gambaEnt.currentTime >= gambaEnt.time){
        embed.addFields({ name: ':x: Bets are closed!', value: 'Good Luck' },
            { name: '\u200B', value: '\u200B' })
        clearInterval(gambaEnt.interval);
    }else{
        let t= gambaEnt.time - gambaEnt.currentTime;
        embed.addFields({ name: ':white_check_mark: Bets are open for:', value: ''+t+' seconds' },
            { name: '\u200B', value: '\u200B' })
    }



    for (let i = 1; i-1< gambaEnt.choices.length; i++) {
        if(gambaEnt.bets[i-1]){
            embed.addField( '#'+ i +' '+gambaEnt.choices[i-1],gambaEnt.bets[i-1]+' ('+gambaEnt.bets[i-1]*100/gambaEnt.total+'%)',true);
        }else{
            embed.addField( '#'+ i +' '+gambaEnt.choices[i-1],0+' ('+0+'%)',true);
        }
    }

    const  buttonRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('bet')
                .setLabel('Bet')
                .setStyle('PRIMARY')
                .setDisabled(gambaEnt.currentTime >= gambaEnt.time),
            new MessageButton()
                .setCustomId('endGamble')
                .setLabel('End Bet')
                .setStyle('SUCCESS')
                .setDisabled(!(gambaEnt.currentTime >= gambaEnt.time)),
            new MessageButton()
                .setCustomId('cancelGamble')
                .setLabel('Cancel Bet')
                .setStyle('DANGER'),
        )

    interaction.editReply({embeds:[embed], components:[buttonRow]});
}




class GambleEntity {

    constructor(id ,name,title,time, bets, msg,client) {
        this.id = id;
        this.name = name;
        this.time = time;
        this.title = title;
        this.choices = bets;
        this.bets= [];
        this.bets.length = bets.length;
        this.currentTime = 0;
        this.msg = msg;
        this.total = 0;
        this.dict= new Map();
        this.dictWhere = new Map();
        this.client = client
        this.collectors = {}

    }

    hasUserBetonOtherOptions(id,opt){
        if(this.dictWhere.get(id)){
            if(this.dictWhere.get(id) === opt){
                return false;
            }
            return true;
        }


        return false;
    }

    addUserbet(id,ammount,option){
        this.bet(option, ammount);
        let b = 0;
        if (this.dict.get(id)) {
            b = this.dict.get(id);
        }
        this.dict.set(id, b + ammount);
        this.dictWhere.set(id, option);
    }

    bet(choice,bet){
        if(!this.bets[choice]){
            this.bets[choice] = 0;
        }
        this.bets[choice]+=bet;
        this.total+=bet;
    }

    winnerScreen(winner){
        this.currentTime = this.currentTime+ updateTime;
        const embed = new EmbedBuilder()
            .setColor('#f10e0e')
            .setTitle(this.title+' (Finished)')
            .setAuthor({name:'Gamba'})
            .setDescription('To bet type "/gamba [choice] [points]"')
            .setFooter({text:'Created by ' + this.name.tag,iconURL: this.name.avatarURL()});

        if(this.currentTime >= this.time){
            embed.addFields({ name: ':x: Bets are closed!', value: 'Good Luck' },
                { name: '\u200B', value: '\u200B' })
            clearInterval(this.interval);
        }else{
            let t= this.time - this.currentTime;
            embed.addFields({ name: ':white_check_mark: Bets are open for:', value: ''+t+' seconds' },
                { name: '\u200B', value: '\u200B' })
        }


        for (let i = 1; i-1< this.choices.length; i++) {
            if(i === winner) {
                if (this.bets[i - 1]) {
                    embed.addField(':white_check_mark: #' + i + ' ' + this.choices[i - 1], this.bets[i - 1] + ' (' + this.bets[i - 1] * 100 / this.total + '%)', true);
                } else {
                    embed.addField(':white_check_mark: #' + i + ' ' + this.choices[i - 1], 0 + ' (' + 0 + '%)', true);
                }

            }else{
                if (this.bets[i - 1]) {

                    embed.addField('#' + i + ' ~~' + this.choices[i - 1]+"~~", this.bets[i - 1] + ' (' + this.bets[i - 1] * 100 / this.total + '%)', true);
                } else {
                    embed.addField('#' + i + ' ~~' + this.choices[i - 1]+"~~", 0 + ' (' + 0 + '%)', true);
                }

            }
        }

        this.msg.editReply({embeds:[embed], components:[]});
    }


}

function createEmbedGamba(user, title,time,choices){
    const gambleEmbed = new EmbedBuilder()
        .setColor('#d2c153')
        .setTitle(title)
        .setAuthor({name:'Gamba'})
        .setDescription('Use command /gamba [choice] [points]"')
        .addFields({ name: ':white_check_mark: Bets are open for:', value: ''+time+' seconds' },
            { name: '\u200B', value: '\u200B' })
        .setFooter({text:'Created by ' + user.tag, iconURL:user.avatarURL()});
    let i = 1;
    for (let choice of choices) {
        gambleEmbed.addField( '#'+ i +' '+choice,'0 (0%)',true);
        i = i+1;
    }

    const  buttonRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('bet')
                .setLabel('Bet')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('endGamble')
                .setLabel('End Bet')
                .setStyle('SUCCESS')
                .setDisabled(true),
            new MessageButton()
                .setCustomId('cancelGamble')
                .setLabel('Cancel Bet')
                .setStyle('DANGER'),
        )
;

    return {embeds:[gambleEmbed], components:[buttonRow]};
}


