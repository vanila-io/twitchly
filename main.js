"use strict";

const config = require('./config.json');
const https = require('https');

let StatsManager = require('./stats_engine/stats_manager.js');

let Database = require('./database/database.js');
Database.connect();

let s = new StatsManager("imote", "oauth:c5fktgkvn5nmhoos6115fbnmid3nqk", false, config);
let WebServer = require('./web_display/web_manager.js')(s);

function minuteToMillisecond(minute)
{
	return minute * 60 * 1000;
}

function start()
{
	setInterval(function()
	{
		let response = '';

		https.get('https://api.twitch.tv/kraken/streams?limit=100', (res) =>
		{
			res.on('data', (d) => response += d);
			res.on('end', () => 
			{
				response = JSON.parse(response);
				
				for (let stream of response.streams)
				{
					s.addChannel(stream);
				}

				console.log('SAAAAAAVED');
			});
		});	

	}, minuteToMillisecond(5));
}

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
			console.log(response.streams.length);
			for (let stream of response.streams)
			{
				s.addChannel(stream);
				n += 1;
			}

			start();
			
			console.log(n + ' channel added');
		});
	});
});

s.connect();