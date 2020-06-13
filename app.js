var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var newCampground;
var mongoose=require('mongoose');
var passport=require('passport');
var passportLocalMongoose=require('passport-local-mongoose');
var LocalStrategy=require('passport-local');
var session=require('express-session');
//var cookieParser=require('cookie-parser');
var cryptoRandomString = require('crypto-random-string');
var Session=require('./models/session');
var User=require('./models/user');
var Event=require('./models/event');
var AcceptedEvent=require('./models/accepted');
var RejectedEvent=require('./models/rejected');
var PrivateEvent=require('./models/privateevent');
var alreadyAdded=false;
var events;
var id;
var username;


mongoose.connect('mongodb://localhost/myapp1');
app.set('view engine','ejs');


app.use(bodyParser.urlencoded({extended:true}));

//app.use(cookieParser());
app.use(session({
    secret:"My name is Deepak Surya",
    resave:false,
    saveUninitialized:false,
    maxAge: Date.now() + (30 * 86400 * 1000)
  //  cookie: { maxAge: 60000 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/',function(req,res){
   // console.log(req.session);
    
    if (req.user) {
        res.render('home',{username:req.session.username});
      } else {
        res.redirect('/login');
      }
});




app.get('/register',function(req,res){
    if(req.user){
        res.send('Log Out first to Register');

    }else{
        res.render('register');

    }

});


app.post('/register',function(req,res){

    req.body.username
    req.body.password
    if(req.user){
    }else{
        User.register(new User({username:req.body.username}),req.body.password,function(err,jp){
            if(err){
                console.log(err);
                return res.render('register');
            }else{
                passport.authenticate("local")(req,res,function(){
                    req.logout();
                    res.redirect('/login');
                });
            }
        });
    }
    
});

app.get('/login',function(req,res,next){
    if(req.user){
        res.send('alerady logged.in')
    }else{
        res.render('login');
        
    }
});





app.post('/login',passport.authenticate('local'),function(req,res){
    req.session.username=req.body.username;
    req.session.id=cryptoRandomString({length: 24, type: 'url-safe'});
   // console.log(req.session.id);
    res.redirect('/');
    Session.create({
        id:req.session.id
    },function(err,sess){
        if(err){
            console.log(err);
        }else{
            User.findOne({username:req.session.username},function(err,userFound){
                userFound.sessionId=sess;
                userFound.save();
                //console.log(userFound);
            })   
        }
    })
   
   
    

});

app.get('/events/new',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username},function(err,userFound){
           res.render('new');
        })


    }else{
        res.redirect('/login');
    }

});
app.get('/privateevents/new',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username},function(err,userFound){
           res.render('newprivate');
        })


    }else{
        res.redirect('/login');
    }

});

app.post('/events',function(req,res){
    Event.create({
        owner:req.session.username,
        event:req.body.event,
        date:req.body.date,
        time:req.body.time,
        venue:req.body.venue,
        image:req.body.image,
        info:req.body.info
    },function(err,event){
        if(err){
            console.log(err);
        }else{
            User.findOne({username:req.session.username},function(err,userFound){
                if(err){
                    console.log(err);
                }else{

                    userFound.events.push(event);
                    userFound.save();
                 //   console.log(userFound);
     
     
                     res.redirect('/events');
                }
              
             })
        }
    })
})

app.get('/privateevents',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username}).populate('privateEvents').exec(function(err,userFound){
            if(err){
                console.log(err);
            }else{

                res.render('myprivateevents',{userFound:userFound});
            }
        })
    }else{
        res.redirect('/login');
    }

});

app.post('/privateevents',function(req,res){
    PrivateEvent.create({
        from:req.session.username,
        to:req.body.to,
        event:req.body.event,
        date:req.body.date,
        time:req.body.time,
        venue:req.body.venue,
        image:req.body.image,
        info:req.body.info
    
        

     

    },function(err,event){
        if(err){
            console.log(err);
        }else{
            User.findOne({username:req.body.to},function(err,userFound){
                if(err){
                    console.log(err);
                }
               userFound.privateEvents.push(event);
               userFound.save();
             //  console.log(userFound);


                res.redirect('/privateevents');
                // console.log('');
             })
        }
    })
})


app.get('/events',function(req,res){
  // 
  if(req.user){
    Event.find({},function(err,events){
        if(err){
            console.log('err');
        }else{
        //    console.log(events);
            res.render('events',{events:events})
        }
    
      })
  }else{
      res.redirect('/login');
  }
 

});

app.get('/events/new',function(req,res){
    if(req.user){
        res.render('new');

    }
    else{
      res.redirect('/login')  ;
    }

});

app.get('/myevents',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username}).populate('events').exec(function(err,userFound){
            if(err){
                console.log(err);
            }else{
             //   console.log(userFound);
                if(userFound.events.length>0){
                    res.render('myevents',{userFound:userFound});
        
                 }else{
                    res.render('noevents');
        
                 }

            }
        })

    }
    else{
      res.redirect('/login')  ;
    }

});

app.get('/logout',function(req,res){

   if(req.user){
    req.logout();
    if(req.user){
        res.send('log out fail');
       
       }else{
        Session.update({id:req.session.id}, {$unset: {field: 1 }}, function(err,suc){
            if(err){console.log(err)
            }else{
               // console.log('suc');
            }
        });
               
       // Session.findOne({id:req.session.id}, function(err, user){
            //correctly sets the key to null... but it's still present in the document
           

          //  user.id = null;
          
            // doesn't seem to have any effect
           // delete user.id;
          
          //  user.save();
       //   });

          res.redirect('/login');

       
   }}
   else{
       res.redirect('/login');
   }
  
});

