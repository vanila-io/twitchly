'use strict';

let mongoose = require('mongoose');

let GlobalStatsOverTime = new mongoose.Schema(
{
	from: Date,
	to: {type: Date, default: Date.now()},
	numberOfMessages: {type: Number, default: 0},
	messagesPerMinute: {type: Number, default: 0},
	mostCommonWord: {type: String, default: ''},
	mostActiveSpeaker: {type: String, default: ''},
});

module.exports = mongoose.model('GlobalStatsOverTime', GlobalStatsOverTime);