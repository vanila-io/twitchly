"use strict";

const EventEmitter = require('events');
var irc = require("tmi.js");

var ChannelStats = require('./channel_stats.js');
var WordStats = require('./word_stats.js');
var ChatSpeed = require('./chat_speed.js');

let s = class StatsManager extends EventEmitter
{
	constructor(username, password, debug)
	{
		super();

		let options = 
		{
			options:
			{
				debug: debug,
			},
			connection:
			{
				cluster: "main",
				reconnect: true,
			},
			identity:
			{
				username: username,
				password: password,
			},
		};

		this.client = new irc.client(options);
		
		var self = this;
		this.client.on("chat", function(a, b, c, d){ self.onChat(a, b, c, d); });


		this.channels = {};
		this.messageCount = 0;

		this.wordStats = new WordStats;
		this.chatSpeed = new ChatSpeed;
	}

	get datas()
	{
		const o = {};
		o.global = {};

		o.global.numberOfMessages = this.messageCount;
		o.global.mostPopularKeyword = this.wordStats.mostPopular;
		o.global.numberOfMessagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		o.channels = {};

		for (let channel in this.channels)
		{
		    if(!this.channels.hasOwnProperty(channel)) continue;
		    
		    o.channels[channel] = this.channels[channel].datas;
		}

		return o;
	}

	connect()
	{
		const self = this;

		this.client.connect().then(function(data)
		{
			console.log('Connected.');
			self.emit('connected');

		}).catch(function(err)
		{
			console.log('Can not connect to Twitch IRC. ' + err);
		});
	}

	addChannel(name)
	{
		this.client.join(name);
		const c = new ChannelStats(name);
		this.channels[name] = c;
	}

	onChat(channel, user, message, self)
	{
		this.messageCount += 1;
		console.log('Number of messages: ' + this.messageCount);

		if(this.channels[channel])
		{
			this.channels[channel].onChat(user, message, self);
		}

		this.wordStats.computeMessage(message);
		this.chatSpeed.addTick();
	}
}

module.exports = s;