/* SETUP *********/
/* These were moved to config.js

var surl = document.URL.split('/')
console.log('document URL:' + surl[2]) */
//pathArray = window.location.pathname.split( '/' );
//host = pathArray[2];'

/*
if (surl[2] === 'localhost:5000') {
	appID = '217545681715200';
	link = 'http://localhost:5000';
}

else {
	appID = '513729218671638';
	link = 'http://piazzo.co';
}
*/
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

function publishFBStory() {
  FB.ui({
    method: 'feed',
	//message: msg,
    name: 'Piazzo - meet more friends',
    caption: 'Piazzo is a simple way to figure out who to call when you want to do something',
    description: 'Ever want to find someone for lunch but dont know who to call? Want to have more people over for a pre-party?',
    link: link,
    picture: 'http://www.facebookmobileweb.com/getting-started/img/facebook_icon_large.png'
  }, 
  function(response) {
    console.log('publishStory response: ', response);
  });
  return false;
}
