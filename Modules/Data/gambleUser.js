
const GambleDB = require('../Connections/GambleDB');

module.exports =class GambleUser{
    constructor(id) {
        this.id= id;
    };

    getPoints(){
        return GambleDB.getPoints(this.id);
    }

   removePoints( pts){
       return GambleDB.removePoints(this.id,pts);
    }

    addPoints(pts){
        return GambleDB.addPoints(this.id,pts);
    }

}