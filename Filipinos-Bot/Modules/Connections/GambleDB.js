
const { MongoClient } = require('mongodb');
require('dotenv').config();
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const uri = 'mongodb+srv://'+MONGO_USER+':'+ MONGO_PASS +'@cluster0.daett.mongodb.net/Gamble?retryWrites=true&w=majority';

let pointsStorage = new Map();


module.exports = { create: async function (id,name,pts){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        try {
        await  client.connect();
        await client.db('Gamble').collection('PointsStorage').insertOne({
            _id: id,
            name: name,
            points: pts,
        });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            pointsStorage.set(id,pts);
        }

},

    update: async function (id,pts){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        try {
            await  client.connect();
            await client.db('Gamble').collection('PointsStorage').updateOne({
                _id: id
            },{$set:{points:pts}});
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    },
    top10: async function (){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
       const leaders=[];
        try {
            await  client.connect();
             const result = await client.db('Gamble').collection('PointsStorage').find({},
                { projection: {_id:0, name: 1, points: 1 }}).sort({points:-1}).limit(10);
            await result.forEach(k => leaders.push([k.name,k.points]));
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return leaders;
    },
    gettable: async function (){
        if(pointsStorage.size===0) {
            console.log("Retrieving gamble points from database")

            const client = new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            try {
                await client.connect();
                const result = await client.db('Gamble').collection('PointsStorage').find({},
                    {projection: {_id: 1, points: 1}});
                await result.forEach(k => pointsStorage.set(k._id, k.points));
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }

    },
    getPoints: function(id){
        return pointsStorage.get(id);
    },
    addPoints: function(id,pts){
        const current =pointsStorage.get(id);
        pointsStorage.set(id,current+pts);
        this.update(id,current+pts);
    },
    removePoints:function(id,pts){
        const current =pointsStorage.get(id);
        pointsStorage.set(id,current-pts);
        this.update(id,current-pts);

    },
    distributePoints : async function (v){
        if(v.voice.channel && !v.voice.mute) {
            if (pointsStorage) {
                if (!pointsStorage.has(v.id)) {
                    this.create(v.id, v.user.username + "#" + v.user.discriminator, 10);
                    return;
                }
                this.addPoints(v.id,10);
            }
        }
    }
}