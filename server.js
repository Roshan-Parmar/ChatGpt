require("dotenv").config();
const connectToDb = require("./db/dbconnection");
const initSocketServer = require("./socket/socket.server");
const app = require("./src/app");
const httpServer = require("http").createServer(app);

connectToDb();
initSocketServer(httpServer);

httpServer.listen(3000,()=>{
console.log("Server Started running on port");
});
