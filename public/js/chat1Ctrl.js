/**
 * Created by Rajesh Kumar on 12/2/2017.
 */




app.controller('homepageCtrl' ,['$scope','socket','$http','$state',
    function($scope,socket,$http,$state) {
        console.log("rajesh kumar");

        //requesting data
        data = { "sender" : "rajesh" , "Receiver" :" ganesh" }
        socket.emit("takedataFromClient",  data) ;
        socket.on('sendDataToClient', function(data) { console.log(data , "data") });



    }])
app.controller('registrationCtrl', function ($scope ,$http){

    $scope.form={};
    $scope.submit=function () {
        console.log($scope.form)
        $http.post('/registration', $scope.form).success(function(response) {
            console.log(response);
            if(response.status == true){
                alert('Successfully Registered');
            }
            else{
                alert('Same user id exists try with another user id');
                $scope.form={};
                $state.go('Login');
            }
        });


    }

})
//here we are not sending socket because connection must establish after the successful authentication
app.controller('loginCtrl' , function ($scope, $state,  $http) {
    $scope.form = {};
    $scope.submit = function () {
        $http.post('/loginVerify', $scope.form).success(function (response) {
            console.log(response);
            if(response.authentication == true) {
                localStorage.setItem('userId', response.userId);

                localStorage.setItem('name', response.name);
                console.log(localStorage.getItem('userId'),  "localStorage.getItem('userId')")
                console.log(localStorage.getItem('name'), "localStorage.getItem('userId')")

                $state.go('chat');
            }
            else
                alert('authentiction is failed');
        })
    }

    $scope.register = function () {
        $state.go('registration');
    }
})





app.controller('searchCtrl', function ($scope , $state,$http){
    $scope.form={}
    $scope.submit= function () {
        console.log($scope.form);

        $http.get('/serach/' +$scope.form.userId , $scope.form).success(function(response) {
            console.log(response);
            $scope.data = response;
            console.log($scope.data);
        })

    }
    $scope.particular = function (index) {
        //console.log( $scope.data[index] , " $scope.data[index] " ) ;
        x= {  "id" :  $scope.data[index].userId,
            "name" : $scope.data[index].name , "location" : $scope.data[index].address, "mobile" : $scope.data[index].phone }
        var myJSON = JSON.stringify(x);
        $state.go('person' , {"details" : myJSON})



    }

})

app.controller('personCtrl', function ($scope , $stateParams , $state, $http){
    console.log('rajesh');
    console.log($stateParams.details , "$stateParams.details")
    $scope.obj = JSON.parse($stateParams.details );
    console.log(localStorage.getItem('userId') , "localStorage.getItem('userId')");

    $scope.connect = function () {
        data = {  "accountHolder" : localStorage.getItem('userId'),
            "friendRequestTo": $scope.obj.id,
            "name" : localStorage.getItem('name')
        }
        console.log(data);
        $http.post('/pendingRequest' , data ).success(function(response) {
            if(response.status == "success")
            { alert('Friend Request Has sent ');
                $state.go('chat');
            }
        })

    }



})

