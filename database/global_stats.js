'use strict';

let mongoose = require('mongoose');

let GlobalStats = new mongoose.Schema(
{
	from: {type: Date, default: Date.now()},
	totalTime: {type: Number, default: 0}, // In seconds NOT IN MILLIS (else we will overflow too fast)
	numberOfMessages: {type: Number, default: 0},
	messagesPerMinute: {type: Number, default: 0},
});

module.exports = mongoose.model('GlobalStats', GlobalStats);