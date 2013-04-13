
var surl = document.URL.split('/')
console.log('document URL:' + surl[2])
//pathArray = window.location.pathname.split( '/' );
//host = pathArray[2];'

if (surl[2] === 'localhost:5000') {
	appID = '217545681715200';
}

else {
	appID = '513729218671638';
}

FB.init({
        appId  : appID,
        frictionlessRequests: true
      });

function sendFBRequest() {
  FB.ui({
    method: 'apprequests',
    message: 'invites you to learn how to make your mobile web app social',
  }, 
  function(response) {
    console.log('sendRequest response: ', response);
  });
}

function sendRequestToRecipients(fbId) {
  FB.ui({method: 'apprequests',
    message: 'My Great Request',
    to: fbId
  }, requestCallback);
}

function requestCallback(response) {
	console.log('user sent request from the list');
}
