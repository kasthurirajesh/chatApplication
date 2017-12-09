var app = angular.module('myapp',['ui.router']);


app.factory('socket', ['$rootScope', function($rootScope) {
    var  socket=io.connect();
    console.log(socket , "socket")
    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);



app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $stateProvider
        .state('homePage',{
            url:'/homePage',
            templateUrl:'/templates/homepage.html',
            controller:'homepageCtrl'

        })
        .state('registration', {
            url: '/registration',
            templateUrl:   '/templates/registration.html',
            controller: 'registrationCtrl'
        })
        .state('Login', {
            url: '/Login',
            templateUrl:  '/templates/login.html',
            controller: 'loginCtrl'
        })

        .state('chat', {
            url: '/chat',
            templateUrl:  '/templates/chat.html',
            controller: 'chat1Ctrl'
        })

        .state('search', {
            url: '/search',
            templateUrl:  '/templates/search.html',
            controller: 'searchCtrl'
        })

        .state('person', {
            url: '/person/:details',
            templateUrl:  '/templates/person.html',
            controller: 'personCtrl'
        })


        //to read the friend request data
        .state('friendRequest', {
            url: '/friendRequest',
            templateUrl:  '/templates/friendRequest.html',
            controller: 'friendRequestCtrl'
        })
        .state('friendRequestPerson', {
            url: '/friendRequestPerson/:details',
            templateUrl:  '/templates/friendRequestPerson.html',
            controller: 'friendRequestAcceptCtrl'
        })
        .state('temp', {
            url: '/temp',
            templateUrl:  '/templates/temp.html',
            controller: 'temppp'
        })
}]);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.controller('chat1Ctrl',['$scope','socket','$http','$state',
    function($scope,socket,$http,$state){

        //chatting details
        $scope.show=1;
        //when back button pressed
        $scope.changeMode = function () {
            $scope.show=1;
        }
        
        // when your friends online
        $scope.onlinefriends=[];
        socket.on('onlineMode' , function (data) {
            $scope.$apply(function() {
                $scope.onlinefriends.push(data);
            });
        })
        
        $scope.MyOwnName=localStorage.getItem('userId');
        $scope.chat = function (id) {
            $scope.show =2;
            console.log($scope.onlinefriends[id]);
            console.log(localStorage.getItem('userId') );
            sendData = { "userId": localStorage.getItem('userId') , "friend" : $scope.onlinefriends[id].friend }
            $scope.showName=$scope.onlinefriends[id].friend;

            $scope.MyFriendName=$scope.onlinefriends[id].friend;

            console.log(sendData);
            $http.post('/getTheMessages', sendData).success(function (response) {
                $scope.Messages=response;
            })
        }
        $scope.information="";

        
        //send Messages
        $scope.send= function() {
            sendData = { "userId":  $scope.MyOwnName , "friend" : $scope.MyFriendName, "mess" : $scope.information }
            socket.emit('sendMessage' , sendData);
            $scope.information="";
        }

        //receive Message
        socket.on('newMessage', function (data) {
            $scope.$apply(function() {
                $scope.Messages.push(data);
                console.log($scope.Messages)
            });
        })


        //search controller
        $scope.search= function () {
            $scope.show = 3;
            console.log('search button pressed')
            $scope.form = {}
            $scope.searchSubmit = function () {
                console.log('searchSubmit')
                ss = {"name": $scope.form.userId}
                socket.emit('search', ss);
            }
        }
        //get the search results

        socket.on('searchResults' , function (data) {
            $scope.$apply(function() {
                $scope.searchResults= data;
                console.log($scope.searchResults ,  "$scope.searchResults")
            });
        })

        $scope.particular = function (index) {
            $scope.show=4;
            console.log($scope.show , "$scope.show")
            console.log(index , "index");
            obj = {
                "id": $scope.searchResults[index].userId,
                "name": $scope.searchResults[index].name, "location": $scope.searchResults[index].address,
                "mobile": $scope.searchResults[index].phone
            }
            $scope.particularPerson=obj;
            $scope.searchResults.splice(index, index + 1);
        }

        $scope.connect = function () {
            sendData = {  "accountHolder" : localStorage.getItem('userId'),
                "friendRequestTo": $scope.particularPerson.id,
                "name" : localStorage.getItem('name')
            }
            $http.post('/pendingRequest' , sendData ).success(function(response) {
                if(response.status == "success")
                {   alert('Friend Request Has sent ');
                }
            })
        }





        //friend Request
        $scope.friendFrequest = function () {
            $scope.show = 5;
            console.log('friendFrequest Pressed')
            sh={"name" : localStorage.getItem('userId') }
            socket.emit('friendRequest' , sh );
        }

        socket.on('friendRequestResulsts' , function (data) {
            $scope.$apply(function() {
                $scope.friendRequestData= data[0].pendingFriendRequest;

                $scope.friendRequestFriend = { "name" : data[0].name , "location" : data[0].address   , "mobile" : data[0].phone }

                console.log($scope.friendRequestData ,  "$scope.searchResults")
            });
        })

        $scope.particularFriendRequest = function (id) {
            $scope.show=6;
            console.log('particularFriendRequest');
            sh={"name" : $scope.friendRequestData[id].userId  }
            socket.emit('friendRequest' , sh );
        }

        $scope.confirm = function (){
            //accountHolder
            data = { "accountHolder" : localStorage.getItem('userId') , "friendName" :  $scope.friendRequestFriend.name }

            $http.post('/friend_request_accept', data).success(function(response) {
                console.log(response);
                if(response.status == "success")
                {
                    alert('Request is Confirmed');
                }
            })
        }






                /*$scope.search= function () {
                    $scope.show = 3;
                    console.log('search button pressed')
                    $scope.form = {}
                    $scope.searchSubmit = function () {
                        ss={"name" : $scope.form.userId }
                        socket.emit('search' ,ss );


                        $http.get('/serach/' + $scope.form.userId, $scope.form).success(function (response) {
                            $scope.searchData = response;
                            console.log(response , "response")
                            console.log($scope.searchData);
                        })
                    }

                    $scope.particular = function (index) {
                        $scope.show=4;
                       console.log(index , "index");
                            $scope.particularPerson = {
                                "id": $scope.searchData[index].userId,
                                "name": $scope.searchData[index].name, "location": $scope.searchData[index].address,
                                "mobile": $scope.searchData[index].phone
                            }
                            $scope.searchData.splice(index, index + 1);
                        }


                    $scope.connect = function () {
                        sendData = {  "accountHolder" : localStorage.getItem('userId'),
                            "friendRequestTo": $scope.particularPerson.id,
                            "name" : localStorage.getItem('name')
                        }
                        $http.post('/pendingRequest' , sendData ).success(function(response) {
                            if(response.status == "success")
                            {   alert('Friend Request Has sent ');
                            }
                        })
                    }
                }*/

        /*$scope.friendFrequest = function () {
            $scope.show=5;
            console.log('friendFrequest Pressed')
            $http.get('/friendRequest/' +localStorage.getItem('userId')).success(function(response) {
                $scope.friendRequestData = response[0].pendingFriendRequest;
                console.log($scope.friendRequestData ,"$scope.friendRequestData");
            })

            var store;
            $scope.particularFriendRequest = function (id) {
                $scope.show=6;
                console.log('particularFriendRequest');
                store=$scope.friendRequestData[id].userId;
                $http.get('/friendRequest/'+ $scope.friendRequestData[id].userId  ).success(function(response) {
                    console.log(response, "response");
                    $scope.$apply(function() {
                        $scope.friendRequestFriend = { "name" : response[0].name , "location" : response[0].address   , "mobile" : response[0].phone }
                    });

                })
            }
            $scope.confirm = function (){
                //accountHolder


                data = { "accountHolder" : localStorage.getItem('userId') , "friendName" :  store }
                $http.post('/friend_request_accept', data).success(function(response) {
                    console.log(response);
                    if(response.status == "success")
                    {
                        alert('Request is Confirmed');
                        $state.go('friendRequest');
                    }
                })
            }
        }*/

    }]);


