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
		res.render('index', { title: 'Hey', message: 'Hello there!'});
	});

	io.on('connection', function(socket)
	{
		socket.on('needDatas', function(data)
		{
			let datas = statsManager.datas;

			Database.retrieveGlobalStat(function(err, doc)
			{
				datas.global.overall = doc;

				Database.retrieveChannelStat(function(err, docs)
				{
					datas.channels.overall = {};

					for(let c of docs)
					{
						datas.channels.overall[c.name] = {};
						datas.channels.overall[c.name].numberOfMessages = c.numberOfMessages;
						datas.channels.overall[c.name].numberOfMessagesPerMinute = c.numberOfMessagesPerMinute;
						datas.channels.overall[c.name].totalTime = c.totalTime;
						datas.channels.overall[c.name].from = c.from;
					}

					socket.emit('datas', datas);
				});

			});

		});

		socket.on('needMessage', function(data)
		{
			socket.emit('message', statsManager.lastMessage);
		});

		socket.on('addChannel', function(channel)
		{
			statsManager.addChannel(channel);
		});

		socket.on('needChannelStat', function(name)
		{
			Database.retrieveChannelStat(name, function(err, doc)
			{
				if(err) return;

				socket.emit('channelStat', doc);
			});
		});
	});
}

module.exports = s;
