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
		this.model.toggleactive();
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
		var nonUser = this.collection.where({user: false}).slice(0,7);
		
		this.$el.html("");
		

		_.each(nonUser, function(friend){
			self.$el.append(new FriendView({model:friend}).render().el);
		});

		return this; //It's good to always return this from render() 
	}		
});

var MainView = Backbone.View.extend({
	el: "#container",
	template: _.template( $('#page_upfo_t').html()),
	initialize: function(options) {
		this.render(options);
	},
	render: function(options) {
		var template;
		if(options.page === "upfo") {
			this.template = _.template( $('#page_upfo_t').html() );
		} else {
			this.template = _.template( $('#page_notfound_t').html() );
		}
		this.$el.append(this.template());	
			
		return this;
	}
});