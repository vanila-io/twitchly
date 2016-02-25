'use strict';

let Database = require('./../../database/database.js');

/* This class define a generic way to access Database.
 * Use this.database (in class member scope) to access it.
 */
class DatabaseUser
{
    constructor()
    {
        this.database = Database;
    }
}

module.exports = DatabaseUser;