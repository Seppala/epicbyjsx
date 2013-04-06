/*
 * VIEWS
 */

var FriendView = Backbone.View.extend({
	tagName: "tr",
	template: _.template( $('#friend_t').html()),
	initalize: function() {
	},
	render: function() {
		var attributes = this.model.toJSON();
		console.log(attributes);
		$(this.el).append(this.template(attributes));
		return this; 
	}
	
});

var ActiveView = Backbone.View.extend({
	el: "#check",
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
		console.log('I\'m in toggleactive' + this.model + ' collection:' + this.collection);
		this.model.toggleactive();
	},	
});

//IsupfoView is the view that renders the friends that are upfo.
var IsupfoView = Backbone.View.extend({
	el: "#upfo",

	initialize: function() {
		//this.collection.fetch();
		this.collection.on('reset', this.render, this);
		this.model.on('change', this.render, this);
	},
	
	render: function() {
		
		var self = this;
		var isUpfo = this.collection.where({user: true, upfo: true});
		
		this.$el.html("");
		if (this.model.get("upfo")) {
			_.each(isUpfo, function(friend){
				self.$el.append(new FriendView({model:friend}).render().el);
			});
		}
		return this; //It's good to always return this from render() 
	}
		
});

//NotupfoView is the view that renders the friends that are NOT upfo.
var NotupfoView = Backbone.View.extend({
	el: "#notupfo",

	initialize: function() {
		
		//this.collection.fetch();
		this.collection.on('reset', this.render, this);
		this.model.on('change', this.render, this);
	},
	
	render: function() {
		
		var self = this;
		var notUpfo = this.collection.where({user: true, upfo: false});
		
		this.$el.html("");
		if (this.model.get("upfo")) {
			_.each(notUpfo, function(friend){
				self.$el.append(new FriendView({model:friend}).render().el);
			});
		}
		return this; //It's good to always return this from render() 
	}
		
});

//NonuserView is the view that renders the friends that are users of the app
var NonuserView = Backbone.View.extend({
	el: "#nonuser",

	initialize: function() {
		//this.collection.fetch();
		this.collection.on('reset', this.render, this);
		this.model.on('change', this.render, this);
	},
	
	render: function() {
		
		var self = this;
		var nonUser = this.collection.where({user: false});
		
		this.$el.html("");
		
		if (this.model.get("upfo")) {
			_.each(nonUser, function(friend){
				self.$el.append(new FriendView({model:friend}).render().el);
			});
		}
		return this; //It's good to always return this from render() 
	}
		
});