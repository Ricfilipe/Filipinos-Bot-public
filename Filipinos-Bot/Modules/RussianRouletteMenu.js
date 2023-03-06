const path = require("path");
const fs = require("fs");
const RouletteAction = require("./Data/RouletteAction");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
let actions = []
let activeRoulettes = {}


module.exports = {RussianRouletteMenu: class RussianRouletteMenu
{
    constructor(commandLoader, guild, textChannel, punishment)
    {
        this.commandLoader = commandLoader;
        this.guild = guild;
        this.textChannel = textChannel;
        this.history = []
        this.canceled = false;
        this.loser = "\u200b"

        if (actions.length === 0) {
            getFiles("./Modules/Data/Russian-Roulette").forEach(file => {
                const cls = require('./Data/Russian-Roulette/' + path.basename(file));
                actions.push(cls);
            })
        }
        let random_action = undefined

        if(punishment)
        {
            for(let action of actions)
            {
                if(action.name.startsWith(punishment))
                {
                    random_action = action
                    break
                }
            }
        }
        else
        {
            random_action = actions[Math.round(Math.random() * (actions.length - 1))]
        }

        this.action = new random_action();
    }

    getPunishmentName()
    {
        return this.action.getName()
    }

    async updateStatus()
    {
        let historyStr = "\u200b"
        if (this.history.length > 0) {
            historyStr = this.history.join("\n")
        }

        let embed = new EmbedBuilder();

        let gunHolderStr = "\u200b"
        if (this.gunHolder) {
            gunHolderStr = this.gunHolder.displayName
        }

        const state = this.getRouletteState()

        embed.setAuthor({name: "Russian Roulette: " + state.str, iconURL: this.guild.iconURL()})
            .addFields({name: "Chambers left: ", value: "" + (10 - this.history.length) + "/" + 10, inline: true},
                {name: "Gun Holder", value: gunHolderStr, inline: true},
                {name: "Punishment", value: this.getPunishmentName(), inline: true},
                {name: "Loser:", value: this.loser, inline: true},)
            .setColor(state.color)

        embed.addFields({name: "History", value: historyStr})

        const menu = new ActionRowBuilder();
        menu.addComponents(new ButtonBuilder()
            .setCustomId('selfShoot')
            .setLabel('Shoot Yourself')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(this.canceled || this.action.hasExecuted()))
        menu.addComponents(new ButtonBuilder()
            .setCustomId('cancelRoulette')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(this.canceled || this.action.hasExecuted()))
        if (this.message) {
            if (this.canceled || this.action.hasExecuted()) {
                this.message.edit({embeds: [embed], components: []})
            } else {
                this.message.edit({embeds: [embed], components: [menu]})
            }

        } else {
            this.message = await this.textChannel.send({embeds: [embed], components: [menu]});
        }
    }

    async start()
    {
        await this.updateStatus()
    }

    async cancel()
    {
        this.canceled = true;
        await this.updateStatus();
        this.ended = true
    }

    hasEnded()
    {
        return this.canceled || this.action.hasExecuted()
    }

    async shoot(member, target)
    {
        let message = ""
        if (!this.canceled) {
            let result = this.action.shoot(target, member.id === target.id)
            message = result.message

            if (result.success) {
                this.gunHolder = member
                if (result.hit) {
                    this.loser = target.displayName
                    if (member.id !== target.id) {
                        this.history.push(member.displayName + " :boom::gun: " + target.displayName)
                    } else {
                        this.history.push(member.displayName + " :boom::gun:")
                    }
                    this.ended = true
                } else {
                    if (member.id !== target.id) {
                        this.history.push(member.displayName + "  :gun: " + target.displayName)
                    } else {
                        this.history.push(member.displayName + "  :gun:")
                    }
                }

                await this.updateStatus()
            }
        } else {
            message = new EmbedBuilder();
            message.setAuthor({name: "Failed to shot because roulette has been canceled", iconURL: guild.iconURL()})
        }

        return message
    }


    getRouletteState()
    {
        let state = {str: "Active", color: "#1dd214"}
        if (this.action.hasExecuted()) {
            state = {str: "Completed", color: "#2c6bf3"}
        } else if (this.canceled) {
            state = {str: "Canceled", color: "#fd0000"}
        }

        return state
    }

    end()
    {
        activeRoulettes
    }

    isGunHolder(member)
    {
        return this.gunHolder.id === member.id
    }
},
    activeRoulettes:activeRoulettes
}

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