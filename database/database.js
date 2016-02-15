'use strict';

let mongoose = require('mongoose');

let GlobalStatsOverTime = require('./global_stats_over_time.js');
let GlobalStats = require('./global_stats.js');
let ChannelStatsOverTime = require('./channel_stats_over_time.js');
let ChannelStats = require('./channel_stats.js');

let d = class Database
{
	static connect()
	{
		mongoose.connect('mongodb://localhost/twitch');
		Database.firstTimeRun();
	}

	static retrieveGlobalStat(callback)
	{
		GlobalStats.findOne({}, callback); // callback(err, doc)
	}

	static retrieveChannelStat(name, callback)
	{
		if(callback)
		{
			ChannelStats.findOne({name: name}, callback); // callback(err, doc)
			return;
		}

		if(name)
		{
			ChannelStats.find({}, name); //name(err, docs)
			return;
		}
	}

	static addGlobalStats(datas)
	{
		let stat = new GlobalStatsOverTime();
		stat.from = datas.from;
		stat.to = datas.to;
		stat.numberOfMessages = datas.numberOfMessages;
		stat.messagesPerMinute = datas.messagesPerMinute;
		stat.mostCommonWord = datas.mostCommonWord;
		stat.mostActiveSpeaker = datas.mostActiveSpeaker;

		stat.save(function(err)
		{
			if(err)
				console.log(err);

			console.log('Saved!');
		});

		GlobalStats.findOne({}, function(err, doc)
		{
			let f = datas.from / 1000;
			let t = datas.to / 1000;

			doc.numberOfMessages += datas.numberOfMessages;
			doc.messagesPerMinute = Math.round(((doc.messagesPerMinute * doc.totalTime + (datas.messagesPerMinute * (t - f))) / (doc.totalTime + (t - f))));
			doc.totalTime = doc.totalTime + (t - f);
			doc.save(function(err){ if(err) throw err; console.log('Global saved!');});
		});
	}

	static addChannelStats(datas)
	{
		let stat = new ChannelStatsOverTime;
		stat.from = datas.from;
		stat.to = datas.to;
		stat.channelName = datas.channelName;
		stat.numberOfMessages = datas.numberOfMessages;
		stat.messagesPerMinute = datas.messagesPerMinute;
		stat.mostCommonWord = datas.mostCommonWord;
		stat.mostActiveSpeaker = datas.mostActiveSpeaker;

		stat.save(function(err)
		{
			if(err)
				return console.log(err);

				console.log('Saved!');
		});

		ChannelStats.findOne({name: datas.channelName}, function(err, doc)
		{
			if(err)
				throw err;

			if(!doc)
			{
				doc = new ChannelStats();
				doc.name = datas.channelName;
			}

			let f = datas.from / 1000;
			let t = datas.to / 1000;

			doc.numberOfMessages += datas.numberOfMessages;
			doc.messagesPerMinute = Math.round(((doc.messagesPerMinute * doc.totalTime + (datas.messagesPerMinute * (t - f))) / (doc.totalTime + (t - f))));
			doc.totalTime = doc.totalTime + (t - f);
			doc.save(function(err){ if(err) throw err; console.log('Saved2!');});
		});
	}

	static firstTimeRun()
	{
		GlobalStats.count({}, function(err, count)
		{
			if(err)
			{
				console.log(err);
				return;
			}

			if(count === 0)
			{
				console.log('First run. Populating database...');
				let globalStat = new GlobalStats();
				globalStat.save(function(err){ if(err) throw err; console.log('Database populated!'); });
			}
		});
	}
}

module.exports = d;