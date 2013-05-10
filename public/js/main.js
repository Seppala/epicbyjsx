
$(function($){	
	
	/*global variables*/
	//var alertMsg = ''
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
			upfoTime: '', //time when user was set upfo.
			notUpfoTime: '', //time when user should be turned not upfo.
			city: '',
		},
		initialize: function() {
			this.fetch();
			//this.browserLocation();
		},
		browserLocation: function() {
			// unused
			var _this = this;
			getLocation(function(err, lat, lng) {
				if(!err) {
					console.log('Savng ' + lat + "-" + lng);
					_this.set('location', [lat, lng]);
					_this.save();
				} else {
					console.log(err);
				}
			})			
		},
		toggleactive: function(view) {
			
			var upfo = this.get('upfo');
			console.log("in main, toggleactive, upfo variable is: " + upfo);

			if (upfo === false) {
				//this.collection.reset();
				this.set('message', $('#user-message').val());
				this.save({upfo : true}, {
					
				});
				console.log('upfo set to true in toggleactive function');
				return upfo;
				}	
				
			else if (upfo === true) {
				console.log("in main toggleactive, setting upfo to false");
				//this.save({upfo : false}, {wait:true});
				saveResponse = this.save({upfo : false}, {success: function(model, response) {
					console.log('upfo:' + model.get('upfo'));
				
					upfo = model.get('upfo');
					if (upfo === true) {
						console.log("It's been under 10 mins! But I don't know how to alert the user of this!");
						return upfo;
					}
					else if (upfo === false) {
						console.log("status was changed on server! But how do I alert the user of this?!?!");
						return upfo;
					}
				}});
			}
			
			/* Example
			saveCountry: function() {
			    this.model.save({},{
			        success: function(model, response) {
			            console.log('success! ' + response);
			        },
			        error: function(model, response) {
			            console.log('error! ' + response);
			        }
			    });
			    this.render();

			    return false;
			},
			*/
			
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
			console.log('init piazzoapp: user' +  this.user);
			this.alert = new Alert();
			console.log('init piazzoapp: alert' +  this.alert);
			this.headerbarView = new HeaderbarView();
			this.mainView = new MainView();
			
			
		},
		index: function() {
			console.log("In the index route");
			$('#headerbar').html(this.headerbarView.render().el);
			$('#container').html(this.mainView.render().el);
			this.friendsList = new FriendsList({user: this.user});
			console.log('in index: function(): alert' +  this.alert);
			this.upfoButtonView = new UpfoButtonView( {collection: this.friendsList, model: this.user, alert: this.alert, vent: this.vent} );
			this.alertView = new AlertView( {model: this.alert, vent: this.vent } );
			this.userView = new UserView({collection: this.friendsList, model: this.user, vent: this.vent});
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