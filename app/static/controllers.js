angular.module('rootApp')  

.controller('LoginController', ['$scope', '$rootScope', '$state', 'ApiService', 'AuthService', '$http', function($scope, $rootScope, $state, ApiService, AuthService, $http){
	$scope.doLogin = function(){
		return ApiService.login($scope.email, $scope.password)
			.then(function(resp){
				AuthService.saveAuth(resp);

				$state.go('todo', {}, {location:'replace'});
			}, function error (resp) {
				ApiService.prettyAlert(resp)
		});
	}
}])

.controller('RegisterController', function($scope, $location, $http){
	$scope.Register = function(){
		if ($scope.password !== $scope.confirm_password){
			alert('Password missmatch!')
			return;
		}
		data = {
			email: $scope.email,
			username: $scope.email,
			password: $scope.password
		}

		$http.post('/api/register/?format=json', data).success(function(resp){
			alert('Success Register, Please login');
			$location.url('/')
		})
	}
})

.controller('TodoController', ['$scope', '$http', 'AuthService', '$state', function($scope, $http, AuthService, $state){

	$scope.todos = [];
      
    $http.get('/api/todo/?format=json').success(function(response){
        $scope.todos = response;
    });

    $scope.DeleteTodo = function(todoID, index){
        if (confirm('Are you sure want to delete this todo?')){
            $scope.todos.splice(index, 1);
      
            $http.delete('/api/todo/' + todoID + '/?format=json').success(function(){
                return;
            });
        }
    }

    $scope.AddTodo = function(){
        if ($scope.title && $scope.description){
            $http.post('/api/todo/?format=json', {title: $scope.title, description: $scope.description}, {headers: {'X-CSRFToken': '{{csrf_token}}'}})
            .success(function(response){
                $scope.todos.push(response);
                $scope.title = '';
                $scope.description = '';
                $('#add_todo').modal('toggle');
            });
        }
    }
}])

.controller('DetailTodoController', ['$scope', '$http', '$stateParams', 'Upload', '$timeout', function($scope, $http, $stateParams, Upload, $timeout){
	$scope.todo = {};

    $http.get('/api/todo/'+ $stateParams.id +'?format=json').success(function(response){
            $scope.todo = response;
    });

    $scope.attachments = [];

    $http.get('/api/todo/'+ $stateParams.id +'/attachments/?format=json').success(function(attachments){
        $scope.attachments = attachments;
    });

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/todo/'+ $stateParams.id +'/add_attachment/?format=json',
                data: {file: file}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    $scope.attachments.push(response.data);
                });
            }, function (response) {
                if (response.status > 0)
                    alert(response.data);
                    return
            });
        }   
   	}

    $scope.DeleteAttachment = function(index){
        if (confirm('Are you sure want to delete this attachment?')){
            var item = $scope.attachments[index];
            $scope.attachments.splice(index, 1)
            $http.post('/api/todo/'+ $stateParams.id +'/delete_attachment/?format=json', {id:item.id});
        }
    }

}])

.controller('EditTodoController', ['$scope', '$http', '$stateParams', '$location', function($scope, $http, $stateParams, $location){
    $scope.todo = {};

    $http.get('/api/todo/'+ $stateParams.id +'?format=json').success(function(response){
        $scope.todo = response;
    });
        
    $scope.SaveTodo = function(){
        if ($scope.todo.title && $scope.todo.description){
            $http.put('/api/todo/' + $stateParams.id + '/?format=json', {title: $scope.todo.title, description: $scope.todo.description})
                .success(function(response){
                    $location.url('todo')
            });
        }
    }
}])

.controller('UserListController', ['$scope', '$http' , function($scope, $http){
        $scope.users = [];
      
        $http.get('/api/user/?format=json').success(function(response){
            $scope.users = response;
        });
      
}])

.controller('AdminUserTodoController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams){
    $scope.todos = [];
    $scope.user_id = $stateParams.user_id;
      
    $http.get('/api/user/'+ $stateParams.user_id +'/todos/?format=json').success(function(response){
        $scope.todos = response;
    });

    $scope.DeleteTodo = function(todoID, index){
        if (confirm('Are you sure want to delete this todo?')){
            $scope.todos.splice(index, 1);
      
            $http.delete('/api/todo/' + todoID + '/?format=json').success(function(){

            });
        }
    }    
}])