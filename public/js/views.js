/*
 * VIEWS
 */
var UpfoButtonView = Backbone.View.extend({
	el: "#upfoButtonView",
	template: _.template( $('#upfo_button').html()),
	
	events: {
		"submit #upfoForm" : 'upfoTrue',
		"click #cancelUpfo": 'upfoFalse',
		"submit #msgForm": "save",
		"click a#editCity": "chooseCityFetch",
		"click a#GPS": "GPS",
	},
	
	initialize: function(options) {
		//this.model.on('change', this.render, this);
		this.renderSpin();
		this.model.on('sync', this.render, this);
		this.alert = options.alert;
		this.render(this);		
	},
	
	render: function() {
		var self = this;
		console.log("rendering upfoButtonView again.");
		this.$el.html("");
		$('#messages').html('');
		var attributes = this.model.toJSON();
		this.$el.append(this.template(attributes));	
		var msg = "";
		self.alert.set({msg:msg});
		return this;
	},

	upfoTrue: function(e) {
		// Set the upfo to true
		console.log('upfoTrue called in UpfoButtonView');
		var self = this;
		e.preventDefault();
		this.model.set('message', $('#user-message').val());
		this.model.set({'upfo': true});
		var p = this.model.save();
		p.done(function(data, status) {
			self.upfoTimer();
			console.log('saved status upfo true in upfoTrue in UpfoButtonView');
			console.log('and this.model is: ' + JSON.stringify(this.model));
		});
		p.fail(function() {
			console.log('saving upfo true failed');
		});
	},

	upfoFalse: function(e) {
		// Set the upfo to false
		e.preventDefault();
		var self = this;
		var p = this.model.save({upfo : false});
		// If the user tries to change upfo status within 10 minutes of going upfo the server will not change
		// the status, but the timestamp (notUpfoTime) is reset to be in 10 minutes from when the user went upfo
		p.done(function(data, status) {
			upfo = self.model.get('upfo');
			if (upfo === false) {
				console.log('changed status');
				$('#messages').append('<h3>Ok, go meet some friends</h3><img src="images/stickhairwave.gif">');
			}
			else if (upfo === true) {
				$('#cancelUpfo').addClass('disabled');
				self.upfoTimer();
				var msg = "Your status will be changed to not up for something when 10 minutes has passed since you turned 'up for something'.";
				self.alert.set({msg:msg});
			}
		});

	},

	upfoTimer: function() {
		var self = this;
		

		var showTimeLeft = function() {
			var msLeft = self.model.get('notUpfoTime') - Date.now();
			var minutesLeft = Math.floor(msLeft / 1000 / 60);
			var secondsLeft = ("00" + Math.ceil(msLeft / 1000) % 60).slice (-2);
			
			$('#cancelUpfo').text("Cancelling in " + minutesLeft + ":" + secondsLeft);

			if(msLeft <= 0) {
				clearInterval(updateTimeLeft);
				// upfo false is used to update the view to show the
				// "I'm upfo button again".
				$('#cancelUpfo').text('Cancelled!');
				self.model.save({upfo: false});
			}
		}

		showTimeLeft();
		var updateTimeLeft = setInterval(showTimeLeft, 1000)
	},
	
	// save saves the message when a user changes it after they have switched to upfo
	save: function(e) {
		e.preventDefault();
		this.model.set({
			'message': $('#user-message').val(),
		});
		
		this.model.save({}, {
			success: function() {
				$('#messages').append('<div class="panel callout">Changed message saved</div>');
				console.log("Saved.");
			},
			error: function() {
				$('#save').append('<div class="panel callout">Error! Please try again and check your connection.</div>');
				console.log("Error saving.");
			}
		});
		
	},
	
	chooseCityFetch: function(e) {
		e.preventDefault();
		//$('#cityText').append('Check it out');
		$('#cityText').html('<a href="#" id="GPS">Fetch from GPS </a> or <a href="#options" id="writeCity"> Write your city.</a>');
	},
	
	GPS: function(e) {
		e.preventDefault();
		this.model.browserLocation();
	},
	
	renderSpin: function() {
		this.$el.html("<div id='see'>&nbsp;</div>");
		var target = document.getElementById('see');
		console.log("Now setting the spinner in UpfoView, renderalert");
		var spinner = new Spinner(opts).spin(target);
		
	}
});


// Alertview is used to show messages to user. These disappear at each refresh of the page.
var AlertView = Backbone.View.extend({
	el: "#messages",
	template: _.template( $('#ventMsg').html()),
	initialize: function(options) {
		var msg;
		_.bindAll(this, "showUpfo");
		this.render(this);
		this.model.on('change', this.render, this);
	//	options.vent.bind("toggleUpfo", this.showUpfo, msg);
	},
	
	render: function() {
		var attributes = this.model.toJSON();
		console.log('rendering alertview, attributes(model.toJSON()):' + attributes);
		this.$el.html(this.template(attributes));
		return this;
	},
	
	showUpfo: function(msg) {
		this.$el.html(this.template({msg : msg}));
	}
});

