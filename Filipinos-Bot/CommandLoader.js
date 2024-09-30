
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const responseInterface = require('./Modules/response')
const AdministrationDB = require('./Modules/Connections/AdministrationDB');
const {Player} = require("discord-player");
const { REST, Routes, Embed, EmbedBuilder} = require('discord.js');
const { DisTube } = require('distube')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const TOKEN = process.env.TOKEN;
const owner = '136894756985896960';

module.exports =class CommandLoader{
    constructor(client, commandDir,guilds) {

        this.player = new DisTube(client, {
            leaveOnStop: false,
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            plugins: [
                new YtDlpPlugin()
            ],
            ffmpeg :
                {
                    path: require('ffmpeg-static')
                }
        })

        this.client = client;

        // initiate menu
        this.player.menu = {}

        this.buttons = {}

        this.rest = new REST({ version: '10' }).setToken(TOKEN);

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
            if (interaction.isCommand() || interaction.isContextMenuCommand()) {

                this.guildsCommands = {}
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
                        if(value.permissions && ! await checkPermissions(value.permissions, member, guild))
                        {
                            const embed = new EmbedBuilder().setColor('#ff0000')
                                                            .setAuthor({name:"You don't have permissions to use this command!", iconURL:guild.iconURL()})

                            response = {embeds: [embed], ephemeral:true}
                        }
                        else
                        {
                            response = await value.callback({
                                client: client,
                                interaction: interaction,
                                args: options,
                                guild: guild,
                                user: user,
                                member: member,
                                commandLoader: this,
                                player: this.player
                            })
                        }
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
                        let response = await value.buttons[interaction.customId]({
                            interaction: interaction,
                            player: this.player})
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

        this.player.on('initQueue', (queue, song) =>{
            console.log("Initiate queue")
            this.player.menu[queue.id].createMenu()
        })

        this.player.on('addSong', (queue, song) =>{
            console.log("Added song")
            this.player.menu[queue.id].updateMenu()
        })

        this.player.on('playSong', (queue, song) =>{
            console.log("Playing Song")
            this.player.menu[queue.id].updateMenu()
        })

        this.player.on('disconnect', (queue, song) => {
            console.log("Disconnected")
            queue.stop()
        })

        this.player.on('deleteQueue', (queue, song) => {
            console.log("Queue deleted")
            if(this.player.menu[queue.id])
            {
                this.player.menu[queue.id].cleanUp()
                delete this.player.menu[queue.id]
            }
        })

        this.player.on('error', (queue, song) => {
            console.log("Error detected")
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

async function bulkCommands(client,functions,cmdLoader,guildID,rest){
    const commands = [];
    for (const [key, value] of Object.entries(functions)) {
        let command = value.json
        commands.push(command)
    }

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await cmdLoader.rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands},
        );

        cmdLoader.rest.put(Routes.applicationGuildCommands(client.user.id, "252110350047117313"), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands.'))
            .catch(console.error);


        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }

    return commands
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

async function checkPermissions(permissions, member, guild) {
    for(let perm of permissions){
        switch (perm) {
            case "admin":
                const adminRole = await AdministrationDB.getAdminRole(guild.id);
                if(adminRole && member.roles.cache.some(role => role.id === adminRole)) {
                    return true
                }
                break
            case "owner":
               if(member.user.id === guild.ownerID)
               {
                   return true
               }
                break
            case "bot-owner":
                if(member.user.id === owner)
                {
                    return true
                }
                break
        }
    }
    return false;
}
