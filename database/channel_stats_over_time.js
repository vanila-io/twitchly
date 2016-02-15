'use strict';

let mongoose = require('mongoose');

let ChannelStatsOverTime = new mongoose.Schema(
{
	from: Date,
	to: {type: Date, default: Date.now()},
	channelName: String,
	numberOfMessages: {type: Number, default: 0},
	numberOfMessagesPerMinute: {type: Number, default: 0},
	mostCommonWord: {type: String, default: ''},
	mostActiveSpeaker: {type: String, default: ''},
});

module.exports = mongoose.model('ChannelStatsOverTime', ChannelStatsOverTime);