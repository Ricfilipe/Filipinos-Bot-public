const {EmbedBuilder} = require("discord.js");
const MAXIMUM_BULLETS = 10

module.exports= class RouletteAction {
    constructor() {
        this.chance = 1 / MAXIMUM_BULLETS;
        this.currentChance = this.chance;
        this.executed = false
    }

    getName() {
        throw new Error("You cannot call an Abstract Method.")
    }

    shoot(member,self)
    {
        let success = false
        let hit = false
        let result = ""
        if(!this.executed)
        {
            success = true
            if(Math.random()<this.currentChance)
            {
                this.executed = true;
                hit = true
                this.execute(member)
                result = this.getMessage(member,self);
            }else
            {
                this.currentChance = this.chance + this.currentChance;
                result = new EmbedBuilder()
                if(self)
                {
                    result.setAuthor({ name: "You were lucky, that was an empty chamber.", iconURL: member.guild.iconURL() })
                        .setDescription("You can `/shoot` other people.")
                }
                else
                {
                    result.setAuthor({ name: member.displayName + " lives another day, that was an empty chamber.", iconURL: member.guild.iconURL() })
                }

            }
        }
        else
        {
            result = new EmbedBuilder();
        }

        return {success:success, hit:hit, message:result}
    }

    execute(target) {
        throw new Error("You cannot call an Abstract Method.")
    }

    getMessage(target,self) {
        throw new Error("You cannot call an Abstract Method.")
    }

    hasExecuted(){
        return this.executed;
    }
}
