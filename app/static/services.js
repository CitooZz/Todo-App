angular.module('rootApp')

.service('ApiService', ['$http', function($http){
    var api = {};

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
      }

      alert(detail);
    };

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
    return {
      isSignedIn: function(){
        return this.getAuth() !== null;
      },
      saveAuth: function(data){
        // access_token, expires_in, refresh_token, scope, token_type
        localStorage.setItem(authKey, JSON.stringify(data));
      },
      getAuth: function(data){
        var auth = localStorage.getItem(authKey);
        if (auth) {
          return JSON.parse(auth);
        } else {
          return null;
        }
      },
      getToken: function(){
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