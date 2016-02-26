'use strict';

let Controller = require('./generic/controller.js');


/* The class WebController hold every controllers to lead with page request
 * and socket.io events. Same as the C in MVC. */
class WebController extends Controller
{
    constructor(statsManager, config, socket)
    {
        super();
        this.statsManager = statsManager;
        this.config = config;
        this.socket = socket;
    }

    /* ROUTES */

    /* Index. Route: '/' */
    'index'(req, res)
    {
        let socketIoUrl = this.config['web-engine'].url;
        
        if(this.config['web-engine']['socketio-port'] !== 80)
        {
            socketIoUrl += ':';
            socketIoUrl += this.config['web-engine']['socketio-port'];
        }
        
        // It was needed because some hosters (like C9) don't like url like 'blah.c9.io:80'
        // they prefer 'blah.c9.io'
        
    	res.render('index', { env: { url: socketIoUrl }});
    }

    /* To browse all monitored games. Route: '/browse/games' */
    'browse_games'(req, res)
    {
    	res.render('browse_game', { gameList: this.database.gameList });
    }

    /* To browse top channels. Route: '/browse/top' */
    'browse_top'(req, res)
    {
    	res.render('browse_top', { channelList: this.statsManager.topChannels(30) });
    }

    /* To view a game summary (channel list, etc). Route: '/game/:gameName' */
    'game_summary'(req, res)
    {
    	res.render('game_summary',
    	{ 
    	    channelList: this.statsManager.getChannelsByGame(req.params.gameName)});
    }

    /* To browse a channel summary. Route: '/:channelName' */
    'channel_summary'(req, res)
    {
        let socketIoUrl = this.config['web-engine'].url;
        
        if(this.config['web-engine']['socketio-port'] !== 80)
        {
            socketIoUrl += ':';
            socketIoUrl += this.config['web-engine']['socketio-port'];
        }
        
    	res.render('channel', { channelName: req.params.channelName, env: { url: socketIoUrl }});
    }

    /* SOCKET.IO EVENTS */

    /* Development function, to retrieve easily all raw datas. To delete and replace. */
    'io_need_datas'(message)
    {
    	let datas = this.statsManager.datas;
    	this.socket.emit('datas', datas);
    }

    /* To retrieve all homepage datas at once. */
    'io_need_homepage_datas'(message)
    {
    	let d = {};
    	d.global = this.statsManager.globalStats;
    	d.channels = this.statsManager.topChannels(10);

    	this.socket.emit('homepageDatas', d);
    }

    'io_need_channel_datas'(message)
    {
    	let stats = this.statsManager.getChannelDatas(message);

    	this.socket.emit('datas', stats);
    }

    'io_need_message'(message)
    {
    	this.socket.emit('message', this.statsManager.lastMessage);
    }

    'io_add_channel'(message)
    {
    	this.statsManager.addChannel(message);
    }

    'io_retrieve_channel_stats_in_interval'(message)
    {
    	this.database.retrieveChannelStatsInInterval(message.fromDate, message.toDate, message.channelName, function(err, res)
		{
			if(err) throw err;

			if(res && res[0]) res = res[0];
			else res = {};

			res.fromDate = message.fromDate;
			res.toDate = message.toDate;
			this.socket.emit('channelStatsInInterval', res);
		});
    }

    'io_retrieve_channel_stats_in_multiple_interval'(message)
    {
    	let dates = [];

		let fromDate = new Date(message.fromDate);
		let toDate = new Date(message.toDate);
		let time = toDate.getTime() - fromDate.getTime();
		let stepTime = time / message.step;

		for(let i = 0; i <= message.step - 1; ++i)
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

			if(i !== message.step - 1)
			{
				++i;
				this.database.retrieveChannelStatsInInterval(dates[i].from, dates[i].to, message.channelName, channelsStatsInMultipleIntervalCallback);
				return;
			}

			this.socket.emit('channelStatsInMultipleInterval', result);
			console.log(result);
		};

		this.database.retrieveChannelStatsInInterval(dates[0].from, dates[0].to, message.channelName, channelsStatsInMultipleIntervalCallback);
    }

    'io_retrieve_global_stats_in_interval'(message)
    {
    	this.database.retrieveGlobalStatsInInterval(message.fromDate, message.toDate, function(err, res)
		{
			res = res[0];
			res.fromDate = message.fromDate;
			res.toDate = message.toDate;
			this.socket.emit('globalStatsInInterval', res);
		});
    }
}

module.exports = WebController;