
$(function($){	
	
	/*global variables*/
	var alertMessage = ''
	/*
	 * MODELS
	 */
	
	// The user represents the current user that is fetched from the database...
	var User = Backbone.Model.extend({
		urlRoot: '/api/users',
		// This idAttribute should set the identifier id
		// to the field facebook id
		idAttribute: 'fbId',
		defaults: {
			fbId: '761506933',
			name: 'Riku',
			location: 'Helsinki',
			upfo: false,
			message: 'Golf anyone?',
			friends: {},
			phoneNumber: '',
			fbaccessToken: '',
			upfoTime: ''
		},
		initialize: function() {
			this.fetch();
		},
		
		toggleactive: function() {
			var upfor = this.get('upfo');
			var userUpfo = this.get('upfoTime');
			var now = Date.now();
			if (upfor == false) {
				this.set('message', $('#user-message').val());
				this.set('upfoTime', Date.now());
				this.save({upfo : true});
				console.log('upfo set to true');
				//Sends the server a message to tell it to switch upfo status to false in 1 hr.
				time = now + 360000;
				serverSettimer(time);
			}	
				
			else if (upfor === true) {
				
				diff = now - userUpfo;
				// if the user has been upfo for less than 9.5 mins we don't change status right away.
				if (diff < 570000) {
					console.log('has been less than 10 mins since change');
					
					//Sends the server a message to tell it to switch upfo status to false in 10 min - diff. 
					//There should now be enough of a difference so that it doesn't screw it up...
					time = 600000-diff;
					console.log('in toggleactive, time to set is:' + time);
					serverSettimer(time);
				}
				else {
					this.set('message', '');
					this.save({upfo : false});
					//We have to destroy the timer that was created to automatically set the user notupfo after 1 hour
					//serverDestroytimer();
					console.log('upfo set to false'); }
				}
				
			}
});
	
	//Timedupfo is a model of an event that triggers 
	var timedUpfo
	
	
	// The friendmodel represents one friend fetched from the database
	var Friend = Backbone.Model.extend({
		defaults: {
			name: "John",
			location: "Helsinki",
			active: true,
			message: "Golf at Pickala at 6ish?"
		}
	});

	
	/*
	 * COLLECTIONS
	 */
	
	//The FriendList is a collection of all friends the user has.
	var FriendsList = Backbone.Collection.extend({
		model: Friend,
		url: 'api/friends',
		initialize: function(options) {
			this.user = options.user;
			this.fetch();
			// When user changes upfo, fetch the list again
			this.listenTo(this.user, 'change:upfo', this.userChanged);
		},
		userChanged: function() {
			if(this.user.attributes.upfo) {
				// Only fetch if upfo is set to true
				this.fetch();
				console.log('user is upfo, fetched list:' + this)
			} else {
				// Set the status of all friends to "not upfo"
				// To make sure, that they are not somewhere seen as up
				userFriends = this.where({user: true});
				_.each(userFriends, function(friend){
					friend.set("upfo", false);
				});
			}		
		}
	});

	
	
	
// 	var mainView = new MainView({page: "upfo"});
// 	var user = new User();
// var friendsList = new FriendsList({user: user});
// var activeView = new ActiveView( {model: user} );
// 	// var isupfoView = new IsupfoView({collection: friendsList, model: user});
// 	// var notupfoView = new NotupfoView({collection: friendsList, model: user});
// 	var upfoView = new UpfoView({collection: friendsList, model:user});
// 	var nonuserView = new NonuserView({collection: friendsList, model: user});
// 	//friendsList.reset(friendsData);
// 	//friendsList.fetch();

	// Ths router should be somewhere else
	// also it should work a little different..
	var PiazzoApp = new (Backbone.Router.extend({
		routes: {
			"": "index",
			"options": "options",
			":page": "notfound"
		},
		initialize: function(){
			this.user = new User();
			this.headerbarView = new HeaderbarView();
			this.mainView = new MainView();
		},
		index: function() {
			console.log("In the index route");
			$('#headerbar').html(this.headerbarView.render().el);
			$('#container').html(this.mainView.render().el);
			this.friendsList = new FriendsList({user: this.user});
			this.activeView = new ActiveView( {model: this.user} );
			this.upfoView = new UpfoView({collection: this.friendsList, model: this.user});
			this.nonuserView = new NonuserView({collection: this.friendsList, model: this.user});
		},
		options: function() {
			this.optionsView = new OptionsView({model: this.user});
			$('#container').html(this.optionsView.render().el);
		},
		notfound: function(page) {
			// Right now handle them with the standard app
			this.index();
		}
		}));
	Backbone.history.start();

});