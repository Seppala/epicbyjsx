
//Function for turning the users upfo status to true.
function makeUpfo() {
	var upfo = true;
	var authResponse = FB.getAuthResponse()
	var fbId = authResponse.userID;
	
	$.ajax({
	  	type: "PUT",
	  	url: "/api/user/" + fbId,
		datatype: "json",
	  	data: { upfo: "true"},
		success: function (data, textStatus, jqXHR) {
			console.log('Post response:');
			console.dir(data);
	        console.log(textStatus);
	        console.dir(jqXHR);
		}
		}).done(function( msg ) {
	  		console.log( "Data Saved: " + msg );
	});
	
	
}
