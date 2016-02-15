'use strict';

let mongoose = require('mongoose');

let ChannelStats = new mongoose.Schema(
{
	from: Date,
	to: {type: Date, default: Date.now()},
	channelName: String,
	numberOfMessages: {type: Number, default: 0},
	numberOfMessagesPerMinutes: {type: Number, default: 0},
	mostCommonWord: {type: String, default: 0},
	mostActiveSpeaker: {type: String, default: 0},
});

module.exports = mongoose.model('ChannelStats', ChannelStats);