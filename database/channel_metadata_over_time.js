'use strict';

let mongoose = require('mongoose');

let ChannelMetadataOverTime = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('ChannelMetadataOverTime', ChannelMetadataOverTime);