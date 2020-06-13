var mongoose=require('mongoose');


var eventSchema=new mongoose.Schema({
    owner:String,
    event:String,
    date:String,
    time:String,
    venue:String,
    image:String,
    info:String,
    acceptedBy:[String],
    rejectedBy:[String]


});



module.exports=mongoose.model('Event',eventSchema);