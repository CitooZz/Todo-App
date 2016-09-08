angular.module('rootApp')
// This is angularjs service that can be used on many place

.service('ApiService', ['$http', function($http){
    var api = {};
    // It's function to make alert readable
    api.prettyAlert = function (resp) {
      var detail = "";
      if ( resp.status === 400 ) {
        var errors = resp.data;
        for (var key in errors){
          if ( errors.hasOwnProperty(key) ) {
            detail += "" + key + ": " + errors[key] + "";
          }
        }
      } else if (resp.status === 401) {
        detail = "Please login.";

      } else if (resp.status >= 500) {
        detail = "The server has encountered an error." ;
      
      } else if (resp.status === 403){
        detail = "You don't have permissions";
      }
      
      alert(detail);
    };

    // It's login service. Collect username and password the request to API. return token
    api.login = function(username, password){
        var data = {
            username: username,
            password: password
        }

        return $http.post('/api/token-auth/', data,{
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return api

}])

.service('AuthService', [function (){
    var authKey = 'JWT';
    // This service consist some function. Such as save auth token to local storage, get token from local storage, check user is logged in.
    return {
      // Check user is logged in or not
      isSignedIn: function(){
        return this.getAuth() !== null;
      },
      saveAuth: function(data){
        // access_token, expires_in, refresh_token, scope, token_type
        localStorage.setItem(authKey, JSON.stringify(data));
      },
      getAuth: function(data){
        // Get user token from local storage. If theres token that mean user already logged in.
        var auth = localStorage.getItem(authKey);
        if (auth) {
          return JSON.parse(auth);
        } else {
          return null;
        }
      },
      getToken: function(){
        // Get token from local storage
        var auth = localStorage.getItem(authKey);
        if (auth){
            return JSON.parse(auth).data;
        }
        else {
            return null;
        }
      }
    };
}])