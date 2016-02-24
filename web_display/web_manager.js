'use strict';

const http = require('http');

let Database = require('./../database/database.js');
let express = require('express');
let io = require('socket.io');

let Controller = require('./web_controller.js');

class WebManager extends Controller
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
		
		this.ExpressApp.get('/', this.controller.index);
		this.ExpressApp.get('/browse/games', this.controller['browse_games']);
		this.ExpressApp.get('/browse/top', this.controller['browse_top']);
		this.ExpressApp.get('/game/:gameName', this.controller['game_sheet']);
		this.ExpressApp.get('/:channelName', this.controller['channel_sheet']);
		
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

function webManager(statsManager)
{
	var e = require('express');
	var app = e();
	var server = require('http').Server(app);
	var io = require('socket.io')(server);

	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/templates');
	app.use(e.static(__dirname + '/public'));

	server.listen(8080);

	app.get('/', function(req, res) 
	{
		res.render('index', {});
	});

	app.get('/browse/games', function(req, res)
	{
		res.render('browse_game', { gameList: Database.gameList });
	});

	app.get('/browse/top', function(req, res)
	{
		res.render('browse_top', { channelList: statsManager.topChannels(30) } );
	});

	app.get('/game/:gameName', function(req, res)
	{
		res.render('game', { channelList: statsManager.getChannelsByGame(req.params.gameName) } );
	});

	app.get('/:channelName', function(req, res)
	{
		console.log(req.params);
		res.render('channel', { channelName: req.params.channelName });
	});

	io.on('connection', function(socket)
	{
		socket.on('needDatas', function(data)
		{
			let datas = statsManager.datas;

			socket.emit('datas', datas);
		});

		socket.on('needHomepageDatas', function(data)
		{
			let d = {};
			d.global = statsManager.globalStats;
			d.channels = statsManager.topChannels(10);

			socket.emit('homepageDatas', d);
		});

		socket.on('needChannelDatas', function(channelName)
		{
			let stats = statsManager.getChannelDatas(channelName);
			
			socket.emit('datas', stats);
		});

		socket.on('needMessage', function(data)
		{
			socket.emit('message', statsManager.lastMessage);
		});

		socket.on('addChannel', function(channel)
		{
			statsManager.addChannel(channel);
		});

		/* object = { fromDate, toDate, channelName } */
		socket.on('retrieveChannelStatsInInterval', function(object)
		{
			Database.retrieveChannelStatsInInterval(object.fromDate, object.toDate, object.channelName, function(err, res)
			{
				if(err) throw err;

				if(res && res[0]) res = res[0];
				else res = {};

				res.fromDate = object.fromDate;
				res.toDate = object.toDate;
				socket.emit('channelStatsInInterval', res);
			});
		});


		/* object = { fromDate, toDate, step, channelName } */
		socket.on('retrieveChannelStatsInMultipleInterval', function(object)
		{
			let dates = [];

			let fromDate = new Date(object.fromDate);
			let toDate = new Date(object.toDate);
			let time = toDate.getTime() - fromDate.getTime();
			let stepTime = time / object.step;

			for(let i = 0; i <= object.step - 1; ++i)
			{
				let o = {};
				o.from = new Date(fromDate.getTime() + stepTime * i);
				o.to = new Date(fromDate.getTime() + stepTime * (i + 1));
				dates.push(o);
			}

			let i = 0;
			
			let result = [];
	
			let channelsStatsInMultipleIntervalCallback = function(err, res)
			{
					if(err) throw err;

					if(res && res[0]) res = res[0];
					else res = {};

					res.fromDate = dates[i].from;
					res.toDate = dates[i].to;

					result.push(res);

					if(i !== object.step - 1)
					{
						++i;
						Database.retrieveChannelStatsInInterval(dates[i].from, dates[i].to, object.channelName, channelsStatsInMultipleIntervalCallback);
						return;
					}

					socket.emit('channelStatsInMultipleInterval', result);
					console.log(result);
			}

			Database.retrieveChannelStatsInInterval(dates[0].from, dates[0].to, object.channelName, channelsStatsInMultipleIntervalCallback);
		});

		socket.on('retrieveGlobalStatsInInterval', function(object)
		{
			Database.retrieveGlobalStatsInInterval(object.fromDate, object.toDate, function(err, res)
			{
				res = res[0];
				res.fromDate = object.fromDate;
				res.toDate = object.toDate;
				socket.emit('globalStatsInInterval', res);
			});
		});
	});
}

module.exports = webManager;
