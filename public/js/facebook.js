
FB.init({
        appId  : appID,
        frictionlessRequests: true
      });
/* INVITES *************/

function sendFBRequest() {
  FB.ui({
    method: 'apprequests',
    message: 'Hey, join Piazzo and well be able to meet more often! Its an easy way find friends for lunch, dinner or any escapade right now right here.',
  }, 
  function(response) {
    console.log('sendRequest response: ', response);
  });
}

function sendRequestToRecipients(fbId) {
  FB.ui({method: 'apprequests',
    message: 'Hey, join Piazzo and well be able to meet more often! Its an easy way find friends for lunch, dinner or any escapade right now right here.',
    to: fbId
  }, requestCallback);
}

function requestCallback(response) {
	console.log('user sent request from the list');
}

/*POSTS****************/

function publishFBStory(message) {
  FB.ui({
    method: 'feed',
    name: 'Check out Piazzo! Useful when you want to find friends that are up for something right now.',
    link: "http://piazzo.co",
    picture: 'http://piazzo.co/images/logo512.png'
  }, 
  function(response) {
    console.log('publishStory response: ', response);
  });
  return false;
}
