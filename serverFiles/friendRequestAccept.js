/**
 * Created by Rajesh Kumar on 12/1/2017.
 */
var async  = require('async');
var _ =require('underscore');

module.exports = function (app,io, database) {
   
    app.post('/friend_request_accept', function (req, res) {
        bag = {
            userId:req.body.accountHolder,
            friendName: req.body.friendName
        };
        console.log("req.body.accountHolder," , req.body.accountHolder)
        console.log("req.body.accountHolder," , req.body.friendName)

        async.series([
            _fetchData.bind(null,bag),
            _removeFromPendingFriendRequest.bind(null, bag),
            _insertIntoFriendsArray.bind(null, bag),
            _insertIntoFriendsArray2.bind(null, bag)

        ],function (err) {
            if(err){
                throw  "some where mistake"
            }else{
                res.json(bag);
            }

        })
    })


    function _fetchData(bag, next) {
        console.log(bag.userId , "bag.userId " , bag.friendName )
        database.users.find(
            { userId :  bag.userId ,'pendingFriendRequest.userId' :bag.friendName } ,
            { 'pendingFriendRequest.userId' :1 , 'pendingFriendRequest.name' :1 }, function (err, docs) {
                if(err)
                    throw err;
                else {
                    console.log(docs);
                   info= docs[0].pendingFriendRequest;
                   for(var i=0;i<info.length; i++)
                   {
                       if(info[i].userId == bag.friendName )
                       {
                           bag.name =info[i].name;
                           return next();
                       }
                   }


                }
                    
            })

    }


    function _removeFromPendingFriendRequest(bag,next) {

        database.users.update(
            { userId : bag.userId },

            { $pull: {pendingFriendRequest : {  userId : bag.friendName  } } },

            function (err, docs) {
                if(err)
                    throw err;
                else  {
                    bag.removedStatus=true;
                    return next();
                }

            }

        )

    }

    
    
    
    function _insertIntoFriendsArray(bag, next) {
        database.users.update(
            {userId: bag.userId},
            {$push: { friends : { id:  bag.friendName , messages : []  } }  },
            function (err, docs) {
                if(err)
                    throw err;
                else {
                    bag.status="success";
                    return next();
                }
            }
        )
    }
    function _insertIntoFriendsArray2(bag, next) {
        database.users.update(
            {userId: bag.friendName   },
            {$push: { friends : { id: bag.userId , messages : []  } }  },
            function (err, docs) {
                if(err)
                    throw err;
                else {
                    bag.status="success";
                    return next();
                }
            }
        )
    }

}