var FriendView = Backbone.View.extend({
	tagName: "tr",
	template: _.template( $('#friend_t').html()),
	initalize: function() {
	},
	render: function() {
		var attributes = this.model.toJSON();
		$(this.el).append(this.template(attributes));
		return this; 
	}
	
});


var UserView = Backbone.View.extend({
	el: "#userView",
	template: _.template( $('#userList').html()),
	initialize: function() {
		this.renderSpin();
		//this.collection.fetch();
		this.model.on('request', this.renderSpin, this);
		this.model.on('change', this.renderSpin, this);
		this.model.on('sync', this.render, this);
		this.collection.on('request', this.renderSpin, this);
		this.collection.on('change', this.renderSpin, this);
		this.collection.on('sync', this.render, this);
	},
	render: function() {
		
		var self = this;
		var users = this.collection.where({user: true});
		console.log('render in UserView and users' + JSON.stringify(users));
		
		this.$el.html("");
		var $upfoFriends = $("<tbody></tbody>");
		var $notupfoFriends = $("<tbody></tbody>");
		seeStatusFriends = []
		// If the user is upfo
		
		if (this.model.get("upfo")) {
			console.log('in render in userView and user is upfo');
			_.each(users, function(friend){
				if(friend.attributes.upfo) {
					$upfoFriends.append(new FriendView({model:friend}).render().el);					
				} else {
					$notupfoFriends.append(new FriendView({model:friend}).render().el);
				}
			});
		} else {
			console.log('in render in userView and user is NOT upfo');
			_.each(users.slice(0,3), function(friend){
				seeStatusFriends.push(friend.attributes.name);
			})
		}
		
		this.$el.append(this.template({
			$upfoFriends: $upfoFriends, 
			$notupfoFriends: $notupfoFriends, 
			seeStatusFriends: seeStatusFriends,
			upfo: this.model.get("upfo")
		}));
		return this; //It's good to always return this from render() 
	},
	
	renderSpin: function() {
		this.$el.html("<div id='see'>&nbsp;</div>");
		var target = document.getElementById('see');
		console.log("Now setting the spinner in UserView, renderSpin");
		var spinner = new Spinner(opts).spin(target);
		
	}
	
	
	});

//NonuserView is the view that renders the friends that are users of the app
var NonuserView = Backbone.View.extend({
	el: "#nonuser",

	initialize: function() {
		//this.collection.fetch();
		this.renderSpin();
		this.collection.on('sync', this.render, this);
		this.collection.on('change', this.renderSpin, this);
	},
	
	render: function() {
		
		$('#spin2').remove();
		var self = this;
		this.$el.html("");
		// Take first few nonUsers 
		var nonUser = this.collection.where({user: false});

		_.each(nonUser, function(friend){
			self.$el.append(new FriendView({model:friend}).render().el);
		});

		return this; //It's good to always return this from render() 
	},
	
	renderSpin: function() {
		$("#container").prepend('<div id="spin2"></div>');
		var target = document.getElementById('spin2');
		var spinner = new Spinner(opts).spin(target);
		/*this.$el.html("<div id='spin2'>&nbsp;</div>");
		var target = document.getElementById('container');
		target.$el.html("<div id='spin2'>&nbsp;</div>");
		console.log("Now setting the spinner in NonuserView, renderSpin");
		var spinner = new Spinner(opts).spin(target);*/
		
	}		
});

// PAGES

var MainView = Backbone.View.extend({
	className: 'dynamicContent',
	template: _.template( $('#active_page').html()),
	render: function() {
		this.$el.html(this.template());	
		return this;
	}
});

var HeaderbarView = Backbone.View.extend({
	className: 'navbar',
	template: _.template( $('#headerbarr').html()),
	render: function() {
		this.$el.html(this.template());
		return this;
	}
});

var OptionsView = Backbone.View.extend({
	template: _.template( $('#page_options_t').html()),
	events: {
		"submit #optionsform": "save",
		"click button#fetchGPS": "getLocation",
		"change #optionsform": "notsaved"
	},
	
	initialize: function() {
		this.model.fetch();
		this.model.on('change', this.render, this);
		this.render();
	},
	render: function() {
		var attributes = this.model.toJSON();
		this.$el.html(this.template(attributes));
		return this;
	},
	save: function(e) {
		e.preventDefault();

		this.model.set({
			'phoneNumber': $('#user-phone').val(),
			'city': $('#user-city').val()
		});
		
		this.model.save({}, {
			success: function() {
				$('#save').text('Saved.');
				console.log("Saved.");
			},
			error: function() {
				$('#optionsbuttons').append('<p>Error! Please try again and check your connection.</p>');
				console.log("Error saving.");
			}
		});
		
	},

	notsaved: function() {
		// Function to reset the "saved" button
		console.log("Not saved yet.")
		$('#save').text('Save changes');
	},
	
	getLocation: function(e) {
		e.preventDefault();

		// Make sure the changes for the phone number are not lost
		this.model.set({
			'phoneNumber': $('#user-phone').val()
		});
		
		this.model.browserLocation(function() {
			$('#save').text('Saved.');
		});
	},
	
});