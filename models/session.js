var mongoose=require('mongoose');


var sessionSchema=new mongoose.Schema({
    id:String,
});



module.exports=mongoose.model('Session',sessionSchema);