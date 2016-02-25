'use strict';

let DatabaseUser = require('./database_user.js');

/* This class define a generic way of defining controllers (same as C in MVC).
 * It's useless, yeah, but in case of.
 */
class Controller extends DatabaseUser
{
    constructor()
    {
        super();
    }
}

module.exports = Controller;