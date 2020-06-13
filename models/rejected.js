var mongoose=require('mongoose');


var rejectedEventSchema=new mongoose.Schema({
    owner:String,
    event:String,
    date:String,
    time:String,
    venue:String,
    image:String,
    info:String

});



module.exports=mongoose.model('RejectedEvent',rejectedEventSchema);