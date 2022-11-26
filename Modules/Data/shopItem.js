const GambleUser= require('./gambleUser');

module.exports= class   shopItem {
    constructor() {

    }


    buildParam(msg,client,user,guild,member,interaction) {
        const param = msg.content.splice(" ");
        if(param.length>= this.func.length){
            return [true,param]
        }
        return [false,"Wrong parameters, try again..."];
    }

    async buy(msg,client,user,guild,member,interaction) {

        const param = await this.buildParam(msg,client,user,guild,member,interaction);
        console.log(param)
        if (param[0]) {
            let guser = new GambleUser(user.id);
            let price = Math.round( this.getPrice(param[1]));
            if(price>guser.getPoints()){
               return {content:user.tag+" doesn't have enough points..."}
            }
            this.func.apply(this,param[1]);
            guser.removePoints(price);
            return this.getDisplayBuyMessage(msg,param,user);
        }
        return {content:param[1]};
    }

    getPrice(param){}

    getBuyCommand(){}

    getDescription(){

    }


    getDisplayBuyMessage(msg){}
}






