// Package Imports
const express = require('express');
const databaseConnection = require('./utils/database.util');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

if(process.env.NODE_ENV !== 'development'){
    console.log('PROD');
    dotenv.config();
}
console.log('DEV');

// Custome Imports
const mainRoute = require('./routes/main.route');
const errorHandler = require('./controllers/Error/error.controller');
const startSheduledTasks = require('./sheduled/main.sheduled');

// Local variable
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '')));
// static file serving
app.use('/uploads', express.static('uploads'));
app.use('/generated-proposal',express.static(path.join('assets','proposal','generated')))

// Routes
app.use(mainRoute);
app.use('/',(req, res)=>{
    res.send('Hello');
})
// Error Handler
app.use(errorHandler);

// Connecting Database and starting Server
databaseConnection().then(() => {
    app.listen(port,() => {
        console.log(`Server is Running on port ${port}`);
        // startSheduledTasks();
    })
}).catch((err) => {
    if (err) throw err;
});