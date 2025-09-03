require("dotenv").config();
const connectToDb = require("./db/dbconnection");
const app = require("./src/app");

connectToDb();

app.listen(3000,()=>{
console.log("Server Started running on port");
});