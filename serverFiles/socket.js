
/**
 * Created by Rajesh Kumar on 12/2/2017.
 */
var HashMap = require('hashmap');

module.exports = function (app,io, database ) {

    
    var userInfo=null;
    var onlineUers={};
    var user = new HashMap();
    var socketId = new HashMap();

    app.post('/loginVerify' , function (req, res) {
        data ={ userId:req.body.userId ,
            password: req.body.pass
        }
        console.log(data);
        database.users.find(  {$and:[ { userId:req.body.userId} ,  {password: req.body.pass}]} , function (err, docs) {
            if(err)
                throw err;
            else {
                console.log(docs);
                if(docs.length > 0)
                {
                    data = docs[0] ;
                    userInfo=docs[0].userId;
                    console.log('userInfo' , userInfo)
                    data.authentication=true;
                    console.log("authentication success")
                    res.json(data);
                }
                else {
                    data={};
                    data.authentication = false;
                    console.log("authentication fail")
                    console.log(data);
                    res.json(data);
                }

            }
        })

    })


    io.on('connection',function(socket){
     console.log("Connection :User is connected  ");
     console.log("Connection : " +socket.id);
     console.log(userInfo , "userId");
     //when socket is alredy present
      if(  (socketId.get(socket.id) == undefined) && (userInfo!=null ) ){
                  console.log('i am inside if ')
                  user.set(userInfo ,  socket.id );
                  socketId.set(socket.id , userInfo)
                  database.users.find({userId : userInfo }, {friends :1} , function (err, docs) {
                      if(err)
                          throw err;
                      else {
                          list=docs[0].friends;
                          for(var i=0;i<list.length;i++){
                              console.log(list[i].id , "list[i].id");
                              if( user.get(list[i].id ) !=undefined ){
                                  io.to(user.get(list[i].id ) ).emit('onlineMode' , {"friend" :  socketId.get(socket.id)});
                                  io.to( socket.id ).emit('onlineMode' , {"friend" :  list[i].id  });
                                  userInfo=null;
                              }
                          }

                      }
                  })
          userInfo=null;
     }
      else if (socketId.get(socket.id) !=undefined && (userInfo == null)){
          
          console.log('i am inside else')
          console.log(socketId.get(socket.id))

          database.users.find({userId : socketId.get(socket.id)  }, {friends :1} , function (err, docs) {
              if(err)
                  throw err;
              else {
                  list=docs[0].friends;
                  for(var i=0;i<list.length;i++){
                      console.log(list[i].id , "list[i].id");
                      if( user.get(list[i].id ) !=undefined ){
                         // io.to(user.get(list[i].id ) ).emit('onlineMode' , {"friend" :  socketId.get(socket.id)});
                          io.to( socket.id ).emit('onlineMode' , {"friend" :  list[i].id  });
                      }
                  }

              }
          })


     }

     socket.on('sendTheData' , function (data) {
         console.log(data);
     })
     
        //io.to(socket.id).emit('toAngular' , "rajesh");
            //send messages
            socket.on('sendMessage' , function(data) {
                console.log(data.userId , "     " , data.friend);
                var date = new Date(); s=date.getHours()+":"+date.getMinutes();
                obj = {"sender" :  data.userId , "receiver" :  data.friend , "m" : data.mess  ,"Date" : s }
                database.messages.insert(  obj , function (err, docs) {
                    if(err)
                        throw err;
                    else {
                        console.log(docs);
                        
                        console.log(user.get(data.friend) , "user.get(data.friend)")
                        console.log(user.get(data.userId) , "user.get(data.userId)")
                        
                        
                        io.to( user.get(data.friend)).emit('newMessage' , docs);
                        io.to( user.get(data.userId) ).emit('newMessage' , docs );
                    }
                })

            })
            socket.on('search' , function (data) {
                var friendName = data.name;
                console.log(friendName)
                database.users.find( {name: { $regex: friendName  }} , function (err, docs) {
                    if(err)
                        throw err;
                    else {
                        console.log(docs);
                        io.to(socket.id).emit('searchResults' ,  docs);
                    }
                })
            })
            socket.on('friendRequest' , function (data) {
                var friendName = data.name;
                console.log(friendName)
                database.users.find( {userId : friendName } , function (err, docs) {
                    if(err)
                        throw err;
                    else {
                        console.log(docs);
                        io.to(socket.id).emit('friendRequestResulsts', docs);
                    }

                })
                
            })



     })

    //get the messages
    app.post('/getTheMessages' , function (req, res) {
        console.log(req.body.userId , "     " , req.body.friend);
        database.messages.find(  {$or:[ { sender :req.body.userId }  , { sender :req.body.friend } ] } , function (err, docs) {
        if(err)
            throw err;
        else {
            console.log(docs);
            res.json(docs);
        }
        })
    })

    
}

    




    
