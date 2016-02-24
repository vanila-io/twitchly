'use strict';

let mongoose = require('mongoose');

let GlobalStatsOverTime = require('./global_stats_over_time.js');
let GlobalStats = require('./global_stats.js');
let ChannelStatsOverTime = require('./channel_stats_over_time.js');
let ChannelMetadataOverTime = require('./channel_metadata_over_time.js');
let ChannelStats = require('./channel_stats.js');
let GameList = require('./game_list.js');

let d = class Database
{
	static connect()
	{
		mongoose.connect('mongodb://localhost/twitch');
		Database.firstTimeRun();
		
		GameList.find({}, function(err, docs)
		{
			if(err) throw err;
			Database.gameList = docs;
		});
	}
	
	static insertNewGame(gameName)
	{
		for(let game of Database.gameList)
		{
			if(game.name === gameName)
				return;
		}

		let newGame = new GameList;
		newGame.name = gameName;
		newGame.nameId = gameName ? gameName.toLowerCase().replace(/\s+/g, '').replace('&', '').replace("'", '').replace(':', '') : 'No Game'; //lower case & no spaces & no special char
		newGame.save(function(){});
		Database.gameList.push(newGame);
	}

	static retrieveGlobalStatsInInterval(fromDate, toDate, callback)
	{
		fromDate = new Date(fromDate);
		toDate = new Date(toDate);

		GlobalStatsOverTime.aggregate(
		[
			{
				$match:
				{
					"from": { "$gte": new Date(fromDate.toISOString()) },
					"to": { "$lte": new Date(toDate.toISOString()) },
				}
			},
			{
				
				$group:
				{
					_id: 0,
					numberOfMessages: { $sum: "$numberOfMessages" },
					messagesPerMinute: { $avg: "$messagesPerMinute" },
				}
			}
		], callback);
	}

	static retrieveChannelStatsInInterval(fromDate, toDate, channelName, callback)
	{
		fromDate = new Date(fromDate);
		toDate = new Date(toDate);

		ChannelStatsOverTime.aggregate(
		[
			{
				$match:
				{
					"from": { "$gte": new Date(fromDate.toISOString()) },
					"to": { "$lte": new Date(toDate.toISOString()) },
                    "channelName": channelName
				}
			},
			{
				
				$group:
				{
					_id: 0,
					numberOfMessages: { $sum: "$numberOfMessages" },
					messagesPerMinute: { $avg: "$messagesPerMinute" },
				}
			}
		], callback);
	}

	static retrieveGlobalStats(callback)
	{
		GlobalStats.findOne({}, callback); // callback(err, doc)
	}

	static retrieveChannelStats(name, callback)
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
		});
	}

	static saveChannelMetadata(data)
	{
		delete data['_id'];
		data.date = new Date();

		ChannelMetadataOverTime.collection.insert(data, function(err){if(err) throw err;});

		Database.insertNewGame(data.game);
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