
// const errorHandler = (error, req, res, next) => {
//     let status = error.status || 500;
//     let message = error.message;
//     res.status(status).json({ "Message": message });
//     // console.log(error)
// }

// module.exports = errorHandler;
const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error); // Pass the error to the next middleware
    }
    let status = error.status || 500;
    let message = error.message;
    res.status(status).json({ "Message": message });
    // console.log(error)
}

module.exports = errorHandler;
