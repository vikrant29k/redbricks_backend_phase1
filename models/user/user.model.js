const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    deviceId:{
      type:String
    },
    // desktopId: {
    //   type: String,
    // },
    // mobileId: {
    //   type: String,
    // },
    userActive: {
      type: Boolean,
      default: false,
    },
    activeDevice: {
      type: String,
      default: "None",
    },
    salesHead: String,
    proposals: [
      {
        type: String,
        ref: 'Proposal'
      }
    ]
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userModel);

module.exports = User;
