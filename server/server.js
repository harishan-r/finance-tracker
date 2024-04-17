//server.js 
require('dotenv').config();

const express = require('express') 
const cors = require('cors') 
const fileDropEndPoints = require("./fileDropEndPoints")

var app = express(); 
app.use(cors()); 
app.use(express.json());

fileDropEndPoints(app);

app.listen(3001, () => { 
	console.log('Server running on 3001'); 
}); 
