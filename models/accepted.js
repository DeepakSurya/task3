var mongoose=require('mongoose');


var acceptedEventSchema=new mongoose.Schema({
    owner:String,
    event:String,
    date:String,
    time:String,
    venue:String,
    image:String,
    info:String

});



module.exports=mongoose.model('AcceptedEvent',acceptedEventSchema);