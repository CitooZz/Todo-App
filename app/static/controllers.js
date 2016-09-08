angular.module('rootApp')  

// Login Controller
.controller('LoginController', ['$scope', '$rootScope', '$state', 'ApiService', 'AuthService', '$http', function($scope, $rootScope, $state, ApiService, AuthService, $http){
	// Redirect to user todo list if already logged in
    if ($rootScope.IsLoggedIn){
        $state.go('todo', {}, {location:'replace'});
    }

    // We use angularjs service on this login function, you can check on services.js
    $scope.doLogin = function(){
		return ApiService.login($scope.email, $scope.password)
			.then(function(resp){
                // Setup token to local storage with this function
				AuthService.saveAuth(resp);
                // redirect to user todo list when success
				$state.go('todo', {}, {location:'replace'});
			}, function error (resp) {
                // It's service that make readable alert;
				ApiService.prettyAlert(resp)
		});
	}
}])

// Register Controller
.controller('RegisterController', function($scope, $location, $http, $rootScope, $state){
    // Redirect to user todo list if already logged in
    if ($rootScope.IsLoggedIn){
        $state.go('todo', {}, {location:'replace'});
    }    

    // This is register controller. email, username, password and confirm_password is required.
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

// Todo Controller
.controller('TodoController', ['$scope', '$http', 'AuthService', '$state', function($scope, $http, AuthService, $state){
    // initial variable to collect todo list
	$scope.todos = [];
    
    // Get user todo list from APIs and set to initial variable.
    $http.get('/api/todo/?format=json').success(function(response){
        $scope.todos = response;
    });

    // Delete todo function
    $scope.DeleteTodo = function(todoID, index){
        if (confirm('Are you sure want to delete this todo?')){
            $scope.todos.splice(index, 1);
            // request delete to API endpoint.
            $http.delete('/api/todo/' + todoID + '/?format=json').success(function(){
                return;
            });
        }
    }

    // Add todo function
    $scope.AddTodo = function(){
        // title and description are required
        if ($scope.title && $scope.description){
            $http.post('/api/todo/?format=json', {title: $scope.title, description: $scope.description})
            .success(function(response){
                $scope.todos.push(response);
                $scope.title = '';
                $scope.description = '';
                $('#add_todo').modal('toggle');
            });
        }
    }
}])

// Detail Todo Controller
.controller('DetailTodoController', ['$scope', '$http', '$stateParams', 'Upload', '$timeout', function($scope, $http, $stateParams, Upload, $timeout){
	// Initial todo variable
    $scope.todo = {};

    // Get detail todo detail info
    $http.get('/api/todo/'+ $stateParams.id +'?format=json').success(function(response){
        $scope.todo = response;
    });

    // initial todo attachments variable
    $scope.attachments = [];

    // Get todo attachments from API.
    $http.get('/api/todo/'+ $stateParams.id +'/attachments/?format=json').success(function(attachments){
        $scope.attachments = attachments;
    });

    // This is upload attachment function
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
                    alert("Something Error");
                    return
            });
        }   
   	}

    // Delete todo attachment function.
    $scope.DeleteAttachment = function(index){
        if (confirm('Are you sure want to delete this attachment?')){
            var item = $scope.attachments[index];
            $scope.attachments.splice(index, 1)
            $http.post('/api/todo/'+ $stateParams.id +'/delete_attachment/?format=json', {id:item.id});
        }
    }

}])

// Edit Todo Controller
.controller('EditTodoController', ['$scope', '$http', '$stateParams', '$location', function($scope, $http, $stateParams, $location){
    // Initial todo variable
    $scope.todo = {};

    // Get todo detail info from API
    $http.get('/api/todo/'+ $stateParams.id +'?format=json').success(function(response){
        $scope.todo = response;
    });
    
    // Save function
    $scope.SaveTodo = function(){
        if ($scope.todo.title && $scope.todo.description){
            // Update todo detail info
            $http.put('/api/todo/' + $stateParams.id + '/?format=json', {title: $scope.todo.title, description: $scope.todo.description})
                .success(function(response){
                    $location.url('todo')
            });
        }
    }
}])

// User List Controller
.controller('UserListController', ['$scope', '$http', 'ApiService' , function($scope, $http, ApiService){
        // Initial user list variable.
        $scope.users = [];
        
        // Get user list from API
        $http.get('/api/user/?format=json').success(function(response){
            $scope.users = response;
        })
      
}])

// Admin User Todo Controller
.controller('AdminUserTodoController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams){
    // Initial user todo list variable
    $scope.todos = [];
    // Get user id from param URL and set it to user_id variable.
    $scope.user_id = $stateParams.user_id;
      
    // Get user todo list from API
    $http.get('/api/user/'+ $stateParams.user_id +'/todos/?format=json').success(function(response){
        $scope.todos = response;
    });

    // Delete user todo function.
    $scope.DeleteTodo = function(todoID, index){
        if (confirm('Are you sure want to delete this todo?')){
            $scope.todos.splice(index, 1);
      
            $http.delete('/api/todo/' + todoID + '/?format=json').success(function(){

            });
        }
    }

    // Add todo function
    $scope.AddTodo = function(){
        // title and description are required
        if ($scope.title && $scope.description){
            $http.post('/api/todo/?format=json', {title: $scope.title, description: $scope.description, user: $scope.user_id})
            .success(function(response){
                $scope.todos.push(response);
                $scope.title = '';
                $scope.description = '';
                $('#add_todo').modal('toggle');
            });
        }
    }

}])

// Admin Edit Todo Controller
.controller('AdminEditTodoController', ['$scope', '$http', '$stateParams', '$location', function($scope, $http, $stateParams, $location){
    // Initial todo variable
    $scope.todo = {};

    // Get todo detail info
    $http.get('/api/todo/'+ $stateParams.id +'?format=json').success(function(response){
        $scope.todo = response;
    });
    
    // Save todo function
    $scope.SaveTodo = function(){
        if ($scope.todo.title && $scope.todo.description){
            $http.put('/api/todo/' + $stateParams.id + '/?format=json', {title: $scope.todo.title, description: $scope.todo.description})
                .success(function(response){
                    $location.path('/admin/user_todo/' + $scope.todo.owner_id)
            });
        }
    }
}])