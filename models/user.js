var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');

var sessionSchema=new mongoose.Schema({
    id:String,
});

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    //sessionId://sessionSchema,
    sessionId:String,
    events:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    
    }],
    acceptedEvents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    
    }],
    rejectedEvents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    
    }],
    privateEvents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'PrivateEvent'
    
    }]
    
       
});


userSchema.plugin(passportLocalMongoose);



module.exports=mongoose.model('User',userSchema);