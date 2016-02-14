"use strict";

let StatsManager = require('./stats_engine/stats_manager.js');

let s = new StatsManager("imote", "oauth:c5fktgkvn5nmhoos6115fbnmid3nqk", true);
let WebServer = require('./web_display/web_manager.js')(s);

s.on('connected', function()
{

});

s.connect();