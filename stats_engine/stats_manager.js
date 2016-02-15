"use strict";

const EventEmitter = require('events');
let irc = require("tmi.js");

let ChannelStats = require('./channel_stats.js');
let WordStats = require('./word_stats.js');
let ChatSpeed = require('./chat_speed.js');

let Database = require('./../database/database.js');

let s = class StatsManager extends EventEmitter
{
	constructor(username, password, debug, memoryTimeout)
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
		this.speakerStats = new WordStats;
		this.chatSpeed = new ChatSpeed;

		this.memoryTimeout = memoryTimeout ? memoryTimeout : 60000; // 60 seconds, 1 minutes (in millis)

		this.message = {};
		this.message.date = -1;


		setInterval(function()
		{
			self.flush();
		}, this.memoryTimeout);
	}

	get datas()
	{
		const o = {};
		o.global = {};

		o.global.numberOfMessages = this.messageCount;
		o.global.mostPopularKeyword = this.wordStats.mostPopular;
		o.global.mostActiveSpeaker = this.speakerStats.mostPopular;
		o.global.numberOfMessagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		o.channels = {};

		for (let channel in this.channels)
		{
		    if(!this.channels.hasOwnProperty(channel)) continue;
		    
		    o.channels[channel] = this.channels[channel].datas;
		}

		return o;
	}

	get lastMessage()
	{
		return this.message;
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
		this.speakerStats.addWord(user['display-name']);
		this.chatSpeed.addTick();

		if(this.message.date === -1 || Date.now() - this.message.date > 500)
		{
			this.message.channel = channel;
			this.message.user = user;
			this.message.message = message;
		}
	}

	flush()
	{
		for (let channel in this.channels)
		{
		    if(!this.channels.hasOwnProperty(channel)) continue;
		    
		    this.channels[channel].flush({from: Date.now() - this.memoryTimeout, to: Date.now()});
		}

		let o = {};
		o.from = Date.now() - this.memoryTimeout;
		o.to = Date.now();
		o.numberOfMessages = this.messageCount;
		o.numberOfMessagesPerMinutes = Math.round(this.chatSpeed.messagesByMinutes);
		o.mostCommonWord = this.wordStats.mostPopular;
		o.mostActiveSpeaker = this.speakerStats.mostPopular;

		Database.addGlobalStats(o);

		this.reset();
	}

	reset()
	{
		this.messageCount = 0;
		this.wordStats.reset();
		this.speakerStats.reset();
		this.chatSpeed.reset();	
	}
}

module.exports = s;