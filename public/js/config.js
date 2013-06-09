/*Make the appID and link variables available so the frontend can check whether we're in development or live!*/
var surl = document.URL.split('/')
console.log('document URL:' + surl[2])

if (surl[2] === 'localhost:5000') {
	appID = '217545681715200';
	link = 'http://localhost:5000/';
	place = 'dev';
}

else if (surl[2] == 'piazzo.herokuapp.com']) {
	appID = '513729218671638';
	link = 'http://piazzo.herokuapp.com/';
	place = 'prod';
}

else {
	appID = '607217585963588';
	link = 'http://piazzo.co/';
	place = 'prod';
}

var errmessage = "";