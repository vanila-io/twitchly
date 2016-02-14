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
		this.chatSpeed = new ChatSpeed();
	}

	onChat(user, message, self)
	{
		this.messageCount += 1;

		this.wordStats.computeMessage(message);
		this.chatSpeed.addTick();
	}

	get datas()
	{
		const o = {};

		o.numberOfMessages = this.messageCount;
		o.mostPopularKeyword = this.wordStats.mostPopular;
		o.numberOfMessagesPerMinute = Math.round(this.chatSpeed.messagesByMinutes);

		return o;
	}
}

module.exports = c;