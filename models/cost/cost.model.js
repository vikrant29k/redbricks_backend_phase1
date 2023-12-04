const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costModel = new Schema({
    servicedOrNonService: {
        type: String,
        required: true
    },
    costStandardInteriors: {
        type: Number,
        required: true
    },
    // amortizedFitOutRent3Years: {
    //     type: Number,
    //     required: true
    // },
    costOfElectricity:{
        type: Number,
        required: true
    },
    costOfOPS: {
        type: Number,
        required: true
    },
    realEstateRent: {
        type: Number,
        required: true
    },
    CAM: {
        type: Number,
        required: true
    },
    // total_1: {
    //     type: Number,
    //     required: true
    // },
    // adminMarketing: {
    //     type: Number,
    //     required: true
    // },
    // brokerage: {
    //     type: Number,
    //     required: true
    // },
    // total_2:{
    //     type: Number,
    //     required: true
    // },
    // profitBeforeTax:{
    //     type: Number,
    //     required: true
    // },
    // total_3:{
    //     type: Number,
    //     required: true
    // },
    // rateOfInventoryOnLeaseArea: {
    //     type: Number,
    //     required: true
    // },
    // includeCommonsAmenities:{
    //     type: Number,
    //     required: true
    // },
    // on80perDiversityFactor:{
    //     type: Number,
    //     required: true
    // }
},{
    timestamps: true
});

const Cost = mongoose.model('Cost',costModel);

module.exports = Cost;