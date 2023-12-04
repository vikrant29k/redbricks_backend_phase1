const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const layoutModal = new Schema({
    layoutId:String,
    selectedNoOfSeats:{
        type: Number,
        default: 0
    },

    lockedSeats:{
        type: Number,
    },
   
    availableNoOfWorkstation: {
        type: Number,
        default: 0
    },
    totalNoOfWorkstation: {
        type: Number,
        required: true
    },
    totalProposals:{
        type: Number,
        default:0
    },
    proposals:{
        type:Array
    },
    workStation:{
        type:Array
    }
    
});

const LayoutData = mongoose.model('LayoutData',layoutModal);

module.exports = LayoutData;