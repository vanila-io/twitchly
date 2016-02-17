'use strict';

let Database = require('./../database/database.js');

let s = function(statsManager)
{
	var e = require('express');
	var app = e();
	var server = require('http').Server(app);
	var io = require('socket.io')(server);

	app.set('view engine', 'ejs')
	app.set('views', __dirname + '/templates');

	app.use(e.static(__dirname + '/public'));

	server.listen(3000);

	app.get('/', function(req, res) 
	{
		res.render('index', {});
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

module.exports = s;
