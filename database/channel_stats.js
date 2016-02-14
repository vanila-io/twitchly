'use strict';

let mongoose = require('mongoose');

let ChannelStats = new mongoose.Schema(
{
	from: Date,
	to: Date,
	channelName: String,
	numberOfMessages: Number,
	numberOfMessagesPerMinutes: Number,
	mostCommonWord: String,
	mostActiveSpeaker: String,
});

module.exports = mongoose.model('ChannelStats', ChannelStats);