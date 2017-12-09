var express=require('express');
var app=express();
var http=require('http').Server(app);
var io = require('socket.io')(http);
var ip = require('ip');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('chat' , ['users','messages' ]);
var async  = require('async');
var _ =require('underscore');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + "/public"));
app.get('/getName',function(req,res){

    data = {"name" :"Rajesh" }
    res.send(data);
});

app.post('/registration', function (req, res) {
    bag = {
        userId:req.body.userId,
        password:req.body.pass,
        name:req.body.name,
        phone:req.body.mobileNo,
        email:req.body.emailAddress,
        address:req.body.address
    };
    async.series([
        _checkAvailability.bind(null, bag),
        _insertIntoDatabase.bind(null, bag)

    ],function (err) {
        if(err){
            throw  "some where mistake"
        }else{
            if(bag.userPresent!=true){
                data={"status" : true}
                res.json(data);
            }
            else {
                data={"status" : false}
                res.json(data);                                
            }
        }
    })


})
function _checkAvailability(bag , next) {
    db.users.find({userId:bag.userId} , function (err, docs) {
        if(err)
            throw err;
        else{
            if(docs.length >0 ) {
                bag.userPresent = true;
                return next();
            }
            else {
                bag.userPresent = false;
                return next();
            }

        }


    })

}
function _insertIntoDatabase(bag , next) {
    if(bag.userPresent != true) {
        db.users.insert(bag, function (err, docs) {
            if (err)
                throw err;
            else {
                console.log(docs);
                return next();
            }
        })
    }
    else {
        return next();
    }
}

app.get('/getdata' , function (req, res) {

    //stroing pending messages
    db.users.update(
        { userId: "Rajesh" },
        {
            $push: {
                    pendingMessages : { "sender" :"koundinya"  , "message" :"Hi !!" , "date" : "12-11-2222"}
            }
        }
    , function (err, docs) {
            console.log(docs);
            res.json(docs);
        });



})



app.post('/pendingRequest' , function (req, res) {


    accountHolder = req.body.accountHolder;
    friendRequestTo = req.body.friendRequestTo;
    name = req.body.name;
    console.log(accountHolder , "   " , friendRequestTo ,  "   " ,name );

    db.users.update(
        { userId: friendRequestTo },
        {
            $push: {
                pendingFriendRequest :  { userId : accountHolder , name : name }
            }
        }, function (err, docs) {
                if(err)
                    throw err;
                else
                {
                    console.log(docs);
                    docs.status="success";
                    res.json(docs);
                }


        }
    );

})






require("./serverFiles/showFriends")(app,io, db);

require("./serverFiles/friendRequestAccept")(app,io, db);

require("./serverFiles/socket")(app,io, db);





http.listen(8080,function(){
    console.log("Node Server is setup and it is listening on http://"+ip.address()+":8080");
})








