
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require("../../../models/user/user.model");

const UpdateUserWithGivenData = (data,res, next) => {
    User.updateOne({ _id: mongoose.Types.ObjectId(data._id) }, { $set: data }).then((result) => {
        console.log(result);
        if (result.acknowledged === true) {
            if (result.modifiedCount > 0) {
                res.status(202).send({
                    "Message": "User Updated Successfully!"
                })
            }
            else {
                let error = new Error('Error while updating user');
                error.status = 400;
                throw error;
            }
        }
        else {
            let error = new Error('Something went wrong while updating user');
            error.status = 400;
            throw error;
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong while updating user!';
        if (!err.status) err.status = 400;
        next(err);
    })
}

const updateUserProfile = (req, res, next) => {
    let data = req.body;
    const saveUser = ()=>{
        if (data.password) {
            bcrypt.hash(data.password, 10, async (err, encrypted) => {
                if (err) {
                    err.message = 'Something Went wrong while hashing the password';
                    throw err;
                }
                else {
                    data = { ...data, password: encrypted };
                    UpdateUserWithGivenData(data,res, next);
                }
            })
        }
        else {
            UpdateUserWithGivenData(data,res, next);
        }
    }
    // console.log(data);
    try {
        User.findOne({_id:data._id}).then((user)=>{
            // console.log("user==>", data.userName, "mongo==>",user?.userName)
            if(data.userName===user?.userName){
                // console.log("not Edit")
                saveUser();
            }
            else{
                // console.log("edit")
                User.findOne({userName:data.userName}).then((duplicate)=>{
                    if(duplicate){
                        // console.log(duplicate)
                        let err = new Error("UserName Already In Use")
                        err.status = 409
                        next(err)
                    } 
                    else{
                        saveUser()
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong while updating Profile!';
                    if (!err.status) err.status = 400;
                    next(err);
                })
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong while updating Profile!';
            if (!err.status) err.status = 400;
            next(err);
        })
        
    }
    catch (err) {
        if (!err.message) err.message = 'Error while updating User';
        if (!err.status) err.status = 400;
        throw err;
    }
}




module.exports = updateUserProfile;