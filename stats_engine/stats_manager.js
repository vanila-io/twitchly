"use strict";

let IRCManager = require('./../twitch/irc_manager.js');

let ChannelStats = require('./channel_stats.js');
let WordStats = require('./word_stats.js');
let ChatSpeed = require('./chat_speed.js');

let Database = require('./../database/database.js');

let s = class StatsManager
{
	constructor(username, password, debug, config)
	{
		let self = this;
		
		this.clientManager = new IRCManager(config);
		this.clientManager.on('newClient', (client) =>
		{
			client.on('chat', (a, b, c, d) => { self.onChat(a, b, c, d); } );
			client.on('disconnected', function()
			{
				console.log('disconnected');
				client.connect().then(function(){console.log('reconnected')})
			})
		});

		this.channels = {};
		
		this.messageCount = 0;
		this.wordStats = new WordStats;
		this.speakerStats = new WordStats;
		this.chatSpeed = new ChatSpeed;

		this.options = config;
		this.memoryTimeout = config['stats-engine']['memory-timeout'] ? config['stats-engine']['memory-timeout'] : 60000; // 60 seconds, 1 minutes (in millis)

		this.message = {};
		this.message.date = -1;
		
		this.channelNumber = 0;

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
	}
	
	addChannel(channel)
	{
		
		let name = '#' + channel.channel.name;
		
		if(this.channels[name])
			return;
		
		this.clientManager.addChannel(name);
		
		this.channels[name] = new ChannelStats(channel);

		this.channelNumber += 1;
		console.log('We have ' + this.channelNumber + ' channels.');
	}

	get globalStats()
	{
		const o = {};
		o.now = {};

		o.now.numberOfMessages = this.messageCount;
		o.now.mostPopularWord = this.wordStats.mostPopular;
		o.now.mostActiveSpeaker = this.speakerStats.mostPopular;
		o.now.messagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		o.overall = this.overallStats;

		return o;
	}

	topChannels(limit)
	{
		let self = this;

		let o = {};
		let count = 0;

		let channelSorted = Object.keys(this.channels).sort(function(a, b) { return self.channels[b].messageCount - self.channels[a].messageCount });

		for(let channel of channelSorted)
		{
			o[channel] = this.channels[channel].datas;

			count += 1;

			if(count === limit)
				break;
		}

		return o;
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

	getChannelsByGame(gameName)
	{
		let self = this;

		let o = [];

		let channelSorted = Object.keys(this.channels).sort(function(a, b) { return self.channels[b].messageCount - self.channels[a].messageCount });

		for(let channel of channelSorted)
		{
		    let channelGame = '';
		
		    if(this.channels[channel].stream.game)
		        channelGame = this.channels[channel].stream.game.toLowerCase().replace(/\s+/g, '').replace('&', '').replace("'", '').replace(':', '');
		    else
		    	channelGame = 'No Game';
		    	
		    if(channelGame == gameName)
		    	o.push(this.channels[channel].datas);
		}

		return o;
	}

	onChat(channel, user, message, self)
	{

		this.messageCount += 1;

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
