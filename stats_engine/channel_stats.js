"use strict";

let WordStats = require('./word_stats.js');
let ChatSpeed = require('./chat_speed.js');

let Database = require('./../database/database.js');
let ChannelStatsDatabase = require('./../database/channel_stats.js');

let c = class ChannelStats
{
	constructor(stream)
	{
		this.name = '#' + stream.channel.name;
		this.stream = stream;
		this.messageCount = 0;
		this.wordStats = new WordStats();
		this.speakerStats = new WordStats;
		this.chatSpeed = new ChatSpeed();

		if(!this.stream.game)
			this.stream.game = 'No game';

		let self = this;

		Database.retrieveChannelStats(this.name, function(err, doc)
		{
			if(doc)
				self.overallStats = doc;

			else
			{
				self.overallStats = new ChannelStatsDatabase();
				self.overallStats.name = self.name;
			}
		});

		Database.saveChannelMetadata(this.stream);
	}

	updateMetaDatas(stream)
	{
		this.stream = stream;
		Database.saveChannelMetadata(this.stream);
	}

	onChat(user, message, self)
	{
		this.messageCount += 1;
		this.wordStats.computeMessage(message);
		this.speakerStats.addWord(user['display-name']);
		this.chatSpeed.addTick();
	}

	get datas()
	{
		const o = {};
		o.now = {};

		o.now.numberOfMessages = this.messageCount;
		o.now.mostPopularWord = this.wordStats.mostPopular;
		o.now.mostActiveSpeaker = this.speakerStats.mostPopular;
		o.now.messagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		o.overall = this.overallStats;

		o.game = this.stream.game;
		o.viewers = this.stream.viewers;
		o.mature = this.stream.channel.mature;
		o.views = this.stream.channel.views;
		o.followers = this.stream.channel.followers;
		o.name = this.name;

		return o;
	}

	flush(interval)
	{
		let o = {};
		o.from = interval.from;
		o.to = interval.to;
		o.channelName = this.name;
		o.numberOfMessages = this.messageCount;
		o.messagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);
		o.mostCommonWord = this.wordStats.mostPopular;
		o.mostActiveSpeaker = this.speakerStats.mostPopular;

		Database.addChannelStats(o);

		let f = o.from / 1000;
		let t = o.to / 1000;
		
		if(this.overallStats)
		{
		this.overallStats.numberOfMessages += o.numberOfMessages;
		this.overallStats.messagesPerMinute = Math.round(((this.overallStats.messagesPerMinute * this.overallStats.totalTime + (o.messagesPerMinute * (t - f))) / (this.overallStats.totalTime + (t - f))));
		this.overallStats.totalTime = this.overallStats.totalTime + (t - f);
		this.overallStats.save(function(err){ if(err) throw err;});
		}
		
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

module.exports = c;
