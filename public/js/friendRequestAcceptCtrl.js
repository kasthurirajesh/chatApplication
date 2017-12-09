
app.controller('friendRequestAcceptCtrl', function ($scope , $stateParams , $state, $http){

    console.log($stateParams.details , "$stateParams.details")

    //first i have to show data to the user
    $http.get('/friendRequest/'+ $stateParams.details  ).success(function(response) {
        console.log(response);
        $scope.obj = { "name" : response[0].name , "location" : response[0].address   , "mobile" : response[0].phone }
    })



    $scope.confirm = function () {
        //accountHolder
        
        data = { "accountHolder" : localStorage.getItem('userId') , "friendName" :  $stateParams.details }

        $http.post('/friend_request_accept', data).success(function(response) {
            console.log(response);
            if(response.status == "success")
            {
                alert('Request is Confirmed');
                $state.go('friendRequest');
            }
        })
    }

})
