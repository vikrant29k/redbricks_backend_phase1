const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brokerSchema = new Schema({
    brokerType: {
        type: String,
        required: true
    },
    brokerCategory: {
        type: String,
        required: true
    },
    SPOCName: {
        type: String,
        required: true
    },
    SPOCNumber: {
        type: String,
    },
    SPOCEmail: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Broker = mongoose.model('Broker', brokerSchema);

module.exports = Broker;