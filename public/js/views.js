/*
 * VIEWS
 */
var UpfoButtonView = Backbone.View.extend({
	el: "#upfoButtonView",
	template: _.template( $('#upfo_button').html()),
	
	events: {"click button#active" : 'toggleactive',
	"submit #msgForm": "save",
	"click a#editCity": "chooseCityFetch",
	"click a#GPS": "GPS",
	},
	
	initialize: function(options) {
		//this.model.on('change', this.render, this);
		this.model.on('sync', this.render, this);
		this.render(this);
		this.alert = options.alert;
	},
	
	render: function() {
		console.log("rendering upfoButtonView again.")
		this.$el.html("");
		var attributes = this.model.toJSON();
		this.$el.append(this.template(attributes));	
		return this;
	},
	
	//toggleactive changes upfo status depending on the current upfo status. 
	// When user is not upfo and changes to 'up for something' (upfo), a timestamp is set on the server
	// for 1 hour in the future, and the user is changed to "not up for something" automatically after
	// the hour has passed. Technically, each time friends are fetched it's just checked that the user
	// timestamp (notUpfoTime) hasn't passed yet.
	// If the user tries to change upfo status within 10 minutes of going upfo the server will not change
	// the status, but the timestamp (notUpfoTime) is reset to be in 10 minutes from when the user went upfo
	toggleactive: function() {
		console.log('toggleactive in views called');
		var self = this;
		var upfo = this.model.get('upfo');

		// if upfo is false, just turn it to true and save the message the user set.
		if (upfo === false) {
			this.model.set('message', $('#user-message').val());
			var p = this.model.save({upfo : true});
			p.done(function(data, status) {
				console.log('saved status upfo true');
			});
			p.fail(function() {
				console.log('saving upfo true failed');
			});
		}
		// if upfo is true, try to change it to false (saving). Then check whether the server actually
		// changed the status. If not, alert that it has been under 10 minutes.
		else if (upfo === true) {
			console.log("in views toggleactive, setting upfo to false");
					
			var p = this.model.save({upfo : false});
			p.done(function(data, status) {
				upfo = self.model.get('upfo');
				if (upfo === false) {
					console.log('changed status');
					var msg = "Ok go meet some friends! <img href='images/stickhairwave.gif'>";
					self.alert.set({msg:msg});
					$('#ventMsg').append("<img href='images/stickhairwave.gif'>");
				}
				else if (upfo === true) {
					console.log('')
					var msg = "Your status will be changed to not up for something when 10 minutes has passed since you turned 'up for something'.";
					self.alert.set({msg:msg});
				}
			});
		}
	},
	
	// save saves the message when a user changes it after they have switched to upfo
	save: function(e) {
		e.preventDefault();
		this.model.set({
			'message': $('#user-message').val(),
		});
		
		this.model.save({}, {
			success: function() {
				$('button.#msgset').append('<p>Saved</p>');
				console.log("Saved.");
			},
			error: function() {
				$('button.#save').append('<p>Error! Please try again and check your connection.</p>');
				console.log("Error saving.");
			}
		});
		
	},
	
	chooseCityFetch: function(e) {
		e.preventDefault();
		//$('#cityText').append('Check it out');
		$('#cityText').append(': <a href="#" id="GPS">Fetch from GPS </a> or <a href="#options" id="writeCity"> Write your city.</a>');
	},
	
	GPS: function(e) {
		e.preventDefault();
		this.model.browserLocation();
	},
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
		console.log('users' + users)
		
		this.$el.html("");
		var $upfoFriends = $("<tbody></tbody>");
		var $notupfoFriends = $("<tbody></tbody>");
		seeStatusFriends = []
		// If the user is upfo
		
		if (this.model.get("upfo")) {
			_.each(users, function(friend){
				if(friend.attributes.upfo) {
					$upfoFriends.append(new FriendView({model:friend}).render().el);					
				} else {
					$notupfoFriends.append(new FriendView({model:friend}).render().el);
				}
			});
		} else {
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
		console.log("Now setting the spinner in UpfoView, renderalert");
		var spinner = new Spinner(opts).spin(target);
		
	}
	
	
	});

//NonuserView is the view that renders the friends that are users of the app
var NonuserView = Backbone.View.extend({
	el: "#nonuser",

	initialize: function() {
		//this.collection.fetch();
		this.collection.on('reset', this.render, this);
		this.collection.on('change', this.renderSpin, this);
	},
	
	render: function() {
		
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
		this.$el.html("<div id='spin2'>&nbsp;</div>");
		var target = document.getElementById('spin2');
		console.log("Now setting the spinner in NonuserView, renderSpin");
		var spinner = new Spinner(opts).spin(target);
		
	}		
});

// PAGES

var MainView = Backbone.View.extend({
	template: _.template( $('#active_page').html()),
	render: function() {
		this.$el.html(this.template());	
		return this;
	}
});

var HeaderbarView = Backbone.View.extend({
	template: _.template( $('#header_bar').html()),
	render: function() {
		this.$el.html(this.template());
		return this;
	}
});

var OptionsView = Backbone.View.extend({
	template: _.template( $('#page_options_t').html()),
	events: {
		"submit #optionsform": "save"
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
				$('button.#save').append('<p>Saved</p>');
				console.log("Saved.");
			},
			error: function() {
				$('button.#save').append('<p>Error! Please try again and check your connection.</p>');
				console.log("Error saving.");
			}
		});
		
	}
});