app.get('/rejected',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username}).populate('rejectedEvents').exec(function(err,userFound){
            if(err){
                console.log(err);
            }else{
            console.log(userFound);
         if(userFound.rejectedEvents.length>0){
            res.render('rejected',{userFound:userFound});

         }else{
            res.render('noevents');

         }

            }
        });
    }else{
        res.redirect('/login');
    }
   

});

app.get('/accepted',function(req,res){
    if(req.user){
        User.findOne({username:req.session.username}).populate('acceptedEvents').exec(function(err,userFound){
            if(err){
                console.log(err);
            }else{
         if(userFound.acceptedEvents.length>0){
            res.render('accepted',{userFound:userFound});

         }else{
            res.render('noevents');

         }

            }
        });
    }else{
        res.redirect('/login');
    }
   

});

app.get('/events/:id',function(req,res){

    if(req.user){
        //console.log(req.params.id);
        Event.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                res.render('show',{event:eventFound});
            }
        })
    }
    else{
      res.redirect('/login')  ;
    }

    
});

app.get('/rejectedevents/:id',function(req,res){

    if(req.user){
      //  console.log(req.params.id);
        RejectedEvent.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                res.render('show',{event:eventFound});
            }
        })
    }
    else{
      res.redirect('/login')  ;
    }

    
});

app.get('/acceptedevents/:id',function(req,res){

    if(req.user){
     //   console.log(req.params.id);
        AcceptedEvent.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                res.render('show',{event:eventFound});
            }
        })
    }
    else{
      res.redirect('/login')  ;
    }

    
});

app.get('/privateevents/:id',function(req,res){

    if(req.user){
        console.log(req.params.id);
        PrivateEvent.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                res.render('showprivate',{event:eventFound});
            }
        })
    }
    else{
      res.redirect('/login')  ;
    }

    
});



app.get("/events/:id/reject",function(req,res){
    if(req.user){
        Event.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                if(eventFound.rejectedBy.includes(req.session.username)){
                    res.send('already rejected');
                }else{
 
                 User.findOne({username:req.session.username},function(err,userFound){
                     if(err){
                      console.log(err);
                     }else{
                         
                          userFound.rejectedEvents.push(eventFound);
                          userFound.save();
                          eventFound.rejectedBy.push(req.session.username);
                          eventFound.save();
                          res.redirect('/rejected');
      
                        
                     
  
  
                     }
                 });
                }
            }
 
        })
     
     }else{
         res.redirect('/login');
     }
    
     
 });


app.get("/events/:id/accept",function(req,res){
   if(req.user){
       Event.findById(req.params.id,function(err,eventFound){
           if(err){
               console.log(err);
           }else{
               if(eventFound.acceptedBy.includes(req.session.username)){
                   res.send('already added')
               }else{

                User.findOne({username:req.session.username},function(err,userFound){
                    if(err){
                     console.log(err);
                    }else{
                        
                         userFound.acceptedEvents.push(eventFound);
                         userFound.save();
                         eventFound.acceptedBy.push(req.session.username);
                         eventFound.save();
                         res.redirect('/accepted');
     
                       
                    
 
 
                    }
                });
               }
           }

       })
    
    }else{
        res.redirect('/login');
    }
   
    
});



app.get("/privateevents/:id/accept",function(req,res){
    if(req.user){
        PrivateEvent.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                if(eventFound.acceptedBy==req.session.username){
                    res.send('already added');
                }else{
 
                 User.findOne({username:req.session.username},function(err,userFound){
                     if(err){
                      console.log(err);
                     }else{
                          eventFound.acceptedBy=(req.session.username);
                          eventFound.save();
                          res.redirect('/private/accepted');
                     }
                 });
                }
            }
 
        })
     
     }else{
         res.redirect('/login');
     }
    
     
 });

 app.get('/private/accepted',function(req,res){
     if(req.user){
        User.findOne({username:req.session.username}).populate('privateEvents').exec(function(err,userFound){
            if(err){
                console.log('err');
            } 
            
            if(userFound.privateEvents.length>0){
                 res.render('privateaccepted',{userFound:userFound})
             }
    
         });
     }else{
         res.redirect('/login');
     }
    
 });



 app.get('/private/rejected',function(req,res){
    if(req.user){
       User.findOne({username:req.session.username}).populate('privateEvents').exec(function(err,userFound){
           if(err){
               console.log('err');
           } 
           
           if(userFound.privateEvents.length>0){
                   
              
                res.render('privaterejected',{userFound:userFound})
                console.log(userFound);
            }
   
        });
    }else{
        res.redirect('/login');
    }
   
});



app.get("/privateevents/:id/reject",function(req,res){
    if(req.user){
        PrivateEvent.findById(req.params.id,function(err,eventFound){
            if(err){
                console.log(err);
            }else{
                if(eventFound.rejectedBy==req.session.username){
                    res.send('already added');
                }else{
 
                 User.findOne({username:req.session.username},function(err,userFound){
                     if(err){
                      console.log(err);
                     }else{
                         
                         
                          eventFound.rejectedBy=(req.session.username);
                          eventFound.save();
                          console.log(userFound);

                        res.redirect('/private/rejected');
      
                        
                     
  
  
                     }
                 });
                }
            }
 
        })
     
     }else{
         res.redirect('/login');
     }
    
     
 });
 
 
 
 



app.listen(1010,function(){
    console.log('server on');
});
