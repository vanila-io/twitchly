'use strict';

const https = require('https');

let x = class TwitchAPI
{
    static getStreamList(limit, callback)
    {
        let response = '';
        
        https.get('https://api.twitch.tv/kraken/streams?limit=' + limit, (res) =>
    	{
    		res.on('data', (d) => response += d);
    		res.on('end', () => 
    		{
    		    try
    		    {
    			    response = JSON.parse(response);
    		    } catch(e)
    		    {
    		        if(!e) e = true;
    		        callback(e, null);
    		    }
    		    
                callback(null, response);
    		});
        });
    }
};

module.exports = x;