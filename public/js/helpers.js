/* serverSettimer is given a time, that sets a timer on the server to turn upfo off. It's also passed a success function*/

function serverSettimer(time) {

	$.post("/api/timeupfo/", {'time' : time});

};