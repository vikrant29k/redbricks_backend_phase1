// Package Imports
const express = require('express');
const databaseConnection = require('./utils/database.util');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

if(process.env.NODE_ENV !== 'development'){
    dotenv.config();
}

// Custome Imports
const mainRoute = require('./routes/main.route');
const errorHandler = require('./controllers/Error/error.controller');
const startSheduledTasks = require('./sheduled/main.sheduled');

// Local variable
const app = express();
const port = process.env.PORT || 3000;
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Change '*' to your allowed domain(s)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//   });
// Middlewares
app.use(cors());
// app.use(express.json());
app.use(express.json({limit: '8mb'}));
// app.use(express.urlencoded({limit: '50mb'}));
app.use('/images', express.static(path.join(__dirname, '')));
// static file serving
app.use('/uploads', express.static('uploads'));
app.use('/generated-proposal',express.static(path.join('assets','proposal','generated')))
//if file is not found
app.use('/generated-proposal', (req, res, next) => {
    // This middleware will run when the static file middleware doesn't find a file
    res.status(404).send({Message:'No file found'});
  })
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
        startSheduledTasks();
    })
}).catch((err) => {
    if (err) throw err;
});