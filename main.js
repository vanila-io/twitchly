"use strict";

const config = require('./config.json');

let StatsManager = require('./stats_engine/stats_manager.js');

let s = new StatsManager("imote", "oauth:c5fktgkvn5nmhoos6115fbnmid3nqk", false, config['memory-timeout']);
let WebServer = require('./web_display/web_manager.js')(s);

let Database = require('./database/database.js');

Database.connect();

s.on('connected', function()
{
s.addChannel('#summonersinnlive');
});

s.connect();