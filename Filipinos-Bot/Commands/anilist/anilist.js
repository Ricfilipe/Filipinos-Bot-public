const { EmbedBuilder } = require('discord.js');
const urllib = require("urllib");
const responseInterface = require("../../Modules/response")

const genre_per_line=2;

const genreToEmoji = {
    "Action" : ":crossed_swords:",
    "Comedy" : ":laughing:",
    "Adventure": ":map:",
    "Fantasy":":man_mage:",
    "Drama":":cry:",
    "Supernatural":":ghost:",
    "Romance":":two_hearts:",
    "Ecchi":":kiss:",
    "Mystery":":thinking:",
    "Sci-Fi":":flying_saucer:",
    "Thriller":":open_mouth:",
    "Horror":":scream:",
    "Hentai":":underage:",
    "Music":":musical_note:",
    "Mecha":":robot:",
    "Psychological":":brain:",
    "Sports":":medal:",
    "Mahou Shoujo":":woman_superhero:",
    "Slice of Life":":people_hugging:"
}

const colorToHex = {"red": "#E13333",
                    "blue": "#3DB4F2",
                    "purple": "#C063FF",
                    "green": "#4CCA51",
                    "orange": "#EF881A",
                    "pink": "#FC9DD6",
                    "gray": "#677B94"}

module.exports= {
    json: {
        "name": "anilist",
        "description": "Shows the last activity of a person",
        "options": [
            {
                "name": "name",
                "description": "user's name",
                "type": 3,
                "required": true,
            },]

    },
    callback: async ({client,interaction ,args,guild,member,user}) => {

        const variables={
            name: args.getString("name")
        };

        const response = await urllib.request(
            'https://graphql.anilist.co',
            {
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                content:  JSON.stringify({
                    query: userQuery,
                    variables: variables
                })})

        let body;
        if(response.status !== 200)
        {
            console.error(response.res.statusText);
        }
        else
        {
            body = JSON.parse(response.data)
        }


        let embed =""

        if(body.data.user) {

            let color = body.data.user.options.profileColor;
            if(colorToHex[color]){
                color = colorToHex[color];
            }

            embed = new EmbedBuilder();
                embed.setAuthor({name:"Anilist",iconURL:"https://anilist.co/img/icons/apple-touch-icon.png"})
                .setURL(body.data.user.siteUrl)
                .setTitle(body.data.user.name + "'s Profile")
                .setThumbnail(body.data.user.avatar.medium)
                .setColor(color);
            let description = "Genres watched:\n"
            let genresCount = 0
            for (let anime of body.data.user.statistics.anime.genres) {
                if(genresCount === genre_per_line){
                    genresCount = 0;
                    description += "\n";
                }
                let emoji = genreToEmoji[anime.genre]
                if(!emoji)
                    emoji = "";
                let percentage = ((anime.count/body.data.user.statistics.anime.count) * 100).toFixed(1);
                description = description + emoji +" " + anime.genre + ": " + anime.count +
                  " (" +percentage +"%)\u200b \u200b \u200b \u200b";

                genresCount++;

            }
            embed.setDescription(description+"\n\u200b")
            embed.addFields({name: "Last Activity:", value: "\u200b"});

            const lastActivityVariables={
                id: body.data.user.id
            };
            const lastActivitiesBody = await getActivities(lastActivityVariables);
            for(let activity of lastActivitiesBody.data.Page.activities){
                let progress="";
                if(activity.progress){
                    progress = activity.progress;
                }

                embed.addFields({name: "• " +activity.media.title.romaji, value: "\u200b \u200b "+activity.status+ " "+progress})
            }


        }else{
            embed = args.name + "was not found."
        }


        return {embeds:[embed]};
    }
}

const userQuery = `
        query($name:String){
            user: User(name: $name){
                id
                name
                about
                siteUrl
                avatar{
                    medium
                }
                options{
                    profileColor
                }
                statistics{
                    anime{
                        count
                        genres{
                            genre
                            count
                        }
                    }
                }
            }
        }`;

const lastActivityQuery = `
        query($id:Int){
            Page(page: 1,perPage: 10){
                pageInfo{
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                activities(userId: $id,type_in: [ANIME_LIST,MANGA_LIST],sort: [ID_DESC]){
                    ...on ListActivity{
                        status
                        progress
                        media{
                            title{
                                english
                                romaji
                            }
                        }
                    }
                }
            }
        }`;


async function  getActivities(variables){
     const response = await urllib.request(
        'https://graphql.anilist.co',
        {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            content:  JSON.stringify({
                query: lastActivityQuery,
                variables: variables
            }),
        })

    if(response.status !== 200)
    {
        console.error(response.res.statusText);
        return undefined
    }
    else
    {
        return JSON.parse(response.data)
    }
}