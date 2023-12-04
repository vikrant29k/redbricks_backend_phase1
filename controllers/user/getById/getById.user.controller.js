const mongoose = require("mongoose");
const User = require("../../../models/user/user.model");

const getUserById = (req, res, next) => {
  let id = req.params.id;
  try {
    let isValidId = mongoose.isValidObjectId(id);
    if (isValidId === false) {
      let error = new Error('Please Provice a valid Id');
      error.status = 400;
      throw error;
    }
    User.findById(mongoose.Types.ObjectId(id))
      .then((user) => {
        if (!user) {
          let error = new Error("User not found with given Id");
          error.status = 404;
          throw error;
        } else {
          res.status(200).send(user);
        }
      })
      .catch((err) => {
        next(err);
      });
  }
  catch (err) {
    if (!err.status) {
      err.status = 400;
    }
    throw err;
  }
};

module.exports = getUserById;
