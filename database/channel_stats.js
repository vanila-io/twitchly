'use strict';

let mongoose = require('mongoose');

let ChannelStats = new mongoose.Schema(
{
	from: {type: Date, default: Date.now()},
	totalTime: {type: Number, default: 0}, // In seconds NOT IN MILLIS (else we will overflow too fast)
	name: String,
	numberOfMessages: {type: Number, default: 0},
	messagesPerMinute: {type: Number, default: 0},
});

module.exports = mongoose.model('ChannelStats', ChannelStats);