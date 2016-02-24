let Database = require('./../../database/database.js');

class Controller
{
    constructor()
    {
        this.database = Database;
    }
}

module.exports = Controller;