/*
 * VIEWS
 */
var ActiveView = Backbone.View.extend({
	el: "#activeview",
	template: _.template( $('#button_t').html()),
	
	events: {"click button#active" : 'toggleactive'},
	
	initialize: function() {
		this.model.on('change', this.render, this);
		this.render(this);
	
	},
	
	render: function() {
		this.$el.html("");
		var attributes = this.model.toJSON();
		this.$el.append(this.template(attributes));	
		return this;
	},
	
	toggleactive: function() {
		console.log('doing toggleactive');
		var msg = this.model.toggleactive();
		console.log('got answer from toggleactive: ' + msg);
		console.log('this.model: ' + this.model + 'this.alert: ' + this.alert);
		this.options.alert.save({msg: msg});
	},	
});	

var AlertView = Backbone.View.extend({
	el: "#messages",
	template: _.template( $('#alertMsg').html()),
	initialize: function() {
		var msg;
		this.render(this);
		this.model.on('change', this.render, this);
	},
	
	render: function() {
		var attributes = this.model.toJSON();
		console.log('rendering alertview, attributes(model.toJSON()):' + attributes);
		this.$el.html(this.template(attributes));
		return this;
	},
	
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




var UpfoView = Backbone.View.extend({
	el: "#upfoview",
	template: _.template( $('#upfo_t').html()),
	initialize: function() {
		//this.collection.fetch();
		this.model.on('change', this.render, this);
		this.collection.on('reset', this.render, this);
		this.collection.on('remove', this.render, this);
		this.collection.on('change', this.render, this);
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
	}
	});

//NonuserView is the view that renders the friends that are users of the app
var NonuserView = Backbone.View.extend({
	el: "#nonuser",

	initialize: function() {
		//this.collection.fetch();
		this.collection.on('reset', this.render, this);
	},
	
	render: function() {
		
		var self = this;
		// Take first few nonUsers 
		var nonUser = this.collection.where({user: false});
		
		this.$el.html("");
		

		_.each(nonUser, function(friend){
			self.$el.append(new FriendView({model:friend}).render().el);
		});

		return this; //It's good to always return this from render() 
	}		
});

// PAGES

var MainView = Backbone.View.extend({
	template: _.template( $('#page_upfo_t').html()),
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
		"click button#save": "save"
	},
	initialize: function() {
		this.render();
	},
	render: function() {
		var attributes = this.model.toJSON();
		this.$el.html(this.template(attributes));
		return this;
	},
	save: function() {
		this.model.set("phoneNumber", $('#user-phone').val());
		this.model.save({}, {
			success: function() {
				$('button#save').addClass("success");
				console.log("Saved.");
			},
			error: function() {
				$('button#save').addClass("error");
				console.log("Error saving.");
			}
		});
		
	}
});