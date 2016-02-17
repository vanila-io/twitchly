"use strict";

const config = require('./config.json');
const https = require('https');

let StatsManager = require('./stats_engine/stats_manager.js');

let Database = require('./database/database.js');
Database.connect();

let s = new StatsManager("imote", "oauth:c5fktgkvn5nmhoos6115fbnmid3nqk", false, config);
let WebServer = require('./web_display/web_manager.js')(s);

s.on('connected', function()
{
	let response = '';
	let n = 0;
	
	https.get('https://api.twitch.tv/kraken/streams?limit=100', (res) =>
	{
		res.on('data', (d) => response += d);
		res.on('end', () => 
		{
			response = JSON.parse(response);
			
			for (let stream of response.streams)
			{
				let channelName = '#';
				channelName += stream.channel.name;
				s.addChannel(channelName);
				n += 1;
			}
			
			console.log(n + ' channel added');
		});
	});
});

s.connect();