'use strict';

const https = require('https');
const requests = require('request');

class TwitchAPI
{
    static getStreamList(limit, callback)
    {
        // went from https get call to using request as to add a clientID per new policy of the API
		var options = {
		url: 'https://api.twitch.tv/kraken/streams?limit=' + limit ,
		headers: {'Client-ID': '2bfy7nap1hrgsdy9rnuv2rwf28kliy7'}
		};
		
		function callB(error, response, body){
			if(error )
			{
				console.log(error);
				
			}
			else
			{
				var info = JSON.parse(body);
				callback(null, info);
				
			}
		}

		requests(options, callB);
       
    }

    
    static getTopGames(limit, callback)
    {

        // went from https get call to using request as to add a clientID per new policy of the API
		var options = {
		url: 'https://api.twitch.tv/kraken/games/top?limit=' + limit ,
		headers: {'Client-ID': '2bfy7nap1hrgsdy9rnuv2rwf28kliy7'}
		};
		

		function callB(error, response, body){
			if(error )
			{
				console.log(error);
				
			}
			else
			{
				var info = JSON.parse(body);
				callback(null, info);
				
			}
		}

		requests(options, callB);
            
    }
    
    static getTopStreamsByGame(game, limit, callback)
    {
        // went from https get call to using request as to add a clientID per new policy of the API
		var options = {
		url: 'https://api.twitch.tv/kraken/streams?game=' + game  + '&limit=' + limit ,
		headers: {'Client-ID': '2bfy7nap1hrgsdy9rnuv2rwf28kliy7'}
		};

		function callB(error, response, body){
			if(error )
			{
				console.log(error);
				
			}
			else
			{
				var info = JSON.parse(body);
				callback(null, info);
				
			}
		}

		requests(options, callB);
        
       
    }
};

module.exports = TwitchAPI;