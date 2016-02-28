'use strict';

let irc = require("tmi.js");
const EventEmitter = require('events');

/* This component is here to manage every IRC connection to TMI Twitch.
 * We will have several connections to it to be able to manage every channels.
 * Connections is dynamic. Once a connection is full of channel, it create
 * another connection.
 * The maximum number of channels per connection is approximately 45.
 * There is two kind of IRC servers : the regular server, for regular channels.
 * And, the event server who host channels for big events channels.
 *
 * Events: - 'newConnection' emitted when new client get connected. First
 *          argument: the irc object from tmi.js.
 */

class IRCManager extends EventEmitter
{
    constructor(config)
    {
        super();
        
        this.options = config;
        
        // Regular channels
        this.options.main =
        {
            options:
			{
				debug: config['debug-mode'],
			},
			connection:
			{
				cluster: "main",
				reconnect: true,
			},
			identity:
			{
				username: config.twitch['username'],
				password: config.twitch['oauth-password'],
			},
        };
        
        this.options.event =
        {
            options:
			{
				debug: config['debug-mode'],
			},
			connection:
			{
				cluster: "event",
				reconnect: true,
			},
			identity:
			{
				username: config.twitch['username'],
				password: config.twitch['oauth-password'],
			},
        };
        
        this.clients = {};
        this.clients.main = [];
        this.clients.event = [];
        
        this.waitingChannels = [];
    }
    
    addChannel(channel)
    {
        let self = this;
        
        let channelType = '';
        
		if(this.options['stats-engine']['event-channels'].indexOf(channel) !== -1)
			channelType = 'event';
		else channelType = 'main';
		
		let clientsArray = channelType === 'main' ? this.clients.main : this.clients.event;
		
		let lastIndex = clientsArray.length - 1;
		
		if(clientsArray[lastIndex] && clientsArray[clientsArray.length - 1].count < 11 && clientsArray[clientsArray.length - 1].ready)
		{
			clientsArray[clientsArray.length - 1].client.join(channel);
			clientsArray[clientsArray.length - 1].count += 1;
		}
		else if(clientsArray[lastIndex] && !clientsArray[clientsArray.length - 1].ready)
		{
			this.waitingChannels.push(channel);
		}
		else
		{
			clientsArray.push( { count: 0, ready: false, client: new irc.client(channelType === 'main' ? this.options.main : this.options.event) } );
		
		    lastIndex = clientsArray.length - 1;
			
			clientsArray[lastIndex].client.connect().then(function(data)
			{
			    self.emit('newClient', clientsArray[lastIndex].client);
			    
				clientsArray[lastIndex].client.join(channel);
				clientsArray[lastIndex].count += 1;
				clientsArray[lastIndex].ready = true;
				
				let x = self.waitingChannels;
				self.waitingChannels = [];

				while(x.length > 0)
				{
					self.addChannel(x.pop());
				}
			});
		}
    }
};

module.exports = IRCManager;