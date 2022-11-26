

const fs = require('fs');
const path = require('path');
const DiscordJS = require("discord.js");
const responseInterface = require('./Modules/response')
const AdministrationDB = require('./Modules/Connections/AdministrationDB');

const owner = '136894756985896960';

module.exports =class CommandLoader{
    constructor(client, commandDir,guilds) {

        this.buttons = {}

        this.guilds = guilds
        if (!client) {
            throw new Error("No Discord JS Client provided as first argument!");
        }
        if (!commandDir) {
            throw new Error("No command directory");
        }

        const basename = "js";
        this.functions = {}

        getFiles(commandDir).forEach(file =>{
            this.functions[path.basename(file).slice(0,-3)] = require('./' +file);
        })

        bulkCommands(client,this.functions,this);

        client.on('interactionCreate', async (interaction)=>{
            if (interaction.isCommand()) {


                const options = interaction.options;
                const name = interaction.commandName;
                const command = name.toLowerCase()
                const args = {}

                const guild = interaction.member.guild;
                const member = interaction.member;
                const user = interaction.user;

                let response;
                for (const [key, value] of Object.entries(this.functions)) {
                    if (key.toLowerCase() === command) {
                        response = await value.callback({
                            client: client,
                            interaction: interaction,
                            args: options,
                            guild: guild,
                            user: user,
                            member: member,
                            commandLoader: this
                        })
                    }
                }
                if (response) {
                    await interaction.reply(response)
                }
            }
            else if(interaction.isButton())
            {
                for (const [key, value] of Object.entries(this.functions)) {
                    if (value.buttons && value.buttons[interaction.customId])
                    {
                        let response = await value.buttons[interaction.customId](interaction)
                        if (response) {
                            await interaction.reply(response)
                        }
                        return;
                    }
                }
            }else if(interaction.isModalSubmit())
            {
                for (const [key, value] of Object.entries(this.functions)) {
                    if (value.modal && value.modal[interaction.customId])
                    {
                        let response = await value.modal[interaction.customId](interaction)
                        if (response) {
                            await interaction.reply(response)
                        }
                        return;
                    }
                }
            }
        })
        this.client = client;


    };

    addCommands(client,commands,guildID){

        for (const [key, value] of Object.entries(commands)) {
            this.functions[key] = value;
        }

        return  postCommands(client,commands,guildID)
    }

    addNewGuild(guild){
        this.guilds.push(guild)
    }
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

function getApp(client,guildId ){
    const app = client.api.applications(client.user.id);
        if (guildId){
            app.guilds(guildId);
        }else{
            //TODO REMOVE AFTER
            app.guilds('252110350047117313');
        }
    return app
}

async function postCommands(client,functions,guildID){
        const commandID = [];
        for (const [key, value] of Object.entries(functions)) {

            const app = getApp(client,guildID);
            const {id} = await app.commands.post({data: value.json});
            if(value.permission){
                postPermissions(client,value,id,guildID);
            }
            commandID.push(id)
        }
        return commandID

}

async function postPermissions(client,command,id,guildID){

    const permission = await generatePermission(client,command.permission,id,guildID)
    const app = getApp(client,guildID);
    app.commands(id).permissions().put({data:{permissions:permission}
    })
}

async function bulkCommands(client,functions,cmdLoader,guildID){
    const bulk = [];
    for (const [key, value] of Object.entries(functions)) {
        bulk.push(value.json)
    }
    const app = getApp(client,guildID);
    const commands = await app.commands.put({data:bulk});

    console.log("Ready to receive commands!")
    const commandID = [];
    for(let {id} of commands){
        commandID.push(id)
    }
    return commandID
}

async function bulkPermissions(client,functions,commands,guildID){
    const permissions =[]
    for(let {id,name} of commands) {
        if(functions[name].permission) {
            await postPermissions(client,functions[name],id,guildID)
        }

    }
}

async function generatePermission(client,perms,id,guildid){
    const permissions = []
    const guild =  await client.guilds.resolve(guildid);

    for(let perm of perms){
        switch (perm){
            case "admin":
                const adminRole = await AdministrationDB.getAdminRole(guildid);
                if(adminRole) {
                    permissions.push({
                        "id":adminRole,
                        "type": 1,
                        "permission": true
                    })
                }
                break
            case "owner":
                permissions.push({
                    "id":guild.ownerID,
                    "type":2,
                    "permission":true
                })
                break
            case "bot-owner":
                permissions.push({
                    "id":owner,
                    "type":2,
                    "permission":true

                })
                break
            default:
                permissions.push({
                    "id":perm,
                    "type":2,
                    "permission":true
                })
        }
    }

    return permissions

}