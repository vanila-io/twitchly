"use strict";

let WordStats = require('./word_stats.js');
let ChatSpeed = require('./chat_speed.js');

let c = class ChannelStats
{
	constructor(name)
	{
		this.name = name;
		this.messageCount = 0;
		this.wordStats = new WordStats();
		this.speakerStats = new WordStats;
		this.chatSpeed = new ChatSpeed();
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

		o.numberOfMessages = this.messageCount;
		o.mostPopularKeyword = this.wordStats.mostPopular;
		o.mostActiveSpeaker = this.speakerStats.mostPopular;
		o.numberOfMessagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		return o;
	}
}

module.exports = c;