
$(function($){	
	
	/*
	 * MODELS
	 */
	
	/*Vent is for firing events from any view*/
	var vent = _.extend({}, Backbone.Events);
	
	// The user represents the current user that is fetched from the database...
	var User = Backbone.Model.extend({
		urlRoot: '/api/users',
		// This idAttribute should set the identifier id
		// to the field facebook id
		idAttribute: 'fbId',
		defaults: {
			fbId: '761506933',
			name: 'Riku',
			location: [],
			upfo: false,
			message: 'Golf anyone?',
			friends: {},
			phoneNumber: '',
			fbaccessToken: '',
			firebaseToken: '',
			upfoTime: 0, //time when user was set upfo.
			notUpfoTime: 0, //time when user should be turned not upfo.
			city: '',
		},
		initialize: function() {
			var _this = this;
			this.fetch({
				success: function() {
					console.log("Fetching success");
					if(!_this.dataRef) {
					_this.dataRef = new Firebase("https://piazzodev.firebaseio.com/");
					console.log(_this.attributes.firebaseToken);
					_this.dataRef.auth(_this.attributes.firebaseToken, function(error) {
						if(error) {
						  console.log("Login Failed!", error);
						} else {
						  console.log("Login Succeeded!");
						}
					})	
					}
				}
			});
			
			//this.browserLocation();
		},
		browserLocation: function(successfun /*optional*/) {
			var _this = this;
			getLocation(function(err, lat, lng) {
				if(!err) {
					console.log('Saving ' + lat + "-" + lng);
					_this.set('location', [lat, lng])
					_this.save({},{
						success: function() {
							if(successfun) successfun();
						}
					});
				} else {
					console.log(err);
				}
			})			
		}
	});
	
	var Alert = Backbone.Model.extend({
		defaults: {
			msg: ""
		},
		initialize: function() {
			
		}
	});
	
	// The friendmodel represents one friend fetched from the database
	var Friend = Backbone.Model.extend({
		defaults: {
			name: "John",
			location: "Helsinki",
			active: true,
			message: "Golf at Pickala at 6ish?",
			city: "No city"
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
				//this.fetch();
				console.log(' In FriendsList, user is upfo, fetched list:' + this)
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
	
	var NonUserFriendsList = Backbone.Collection.extend({
		model: Friend,
		url: 'api/nonuserfriends',
		initialize: function(options) {
			this.user = options.user;
			this.fetch();
			// When user changes upfo, fetch the list again
			//this.listenTo(this.user, 'change:upfo', this.userChanged);
		},
		userChanged: function() {
			if(this.user.attributes.upfo) {
				// Only fetch if upfo is set to true
				this.fetch();
				console.log('In NonUserFriendsList, user is upfo, fetched list:' + this)
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

	// Ths router should be somewhere else
	// also it should work a little different..
	var PiazzoApp = new (Backbone.Router.extend({
		routes: {
			"": "index",
			"options": "options",
			"chat/:chatid": "chat",
			":page": "notfound"
		},
		initialize: function(){
			this.user = new User();
			this.alert = new Alert();
			var msg = "";
			this.alert.set({msg:msg});
			this.headerbarView = new HeaderbarView();
			this.mainView = new MainView();
			
			
		},
		index: function() {
			$('#headerbar').html(this.headerbarView.render().el);
			$('#container').html(this.mainView.render().el);
			this.friendsList = new FriendsList({user: this.user});
			this.nonuserfriendsList = new NonUserFriendsList({user: this.user});
			this.upfoButtonView = new UpfoButtonView( {collection: this.friendsList, model: this.user, alert: this.alert, vent: this.vent} );
			this.alertView = new AlertView( {model: this.alert, vent: this.vent } );
			this.userView = new UserView({collection: this.friendsList, model: this.user, vent: this.vent});
			this.nonuserView = new NonuserView({collection: this.nonuserfriendsList, model: this.user});
			
		},
		options: function() {
			this.optionsView = new OptionsView({model: this.user});
			$('#headerbar').html(this.headerbarView.render().el);
			$('#container').html(this.optionsView.render().el);
		},
		chat: function(chatid) {

			var chatRef = this.user.dataRef.child(chatid);
			this.chatView = new ChatView({user: this.user, chatRef: chatRef});
			$('#headerbar').html(this.headerbarView.render().el);
			$('#container').html(this.chatView.render().el);
		},
		notfound: function(page) {
			// Right now handle them with the standard app
			this.index();
		}
		}));
	Backbone.history.start();
	
	/*Some jQuery css stuff*/
	
	//Position the container div below the header with jQuery.
	$('#container').css('margin-top', $('#navbar').height());
	console.log('headerbar height is: ' + $('#headerbar').height());
	

});

