angular.module('rootApp', ['ui.router', 'angular-loading-bar', 'ngFileUpload'])


.config(function($stateProvider, $urlRouterProvider){
    $stateProvider

    .state('login', {
        url: '/',
        controller: 'LoginController',
        templateUrl: 'static/templates/login.html'
    })
    .state('logout', {
    	url: '/logout',
    	controller: function($scope, $state){
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
})

.config(['$httpProvider', function($httpProvider){
	$httpProvider.interceptors.push(['$rootScope', '$location', '$q', function($rootScope, $location, $q){
		return {
			'request': function(config){
				var auth = localStorage.getItem('JWT');
				$rootScope.IsLoggedIn = false;
				$rootScope.IsSuperUser = false;

				if (auth){
					auth = JSON.parse(auth).data;
					config.headers.Authorization = 'JWT ' + auth.token;
					$rootScope.IsLoggedIn = true;
				}

				return config
			},
			'responseError': function(response){
				if (response.status === 401){
					$location.url('/')
				}
				return response
			}
		}
	}])
}]);