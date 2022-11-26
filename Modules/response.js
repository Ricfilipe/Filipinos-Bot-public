const DiscordJS = require("discord.js");
const axios = require('axios');

module.exports={ reply:async  (client,interaction, response) =>
    {
        const data = await prepareData(client,interaction, response);

        client.api.interactions(interaction.id,interaction.token).callback.post(
            {data:{
                    type:4,
                    data,
                }
            });
    },
    edit:async  (client,interaction, response) =>{
        const data = typeof response === 'object' ? { embeds: [ response ] } : { content: response };
        // Get the channel object by channel id:
        axios.patch(`https://discord.com/api/v8/webhooks/${client.user.id}/${interaction.token}/messages/@original`, data)

    },
    delete:async (client,interaction) =>{
        axios.delete(`https://discord.com/api/v8/webhooks/${client.user.id}/${interaction.token}/messages/@original`)
    }
}

async function createAPIMessage (client,interaction, content)
{
    const {data,files} = await DiscordJS.APIMessage.create(
        client.channels.resolve(interaction.channel_id),
        content
    ).resolveData().resolveFiles()

    return {...data,files}
}

async function prepareData(client,interaction, response){
    let data = {
        content: response
    }

    if(typeof response === 'object'){
        data = await createAPIMessage(client,interaction,response)
    }
    return data
}