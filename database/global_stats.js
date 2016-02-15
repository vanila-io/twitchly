'use strict';

let mongoose = require('mongoose');

let GlobalStats = new mongoose.Schema(
{
	from: Date,
	to: {type: Date, default: Date.now()},
	numberOfMessages: {type: Number, default: 0},
	numberOfMessagesPerMinutes: {type: Number, default: 0},
	mostCommonWord: {type: String, default: 0},
	mostActiveSpeaker: {type: String, default: 0},
});

module.exports = mongoose.model('GlobalStats', GlobalStats);