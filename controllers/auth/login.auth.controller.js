const User = require("../../models/user/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// to check user Active status
const checkUserStatus = (req, res, next) => {
    try {
        let data = req.body;
        // console.log("Hello User",data.userName)
        User.findOne({ userName: data.userName })
            .then((user) => {
                if (user) {
                    if (!data.password) {
                        let error = new Error("Password not provided");
                        error.status = 406;
                        throw error;
                    }
                    bcrypt.compare(data.password, user.password, (err, result) => {
                        try {
                            if (err) {
                                err.message = "Error while verifing password";
                                throw err;
                            }
                            if (result === true) {
                                if (data.forceLogin === false) {
                                    if (user.userActive === false) {
                                        next();
                                    } else {
                                        let error = new Error(
                                            "User Have Already Logged In From Another Device!"
                                        );
                                        error.status = 406;
                                        throw error;
                                    }
                                } else if (data.forceLogin === true) {
                                    next();
                                } else if (!data.forceLogin) {
                                    let error = new Error("Type of loging process not provided!");
                                    error.status = 406;
                                    throw error;
                                }
                            } else {
                                let error = new Error("Invalid Password");
                                error.status = 404;
                                throw error;
                            }
                        } catch (err) {
                            if (!err.message)
                                err.message = "Something Went wrong while Verifing password";
                            if (!err.status) err.status = 400;
                            next(err);
                        }
                    });
                } else {
                    let error = new Error("Invalid Username");
                    error.status = 404;
                    throw error;
                }
            })
            .catch((err) => {
                if (!err.message)
                    err.message =
                        "Something went wrong while checking user active status";
                if (!err.status) err.status = 400;
                next(err);
            });
    } catch (err) {
        if (!err.status) err.status = 400;
        if (!err.message) err.message = "Invalid data provided";
        throw err;
    }
};

//to handle force login
const forceLogin = (req, res, next) => {
    try {
        let data = req.body;
        if (data.forceLogin === true) {
            User.updateOne(
                { userName: data.userName },
                { $set: { userActive: false } }
            )
                .then((data) => {
                    if (data.modifiedCount > 0) {
                        next();
                    } else {
                        let error = new Error("Force login could not complete");
                        error.status = 400;
                        throw error;
                    }
                })
                .catch((err) => {
                    if (!err.status) err.status = 400;
                    if (!err.message)
                        err.message = "Something went wrong while force login user";
                    next(err);
                });
        } else {
            next();
        }
    } catch (err) {
        if (!err.status) err.status = 400;
        if (!err.message) err.message = "Please provide valid data";
        throw err;
    }
};

// to complete the login process
const login = (req, res, next) => {
    try {
        let data = req.body;
        // console.log(data,"asdasds")
        // let deviceType = req.headers.devicetype;
        User.findOne({ userName: data.userName })
            .then((user) => {
                if (user) {
                    let tokenPayload = {
                        userName: user.userName,
                        // deviceType: deviceType,
                        _id: user._id,
                        role: user.role
                    };
                    let token = jwt.sign(tokenPayload, process.env.AUTH_TOKEN_SECRET);
                    // let token = jwt.sign(tokenPayload, 'sdfkajsdfwf384*&^*^')


                    if (!data.deviceId) {
                        let error = new Error("Device Id not provided!");
                        error.status = 406;
                        throw error;
                    }

                    // First Login From Desktop;
                    else if (user.deviceId === undefined  )
                        //&& deviceType === "Desktop") 
                    {
                        User.updateOne(
                            { userName: data.userName },
                            {
                                $set: {
                                    deviceId: data.deviceId,
                                    userActive: true,
                                    // activeDevice: "Desktop",
                                },
                            }
                        )
                            .then((data) => {
                                if (data.modifiedCount > 0) {
                                    res.status(202).send({
                                        Message: "User Login Successfull!",
                                        Token: token,
                                    });
                                } else {
                                    let error = new Error(
                                        "Error while adding authorized Desktop"
                                    );
                                    error.status = 500;
                                    throw error;
                                }
                            })
                            .catch((err) => {
                                if (!err.status) err.status = 400;
                                next(err);
                            });
                    }

                    // First Login from Mobile
                    // else if (user.mobileId === undefined)
                    //     //  && deviceType === "Mobile") 
                    //      {
                    //     User.updateOne(
                    //         { userName: data.userName },
                    //         {
                    //             $set: {
                    //                 mobileId: data.deviceId,
                    //                 userActive: true,
                    //                 // activeDevice: "Mobile",
                    //             },
                    //         }
                    //     )
                    //         .then((data) => {
                    //             if (data.modifiedCount > 0) {
                    //                 res.status(202).send({
                    //                     Message: "User Login Successfull!",
                    //                     Token: token,
                    //                 });
                    //             } else {
                    //                 let error = new Error("Error while adding authorized mobile");
                    //                 error.status = 500;
                    //                 throw error;
                    //             }
                    //         })
                    //         .catch((err) => {
                    //             if (!err.status) err.status = 400;
                    //             next(err);
                    //         });
                    // }

                    // Login for Other than first time from any device
                    else if (
                        user.deviceId === data.deviceId 
                        // ||
                        // user.mobileId === data.deviceId
                    ) {
                        User.updateOne(
                            { userName: data.userName },
                            { $set: { userActive: true,}}
                                //  activeDevice: deviceType } }
                        )
                            .then((data) => {
                                if (data.modifiedCount > 0) {
                                    res.status(202).send({
                                        Message: "User Login Successfull!",
                                        Token: token,
                                    });
                                } else {
                                    let error = new Error("Something went wrong");
                                    error.status = 500;
                                    throw error;
                                }
                            })
                            .catch((err) => {
                                if (!err.status) err.status = 400;
                                next(err);
                            });
                    }

                    // Login From UnAuthorized Device;
                    else {
                        let error = new Error("Device Unauthorized");
                        error.status = 401;
                        throw error;
                    }
                }
            })
            .catch((err) => {
                if (!err.status) err.status = 400;
                next(err);
            });
    } catch (err) {
        if (!err.status) err.status = 503;
        if (!err.message)
            err.message = "Something went wrong while completing login";
        throw err;
    }
};

const loginController = {
    checkUserStatus: checkUserStatus,
    forceLogin: forceLogin,
    login: login,
};

module.exports = loginController;
