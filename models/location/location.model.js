const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationModel = new Schema({
    location: {
        type: String,
        required: true
    },
    layoutId:String,
    center: {
        type: String,
        required: true
    },
    floorAvailable:{
        type:Boolean,
        default:false
    },
    floor:{
        type: String,
    },
    perSeatPrice:{
        type:Number,
    },
    selectedNoOfSeats:{
        type: Number,
        default: 0
    },
    lockedSeats:{
        type: Number,
    },
    systemPrice:{
        type:Number
        // default: 1490
    },
    systemPriceNS:{
        type:Number
        // default: 14900
    },
    availableNoOfWorkstation: {
        type: Number,
        default: 0
    },
    totalNoOfWorkstation: {
        type: Number,
        required: true
    },
    // jsonFile: {
    //     type: String,
    //     required: true
    // },
    layoutImage: {
        type: String,
        required: true
    },
    centerImage:[String],
    // imageLinks: {
    //     type: Array,
    // },
    // videoLinks: {
    //     type: Array
    // },
    rentSheet:{
        type:Array
    },
    rentAndCamTotal:{
        type:Number
    },
    carParkCharge:{
        type: Number
    },
    futureRackRate:{
        type:Number,
        default:0
    },
    currentRackRate:{
        type:Number,
        default:0
    },
    rackRate:{
        type:Number
    },
    rackRateNS:{
        type:Number
    },
    bookingPriceUptilNow:{
        type:Number,
        default:0
    },
    seatPriceAsPerSales:{
        type:Number,
    },
    totalProposals:{
        type: Number,
        default:0
    },
    proposals:{
        type:Array
    },
    // adding cost sheet values
    costOfStandardInteriors:Number,
    amortizedFitOutRentFor3Years:Number,
    total_1:Number,
    adminMarketingAndOverHeads:Number,
    brokerage:Number,
    total_2:Number,
    profitBeforeTax:Number,
    total_3:Number,
    rateOfInventoryOnLeaseArea:Number,
    includeCommonsAmenities:Number,
    on80perDiversityFactor:Number,
    costOfElectricity:Number,
    costOfOps:Number,
    efficiency:Number,
    // rent:{
    //     type: Number
    // },
    // cam:{
    //     type: Number
    // },
    // yearnew:{
    //     type: Number
    // },
    salesHead: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    address: String,
    layoutBorder:{
        type:Array
    }
    // jsonData: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'JsonData'
    //     }
    // ]
},{
    timestamps: true
});

const Location = mongoose.model('Location',locationModel);

module.exports = Location;