/**
 * Created by Rajesh Kumar on 12/1/2017.
 */
app.controller('friendRequestCtrl', function ($scope , $state,$http){

    console.log('i am inside friend request controller');

    console.log(localStorage.getItem('userId') , "localStorage.getItem('userId')")
    
    $http.get('/friendRequest/' +localStorage.getItem('userId')).success(function(response) {
        console.log(response);
        $scope.data = response[0].pendingFriendRequest;
        console.log($scope.data );
    })

    $scope.particular = function (id) {
        console.log(id);
        console.log("id" , $scope.data[id].userId )
        $state.go('friendRequestPerson' , {"details" : $scope.data[id].userId } )
    }


})