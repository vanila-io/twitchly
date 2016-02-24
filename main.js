"use strict";

const utilities = require('./utilities.js');

const config = require('./config.json');

const TwitchAPI = require('./twitch/twitch_api.js');
let StatsManager = require('./stats_engine/stats_manager.js');

let Database = require('./database/database.js');
Database.connect();

let s = new StatsManager(config.twitch.username, config.twitch['oauth-password'], false, config);
let WebServer = require('./web_display/web_manager.js')(s);

function start()
{
	(function _start()
	{
		TwitchAPI.getStreamList(100, (err, res) =>
		{
			if(err) return;
			
			if(!res.streams) return;
			
			for(let stream of res.streams)
				s.addChannel(stream);
				
			console.log('New stream list.');
		});
		
		setTimeout(_start, utilities.minuteToMilliseconds(5));
	})();
}

start();