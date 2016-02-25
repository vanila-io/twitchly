'use strict';

const http = require('http');

let express = require('express');
let io = require('socket.io');

let WebController = require('./web_controller.js');

class WebManager extends WebController
{
	constructor()
	{
		let self = this;
		
		this.ExpressApp = express();
		
		let server = http.Server(this.ExpressApp);
		this.io = io(server);
	
		this.ExpressApp.set('view engine', 'ejs');
		this.ExpressApp.set('views', __dirname + '/templates');
		this.ExpressApp.use(express.static(__dirname + '/public'));
	
		this.controller = new Controller;
	
		server.listen(8080);
		
		this.ExpressApp.get('/', this.controller['index']);
		this.ExpressApp.get('/browse/games', this.controller['browse_games']);
		this.ExpressApp.get('/browse/top', this.controller['browse_top']);
		this.ExpressApp.get('/game/:gameName', this.controller['game_summary']);
		this.ExpressApp.get('/:channelName', this.controller['channel_summary']);
		
		io.on('connection', function(socket)
		{
			socket.on('needDatas', self.controller['io_need_datas']);
			socket.on('needHomepageDatas', self.controller['io_need_homepage_datas']);
			socket.on('needChannelDatas', self.controller['io_need_channel_datas']);
			socket.on('needMessage', self.controller['io_need_message']);
			socket.on('addChannel', self.controller['io_add_channel']);
			socket.on('retrieveChannelStatsInInterval', self.controller['io_retrieve_channel_stats_in_interval']);
			socket.on('retrieveChannelStatsInMultipleInterval', self.controller['io_retrieve_channel_stats_in_multiple_interval']);
			socket.on('retrieveGlobalStatsInInterval', self.controller['io_retrieve_global_stats_in_interval']);
		});
	}
}

module.exports = webManager;
