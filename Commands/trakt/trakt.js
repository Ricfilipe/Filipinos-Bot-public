const { MessageEmbed } = require('discord.js');
const request = require('request-promise-native');
require('dotenv').config();
const TRAKT_API_KEY = process.env.TRAKT_API_KEY;

module.exports= {
    json: {
        "name": "trakt",
        "description": "Shows the takt.tv profile of someone",
        "options": [
            {
                "name": "name",
                "description": "user's name",
                "type": 3,
                "required": true,
            },]

    },
    callback: async ({client,interaction ,args,guild,member,user}) => {
        let embed =""

        const bodyStats = await request .get({
            url: 'https://api.trakt.tv/users/'+args.getString("name")+'/stats',
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': TRAKT_API_KEY
            }},
            (error) => {
                if (error) {
                    console.error(error)

                }
            })

        const bodyProfile = await request.get({
                url: 'https://api.trakt.tv/users/'+args.getString("name")+'?extended=full',
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': TRAKT_API_KEY
                }},
            (error) => {
                if (error) {
                    console.error(error)

                }
            })

        const bodyWatched = await request.get({
                url: 'https://api.trakt.tv/users/'+args.getString("name")+'/history//?page={1}&limit={10}',
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': TRAKT_API_KEY
                }},
            (error) => {
                if (error) {
                    console.error(error)

                }
            })



        if(bodyStats && bodyProfile) {
            const jsonWatched =JSON.parse(bodyWatched)
            const jsonProfile = JSON.parse(bodyProfile);
            const jsonStats = JSON.parse(bodyStats);
            embed= "worked";
            embed = new MessageEmbed();
            embed.setAuthor({name:"Trakt.tv",iconURL:"https://trakt.tv/assets/logos/header@2x-d6926a2c93734bee72c5813819668ad494dbbda651457cd17d15d267bc75c657.png"})
                .setURL("https://trakt.tv/users/"+args.getString("name"))
                .setTitle(jsonProfile.username + "'s Profile")
                .setThumbnail(jsonProfile.images.avatar.full)
                .setColor('#ff0a0a')
                .setDescription('Watched '+ jsonStats.movies.watched+ " :movie_camera: Movies ("+jsonStats.movies.minutes+" minutes)\n" +
                                "Watched "+ jsonStats.shows.watched+" :tv: Shows ("+jsonStats.episodes.minutes+" minutes)\n" +
                                "Total of " + jsonStats.episodes.watched + " episodes");

            const currentTime = new Date();

            embed.addField("Recently Watched:", "\u200b");
            for(let entry of jsonWatched) {
                let watchedTime = new Date(entry.watched_at)
                let timeMessage = watchedTime.toLocaleDateString()

                let minutesDiff = diff_minutes(currentTime,watchedTime);
                let hourDiff = (Math.floor(minutesDiff/60));
                let dayDiff = (Math.floor(hourDiff/24));
                let monthDiff = (Math.floor(dayDiff/30));
                let yearDiff = (Math.floor( monthDiff/12));

                if(monthDiff===0 && yearDiff === 0) {
                    if (dayDiff === 7) {
                        timeMessage = "a week ago"
                    } else if (7 > dayDiff && dayDiff > 0) {
                        if (dayDiff === 1) {
                            timeMessage = "a day ago"
                        } else {
                            timeMessage = dayDiff + " days ago"
                        }
                    } else if (dayDiff === 0 && hourDiff > 0) {
                        if (hourDiff === 1) {
                            timeMessage = "a hour ago"
                        } else {
                            timeMessage = hourDiff + " hours ago"
                        }
                    } else if (dayDiff === 0 && hourDiff === 0 && hourDiff > 0) {
                        if (minutesDiff === 1) {
                            timeMessage = "a minute ago"
                        } else {
                            timeMessage = minutesDiff + " minutes ago"
                        }
                    } else if (dayDiff === 0 && hourDiff === 0 && minutesDiff === 0) {
                        timeMessage = "just now"
                    }
                }
                if(entry.type === 'movie') {
                    embed.addField("• "+entry.movie.title + " ("+entry.movie.year+")","\u200b \u200b" +
                        " "+ entry.action+"ed "+timeMessage+" "+
                        "[[IMDb]](https://www.imdb.com/title/"+ entry.movie.ids.imdb +" 'Link to IMDB') " +
                        "[[Trakt]](https://trakt.tv/movies/"+ entry.movie.ids.trakt +" 'Link to Trakt') "
                        );
                }else { // or episode

                    embed.addField("• "+entry.show.title + " ("+entry.show.year+")" + " S"+entry.episode.season+
                        " E"+entry.episode.number,"\u200b \u200b " +
                        " "+ entry.action+"ed "+timeMessage+" "+
                        "[[IMDb]](https://www.imdb.com/title/"+ entry.show.ids.imdb +" 'Link to IMDB') " +
                        "[[Trakt]](https://trakt.tv/shows/"+ entry.show.ids.trakt +" 'Link to Trakt') "
                        );
                }
            }

        }else{
            embed = args.getString("name") + "was not found."
        }


        return {embeds:[embed]};
    }
}


function diff_minutes(dt2, dt1)
{

    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));

}