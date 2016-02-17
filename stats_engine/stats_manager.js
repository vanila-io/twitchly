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

		let mainOptions = 
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
		
		let eventOptions = 
		{
			options:
			{
				debug: debug,
			},
			connection:
			{
				cluster: "event",
				reconnect: true,
			},
			identity:
			{
				username: username,
				password: password,
			},
		};

		this.mainClient = new irc.client(mainOptions);
		this.eventClient = new irc.client(eventOptions);
		
		let self = this;
		this.mainClient.on("chat", function(a, b, c, d) { self.onChat(a, b, c, d); } );
		this.eventClient.on("chat", function(a, b, c, d) { self.onChat(a, b, c, d); } );


		this.channels = {};
		this.messageCount = 0;

		this.wordStats = new WordStats;
		this.speakerStats = new WordStats;
		this.chatSpeed = new ChatSpeed;

		this.memoryTimeout = memoryTimeout ? memoryTimeout : 60000; // 60 seconds, 1 minutes (in millis)

		this.message = {};
		this.message.date = -1;

		Database.retrieveGlobalStats(function(err, doc)
		{
			if(err)
				throw err;

			self.overallStats = doc;
		});

		setInterval(function()
		{
			self.flush();
		}, this.memoryTimeout);
		
		this.mainClient.on('reconnect', function()
		{
			self.mainClient.on('connected', function()
			{
				self.emit('connected');	
			});
		});
		
		this.eventClient.on('reconnect', function()
		{
			self.eventClient.on('connected', function()
			{
				self.emit('connected');	
			});
		});
	}

	get datas()
	{
		const o = {};
		o.global = {};
		o.global.now = {};

		o.global.now.numberOfMessages = this.messageCount;
		o.global.now.mostPopularWord = this.wordStats.mostPopular;
		o.global.now.mostActiveSpeaker = this.speakerStats.mostPopular;
		o.global.now.messagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		o.global.overall = this.overallStats;

		o.channels = {};

		for (let channel in this.channels)
		{
		    if(!this.channels.hasOwnProperty(channel)) continue;
		    
		    o.channels[channel] = this.channels[channel].datas;
		}

		return o;
	}

	getChannelDatas(channelName)
	{
		return this.channels[channelName] ? this.channels[channelName].datas : null;
	}

	get lastMessage()
	{
		return this.message;
	}

	connect()
	{
		const self = this;

		this.mainClient.connect().then(function(data)
		{
			
			self.eventClient.connect().then(function(data2)
			{
				console.log('Connected.');
				self.emit('connected');
			}).catch(function(err)
			{
				console.log('Can not connect to Twitch IRC. ' + err);
			});
			
		}).catch(function(err)
		{
			console.log('Can not connect to Twitch IRC. ' + err);
		});
	}

	addChannel(name)
	{
		this.mainClient.join(name);
		this.eventClient.join(name);
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
			this.message.date = Date.now();
		}
	}

	/* Save stats and reset realtime stats */
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
		o.messagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);
		o.mostCommonWord = this.wordStats.mostPopular;
		o.mostActiveSpeaker = this.speakerStats.mostPopular;

		Database.addGlobalStats(o);

		let f = o.from / 1000;
		let t = o.to / 1000;

		this.overallStats.numberOfMessages += o.numberOfMessages;
		this.overallStats.messagesPerMinute = Math.round(((this.overallStats.messagesPerMinute * this.overallStats.totalTime + (o.messagesPerMinute * (t - f))) / (this.overallStats.totalTime + (t - f))));
		this.overallStats.totalTime = this.overallStats.totalTime + (t - f);
		this.overallStats.save(function(err){ if(err) throw err; console.log('Global saved!');});

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