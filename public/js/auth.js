//Prompt the user to login and ask for the 'email' permission
function promptLogin() {
  FB.login(null, {
	success: function(response) {
	      	alert("User signed up and logged in through Facebook!" + response);
	  },
	error: function(user, error) {
	    alert("User cancelled the Facebook login or did not fully authorize.");
	  }
});
}

function getNameAndId() {
	//Fetch user's id, name, and picture
    FB.api('/me', {
      fields: 'name, picture'
    },
      function(response) {
        if (!response.error) {
          user = response;

          console.log('Got the user\'s name and picture: ', response);

          //Update display of user name and picture
          if (document.getElementById('user-name')) {
            document.getElementById('user-name').innerHTML = user.name;
          }
          if (document.getElementById('user-picture')) {
            document.getElementById('user-picture').src = user.picture.data.url;
          }
        }

          return false;
        });
	
}

// Handle status changes
function handleStatusChange(session) {
    console.log('Got the user\'s session: ', session);


    if (session.authResponse) {
	 	console.log('in auth response');
        document.body.className = 'connected';

			updateNameAndPic(session);
    }
	else if (response.status === 'not_authorized') {
	    // not_authorized
		document.body.className = 'not_connected';
		promptLogin();
	}
    else  {
      document.body.className = 'not_connected';
		promptLogin();

    }
}

function updateNameAndPic(session) {
	FB.api('/me', {
		fields: 'name, picture'
	},
	function(response) {
		if(!response.error) {
			user = response;
			console.log('Got the user\'s name and picture from updateNameAndPic', response);
			
			//Update display of user name and picture
            if (document.getElementById('user-name')) {
              document.getElementById('user-name').innerHTML = user.name;
            }
            if (document.getElementById('user-picture')) {
              document.getElementById('user-picture').src = user.picture.data.url;
            }
			//return false;
		}
	}
	)
}