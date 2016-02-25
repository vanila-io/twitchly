'use strict';

let Controller = require('./generic/controller.js');


/* The class WebController hold every controllers to lead with page request
 * and socket.io events. Same as the C in MVC. */
class WebController extends Controller
{
    constructor()
    {
        super();
    }

    /* ROUTES */

    /* Index. Route: '/' */
    'index'(req, res)
    {
    	res.render('index', {});
    }

    /* To browse all monitored games. Route: '/browse/games' */
    'browse_games'(req, res)
    {
    	res.render('browse_game', { gameList: Database.gameList });
    }

    /* To browse top channels. Route: '/browse/top' */
    'browse_top'(req, res)
    {
    	res.render('browse_top', { channelList: statsManager.topChannels(30) });
    }

    /* To view a game summary (channel list, etc). Route: '/game/:gameName' */
    'game_summary'(req, res)
    {
    	res.render('game_summary', { channelList: statsManager.getChannelsByGame(req.params.gameName) });
    }

    /* To browse a channel summary. Route: '/:channelName' */
    'channel_summary'(req, res)
    {
    	res.render('channel', { channelName: req.params.channelName });
    }

    /* SOCKET.IO EVENTS */

    /* Development function, to retrieve easily all raw datas. To delete and replace. */
    'io_need_datas'(message)
    {
    	let datas = statsManager.datas;
    	socket.emit('datas', datas);
    }

    /* To retrieve all homepage datas at once. */
    'io_need_homepage_datas'(message)
    {
    	let d = {};
    	d.global = statsManager.globalStats;
    	d.channels = statsManager.topChannels(10);

    	socket.emit('homepageDatas', d);
    }

    'io_need_channel_datas'(message)
    {
    	let stats = statsManager.getChannelDatas(channelName);

    	socket.emit('homepageDatas', d);
    }

    'io_need_message'(message)
    {
    	socket.emit('message', statsManager.lastMessage);
    }

    'io_add_channel'(message)
    {
    	statsManager.addChannel(message);
    }

    'io_retrieve_channel_stats_in_interval'(message)
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
				Database.retrieveChannelStatsInInterval(dates[i].from, dates[i].to, message.channelName, channelsStatsInMultipleIntervalCallback);
				return;
			}

			socket.emit('channelStatsInMultipleInterval', result);
			console.log(result);
		}

		Database.retrieveChannelStatsInInterval(dates[0].from, dates[0].to, message.channelName, channelsStatsInMultipleIntervalCallback);
    }

    'io_retrieve_global_stats_in_interval'(message)
    {
    	Database.retrieveGlobalStatsInInterval(object.fromDate, object.toDate, function(err, res)
		{
			res = res[0];
			res.fromDate = object.fromDate;
			res.toDate = object.toDate;
			socket.emit('globalStatsInInterval', res);
		});
    }
}

module.exports = WebController;