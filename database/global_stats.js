'use strict';

let mongoose = require('mongoose');

let GlobalStats = new mongoose.Schema(
{
	from: Date,
	to: Date,
	numberOfMessages: Number,
	numberOfMessagesPerMinutes: Number,
	mostCommonWord: String,
	mostActiveSpeaker: String,
});

module.exports = mongoose.model('GlobalStats', GlobalStats);