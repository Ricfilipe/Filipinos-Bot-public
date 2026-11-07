const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || '');
const MONGO_PASS = encodeURIComponent(process.env.MONGO_PASS || '');
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.daett.mongodb.net/?retryWrites=true&w=majority`;

let pointsStorage = new Map();

module.exports = {
    create: async function (id, name, pts) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            await client.db('Gamble').collection('PointsStorage').insertOne({
                _id: id,
                name: name,
                points: pts,
            });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            pointsStorage.set(id, pts);
        }
    },

    update: async function (id, pts) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            await client.db('Gamble').collection('PointsStorage').updateOne({
                _id: id
            }, { $set: { points: pts } });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    top10: async function () {
        const client = new MongoClient(uri);
        const leaders = [];
        try {
            await client.connect();
            const result = await client.db('Gamble').collection('PointsStorage').find({},
                { projection: { _id: 0, name: 1, points: 1 } }).sort({ points: -1 }).limit(10);
            await result.forEach(k => leaders.push([k.name, k.points]));
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return leaders;
    },

    gettable: async function () {
        if (pointsStorage.size === 0) {
            console.log("Retrieving gamble points from database");
            const client = new MongoClient(uri);
            try {
                await client.connect();
                const result = await client.db('Gamble').collection('PointsStorage').find({},
                    { projection: { _id: 1, points: 1 } });
                await result.forEach(k => pointsStorage.set(k._id, k.points));
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }
    },

    getPoints: function (id) {
        return pointsStorage.get(id) || 0;
    },

    addPoints: function (id, pts) {
        const current = pointsStorage.get(id) || 0;
        const newTotal = current + pts;
        pointsStorage.set(id, newTotal);
        this.update(id, newTotal);
    },

    removePoints: function (id, pts) {
        const current = pointsStorage.get(id) || 0;
        const newTotal = current - pts;
        pointsStorage.set(id, newTotal);
        this.update(id, newTotal);
    },

    distributePoints: async function (v) {
        if (v.voice.channel && !v.voice.mute) {
            if (pointsStorage) {
                if (!pointsStorage.has(v.id)) {
                    const username = (v.user.discriminator && v.user.discriminator !== '0')
                        ? `${v.user.username}#${v.user.discriminator}`
                        : v.user.username;
                    this.create(v.id, username, 10);
                    return;
                }
                this.addPoints(v.id, 10);
            }
        }
    }
};