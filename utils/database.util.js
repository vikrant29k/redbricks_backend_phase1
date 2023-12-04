const mongoose = require('mongoose');

const databaseConnection = () => {
    return mongoose.connect('mongodb://localhost:27017/Redbricks2');
    // console.log(process.env.MONGODB_URI);
    // console.log('All Process Environment variable::',process.env);
    // return mongoose.connect(process.env.MONGODB_URI);
}

module.exports = databaseConnection;