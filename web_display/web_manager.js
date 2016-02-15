'use strict';

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
			socket.emit('datas', statsManager.datas);
		});

		socket.on('addChannel', function(channel)
		{
			statsManager.addChannel(channel);
		});
	});
}

module.exports = s;
