const noteRoutes = require('./note_routes');
module.exports = function(app,connection){
  noteRoutes(app,connection)
}