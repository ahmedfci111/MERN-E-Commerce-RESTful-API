const mongoose = require('mongoose');
const dbConnection=()=>{
    mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.name);
  });
}
module.exports =dbConnection;