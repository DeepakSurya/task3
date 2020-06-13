var mongoose=require('mongoose');


var privateEventSchema=new mongoose.Schema({
    from:String,
    to:String,
    owner:String,
    event:String,
    date:String,
    time:String,
    venue:String,
    image:String,
    info:String,
    acceptedBy:String,
    rejectedBy:String

});



module.exports=mongoose.model('PrivateEvent',privateEventSchema);