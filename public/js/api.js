
//Function for turning the users upfo status to true.
function makeUpfo() {
	var upfo = true;
	var authResponse = FB.getAuthResponse()
	var fbId = authResponse.userID;
	
	$.ajax({
	  	type: "PUT",
	  	url: "http://agile-plateau-5423.herokuapp.com/api/user/" + fbId,
		datatype: "json",
	  	data: { upfo: "true", fbId: fbId }
		}).done(function( msg ) {
	  		alert( "Data Saved: " + msg );
	});
	
	
}