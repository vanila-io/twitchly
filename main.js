"use strict";

const utilities = require('./utilities.js');

const config = require('./config.json');

const TwitchAPI = require('./twitch/twitch_api.js');
let StatsManager = require('./stats_engine/stats_manager.js');

let Database = require('./database/database.js');
Database.connect();

let s = new StatsManager(config.twitch.username, config.twitch['oauth-password'], false, config);

let WebManager = require('./web_display/web_manager.js');

let web = new WebManager(s, config);



function start()
{
	(function _start()
	{
		TwitchAPI.getStreamList(100, (err, res) =>
		{
			if(err) 
			{
				console.log(err );
				return;
			}
			if(!res.streams) 
			{
				console.log('no streams');
				return;
			}


			for(let stream of res.streams)
				
				s.addChannel(stream);

			console.log('New TOP stream list.');
		});

		TwitchAPI.getTopGames(20, (err, res) =>
		{
			
			if(err) 
			{
				console.log(err);
				return;	
			};

			if(!res.top || res.top.length === 0)
			{
				return;
			} 

			for(let game of res.top)
			{
				TwitchAPI.getTopStreamsByGame(encodeURI(game.game.name), 20, (err, res) =>
				{
					if(err){
						console.log(err);
						return;
					}

					if(!res.streams)
					{
						console.log('no streams in game from games');
					} 

					for(let stream of res.streams)
						s.addChannel(stream);
				});
			}

			console.log('Channels got from Twitch')
		});

		setTimeout(_start, utilities.minuteToMilliseconds(5));
	})();
}

start();
