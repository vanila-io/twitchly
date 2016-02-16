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

	server.listen(8080);

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
			
			socket.emit('datas', stats);/*
			
			Database.retrieveChannelStats(channelName, function(err, doc)
			{
				if(err)
					throw error;

				if(!doc)
					return;

				let realtimeStat = statsManager.getChannelDatas(channelName);

				let o = {};
				o.numberOfMessages = doc.numberOfMessages + realtimeStat.numberOfMessages;
				o.messagesPerMinute = realtimeStat.messagesPerMinute;
				o.averageMessagePerMinute = doc.messagesPerMinute;
				o.mostActiveSpeaker = realtimeStat.mostActiveSpeaker;
				o.mostPopularWord = realtimeStat.mostPopularWord;

				socket.emit('datas', o);
			});*/
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
			Database.retrieveChannelStats(name, function(err, doc)
			{
				if(err) return;

				socket.emit('channelStat', doc);
			});
		});
	});
}

module.exports = s;
