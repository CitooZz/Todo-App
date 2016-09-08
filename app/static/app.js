angular.module('rootApp', ['ui.router', 'angular-loading-bar', 'ngFileUpload'])


// This is angularjs router

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    // On this router we setup url name, url path, controller that handle action and template url.
    .state('login', {
        url: '/',
        controller: 'LoginController',
        templateUrl: 'static/templates/login.html'
    })
    .state('logout', {
    	url: '/logout',
    	controller: function($scope, $state){
            // Delete token from localstorage when logout.
			window.localStorage.removeItem('JWT');
			$state.go('login', {}, {location:'replace', reload: true});
    	}
    })
    .state('register', {
        url: '/register',
        controller: 'RegisterController',
        templateUrl: 'static/templates/register.html'
    })
    .state('todo', {
        url: '/todo',
        controller: 'TodoController',
        templateUrl: 'static/templates/user_todo.html',
        authenticate: true
    })
    .state('detail_todo', {
        url: '/todo/:id',
        controller: 'DetailTodoController',
        templateUrl: 'static/templates/detail_todo.html',
        authenticate: true
    })
    .state('edit_todo', {
        url: '/todo/:id/edit',
        controller: 'EditTodoController',
        templateUrl: 'static/templates/edit_todo.html',
        authenticate: true
    })
    .state('user_list', {
        url: '/user_list',
        controller: 'UserListController',
        templateUrl: 'static/templates/user_list.html',
        authenticate: true
    })
    .state('admin_user_todo', {
        url: '/admin/user_todo/:user_id',
        controller: 'AdminUserTodoController',
        templateUrl: 'static/templates/admin_user_todo.html',
        authenticate: true
    })
    .state('admin_edit_todo', {
        url: '/admin/todo/:id/edit',
        controller: 'AdminEditTodoController',
        templateUrl: 'static/templates/admin_edit_todo.html'
    })
    .state('403', {
        url: '/403',
        templateUrl: 'static/templates/403.html'
    })
})

// This is $http interceptor, We add JWT token to $http header on this section.

.config(['$httpProvider', function($httpProvider){
	$httpProvider.interceptors.push(['$rootScope', '$location', '$q', function($rootScope, $location, $q){
		return {
			'request': function(config){
                // Try to get token from local storage
				var auth = localStorage.getItem('JWT');

                // initial variable to check wether user is login or Not
				$rootScope.IsLoggedIn = false;

				if (auth){
                    // If there's token on local storage that mean user is logged in.
					auth = JSON.parse(auth).data;
					config.headers.Authorization = 'JWT ' + auth.token;
					$rootScope.IsLoggedIn = true;
				}

				return config
			},
			'responseError': function(response){
                // It's response error checking. When response status is 401 (not authorized) we redirect user to login page
                // If response status 403 (Forbidden) we redirect user to error permission page.
				if (response.status === 401){
					$location.url('/');
				} else if (response.status === 403){
                    $location.url('/403');
                }
				return $q.reject(response);
			}
		}
	}])
}]);