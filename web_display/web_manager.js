'use strict';

const http = require('http');

let express = require('express');
let io = require('socket.io');

let WebController = require('./web_controller.js');

class WebManager extends WebController
{
	constructor(statsManager, config)
	{
		let ExpressApp = express();
		
		let server = http.Server(ExpressApp);
		
		super(statsManager, config, io(server));
		
		this.ExpressApp = ExpressApp;
		
		let self = this;
	
		this.ExpressApp.set('view engine', 'ejs');
		this.ExpressApp.set('views', __dirname + '/templates');
		this.ExpressApp.use(express.static(__dirname + '/public'));
	
		server.listen(this.config['web-engine']['serve-port']);
		
		this.ExpressApp.get('/', this['index'].bind(this));
		this.ExpressApp.get('/browse/games', this['browse_games'].bind(this));
		this.ExpressApp.get('/browse/top', this['browse_top'].bind(this));
		this.ExpressApp.get('/game/:gameName', this['game_summary'].bind(this));
		this.ExpressApp.get('/:channelName', this['channel_summary'].bind(this));
		
		this.socket.on('connection', function(socket)
		{
			socket.on('needDatas', self['io_need_datas'].bind(self));
			socket.on('needHomepageDatas', self['io_need_homepage_datas'].bind(self));
			socket.on('needChannelDatas', self['io_need_channel_datas'].bind(self));
			socket.on('needMessage', self['io_need_message'].bind(self));
			socket.on('addChannel', self['io_add_channel'].bind(self));
			socket.on('retrieveChannelStatsInInterval', self['io_retrieve_channel_stats_in_interval'].bind(self));
			socket.on('retrieveChannelStatsInMultipleInterval', self['io_retrieve_channel_stats_in_multiple_interval'].bind(self));
			socket.on('retrieveGlobalStatsInInterval', self['io_retrieve_global_stats_in_interval'].bind(self));
		});
	}
}

module.exports = WebManager;
