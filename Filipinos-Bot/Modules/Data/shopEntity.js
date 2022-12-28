
const { EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports= class shopEntity{
    constructor() {
        this.shopItens = new Map();


        getFiles("./Modules/Data/Shop").forEach(file =>{
            const cls = require('./Shop/' +path.basename(file));
            this.shopItens.set(path.basename(file).slice(0,-3) , new cls());
        })
    }

    displayShop(){
        const embed = new EmbedBuilder();
        embed.setTitle("Shop List").setDescription("To buy just type /buy <item>")

        for(let key of this.shopItens.keys()){
            embed.addField(this.shopItens.get(key).getBuyCommand(),this.shopItens.get(key).getDescription());

        }
        return embed;
    }

    oldBuy(msg,client){
        let item = tokenizer(msg.content,2);

        if(!this.shopItens.has(item[1])){
            return "Item not found in shop list";
        }

        let shopIt = this.shopItens.get(item[1]);
        return shopIt.buy(item[2]);

    }

    buy(item, args,client,user,guild,member,interaction){
        if(!this.shopItens.has(item)){
            return "Item not found in shop list";
        }
        let shopIt = this.shopItens.get(item);
        return shopIt.buy(args,client,user,guild,member,interaction);

    }

    getItems(){
        return this.shopItens.keys()
    }


}

function tokenizer(msg, nTokens) {
    var token = /(\S+)\s*/g, tokens = [], match;

    while (nTokens && (match = token.exec(msg))) {
        tokens.push(match[1]);
        nTokens -= 1; // or nTokens--, whichever is your style
    }

    if (nTokens) {
        // exec() returned null, could not match enough tokens
        throw new Error('EOL when reading tokens');
    }

    tokens.push(msg.slice(token.lastIndex));
    return tokens;
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