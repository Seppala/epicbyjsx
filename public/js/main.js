$(function($){	
	
	var friendsData = [{name: "Juha", location: "Sydney", upfo: true, user: false},
	{name: "Jonne", location: "Stockholm", upfo: false, user: false},
	{name: "Jarkko", location: "Turku", upfo: false, user: true},
	{name: "Jesse", location: "London", upfo: true, user: false},
	{name: "Janina", location: "Tallinn", upfo: true, user: true}];
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
			fbaccessToken: ''
		},
		initialize: function() {
			this.fetch();
		},
		
		toggleactive: function() {
			var upfor = this.get('upfo');
			if (upfor === true) {
				this.set('message', '');
				this.save({upfo : false});
				console.log('upfo set to false'); }
			else {
				this.set('message', $('#user-message').val());
				this.save({upfo : true});
				console.log('upfo set to true');
			};
			console.log(this.get('name'));
		},
	});
	
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
		initialize: function() {
			this.fetch();
		}
	});

	
	
	
	//var mainView = new MainView();
	var user = new User();
	var friendsList = new FriendsList();
	var activeView = new ActiveView( {model: user} );
	var isupfoView = new IsupfoView({collection: friendsList, model: user});
	var notupfoView = new NotupfoView({collection: friendsList, model: user});
	var nonuserView = new NonuserView({collection: friendsList, model: user});
	//friendsList.reset(friendsData);
	//friendsList.fetch();
});