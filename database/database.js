'use strict';

let mongoose = require('mongoose');

let GlobalStats = require('./global_stats.js');
let ChannelStats = require('./channel_stats.js');

let d = class Database
{
	static connect()
	{
		mongoose.connect('mongodb://localhost/twitch');
	}

	static addGlobalStats(datas)
	{
		let stat = new GlobalStats();
		stat.from = datas.from;
		stat.to = datas.to;
		stat.numberOfMessages = datas.numberOfMessages;
		stat.numberOfMessagesPerMinutes = datas.numberOfMessagesPerMinutes;
		stat.mostCommonWord = datas.mostCommonWord;
		stat.mostActiveSpeaker = datas.mostActiveSpeaker;

		stat.save(function(err)
		{
			if(err)
				console.log(err);

			console.log('Saved!');
		});
	}

	static addChannelStats(datas)
	{
		let stat = new ChannelStats;
		stat.from = datas.from;
		stat.to = datas.to;
		stat.channelName = datas.channelName;
		stat.numberOfMessages = datas.numberOfMessages;
		stat.numberOfMessagesPerMinutes = datas.numberOfMessagesPerMinutes;
		stat.mostCommonWord = datas.mostCommonWord;
		stat.mostActiveSpeaker = datas.mostActiveSpeaker;

		stat.save(function(err)
		{
			if(err)
				return console.log(err);

				console.log('Saved!');
		});
	}
}

module.exports = d;