const mongoose = require("mongoose");
// const ObjectId = require('mongoose')
const Proposal = require("../../../models/proposal/proposal.model")
const path = require('path');
const LogController = require("../../log/main.log.controller");
const Location = require("../../../models/location/location.model");
const User = require("../../../models/user/user.model");
const Broker = require('../../../models/broker/broker.model');
// const JsonData = require("../../../models/jsonData/jsonData.model");

const initProposal = (req, res, next) => {
    try {
        let date = new Date();
        let centerId = req.params.Id;
        if (!centerId) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            if (mongoose.isValidObjectId(centerId)) {
                Location.findById(mongoose.Types.ObjectId(centerId)).then((centerData) => {
                    if (!centerData) {
                        let error = new Error('Error while Initiating proposal');
                        error.status = 503;
                        throw error;
                    }
                    else {
                        let Id = `RBO${String(centerData.location).toUpperCase().slice(0, 2)}${String(centerData.center).toUpperCase().slice(0, 2)}${("0" + date.getDate()).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}`
                        res.status(202).send({
                            "Message": "Proposal Initiated Successfully",
                            "Id": Id
                        })
                    }
                })
            }
            else {
                let error = new Error('Id is Invalid');
                error.status = 400;
                throw error;
            }
        }
        
    }
    catch (err) {
        if (!err.status) err.status = 500;
        if (!err.message) err.message = 'Error while creating proposal Id';
        throw err;
    }
};

const addClientInfoWithGivenData = (Id, data, req, res,next) => {
    let proposal = new Proposal(data);
    proposal.save().then((proposal) => {
        if (!proposal) {
            let error = new Error('Error while adding Client Info');
            error.status = 400;
            throw error;
        }
        else {
            const logData = {
                proposalId: Id,
                clientName: data.clientName,
                clientEmail:data.clientEmail,
                salesPerson: req.user._id,
                location: data.location,
                center: data.center,
                floor:data.floor,
                salesHead: req.user.salesHead
            }
            // console.log("logData",logData);
            LogController.proposal.create(logData);
            User.findById(mongoose.Types.ObjectId(proposal.salesPerson)).then((user) => {
                User.updateOne({ _id: mongoose.Types.ObjectId(user._id) }, { $set: { proposals: [...user.proposals, Id] } }).then()
            });
            // let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}_${proposal.floor}.json`));
            res.status(202).send({
                "Message": "Client Info added Successfully!",
                // "AvailableNoOfSeatsInLayout": layoutData.AvailableNoOfSeats,
                // "TotalNoOfSeatsInLayout": layoutData.TotalNoOfSeats,
            })
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error when adding client Info';
        if (!err.status) err.status = 400;
        next(err);
    })
}

const addClientInfo = (req, res, next) => {
    let Id = req.params.Id;
    let data = req.body;
    let salesPerson = req.user._id;
    data = { ...data, _id: Id, salesPerson : salesPerson, salesHead: req.user.salesHead};
    // console.log('\n\n\n\n\n\n',data);
    try {
        if (!Id) {
            let error = new Error('Id not provided!');
            error.status = 406;
            throw error;
        }
        Proposal.findById(Id).then(async (result) => {
            if (result) {
                let error = new Error('Client Info cannot be added twice');
                error.status = 400;
                throw error;
            }
            else {
                if (['IPC', 'Non-IPC'].includes(data.brokerType)) {
                    if (!data.clientName || data.clientName === "") {
                        if (data.brokerCategory === 'other') data.clientName = data.brokerCategoryOther;
                    };
                    if (data.brokerCategory === 'other') {
                        let newBroker = {
                            brokerType: data.brokerType,
                            brokerCategory: data.brokerCategoryOther,
                            SPOCName: data.spocName,
                            SPOCEmail: data.spocEmail,
                            SPOCNumber: data.spocNumber || ''
                        };
                        const broker = new Broker(newBroker);
                        await broker.save().then((savedBrokerData) => {
                            data.brokerCategory = savedBrokerData._id;
                            addClientInfoWithGivenData(Id, data, req, res, next);
                        }).catch((err) => {
                            return next(err);
                        });
                    }
                    else {
                        await Broker.findOne({ brokerType: data.brokerType, brokerCategory: data.brokerCategory }).then((brokerData) => {
                            data.brokerCategory = brokerData._id;
                            if (!data.clientName || data.clientName === "") data.clientName = brokerData.brokerCategory;
                            addClientInfoWithGivenData(Id,data, req, res, next);
                        }).catch((err) => {
                            return next(err);
                        })
                    }
                }
                else{
                    addClientInfoWithGivenData(Id,data, req, res, next);
                    
                }
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Error when adding client Info';
            if (!err.status) err.status = 400;
            next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Error when adding client Info';
        if (!err.status) err.status = 400;
        next(err);
    }
}

// const addClientInfo = (req, res, next) => {
//     let Id = req.params.Id;
//     let data = req.body;
//     try {
//         if (!Id) {
//             let error = new Error('Id not provided!');
//             error.status = 406;
//             throw error;
//         }
//         Proposal.findById(Id).then((proposal) => {
//             if (!proposal) {
//                 let error = new Error('Proposal not found with given Id');
//                 error.status = 404;
//                 throw error;
//             }
//             else {
//                 try {
//                     let clientInfoField = ['salesTeam', 'salesHead', 'location', 'center', 'broker', 'spocName', 'clientName'];
//                     clientInfoField.forEach((key) => {
//                         if (typeof (proposal?.[key]) === 'object') {
//                             let subField = Object.keys(proposal?.[key]);
//                             subField.forEach((subKey) => {
//                                 if (proposal?.[key]?.[subKey]) {
//                                     let error = new Error('Client Info cannot be added twice');
//                                     throw error;
//                                 }
//                             })
//                         }
//                         else if (proposal?.[key]) {
//                             let error = new Error('Client Info cannot be added twice');
//                             throw error;
//                         }
//                     })
//                 }
//                 catch (err) {
//                     if (!err.status) err.status = 406;
//                     if (!err.message) err.message = 'Client Info cannot be added twice';
//                     throw err;
//                 }
//                 Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
//                     if (result.acknowledged === true) {
//                         if (result.modifiedCount > 0) {
//                             LogController.proposal.create(Id, data.clientName);                                              // generation proposal Log
//                             res.status(202).send({
//                                 "Message": "Client Info added Successfully!"
//                             });
//                         } else {
//                             let error = new Error('Proposal not found with given Id');
//                             error.status = 404;
//                             throw error;
//                         }
//                     } else {
//                         let error = new Error('Error when adding client Info');
//                         throw error;
//                     }
//                 }).catch((err) => {
// if (!err.message) err.message = 'Error when adding client Info';
// if (!err.status) err.status = 400;
// next(err);
//                 })
//             }
//         }).catch((err) => {
// if (!err.message) err.message = 'Error when adding client Info';
// if (!err.status) err.status = 400;
// next(err);
//         })
//     }
//     catch (err) {
//         if (!err.status) err.status = 400;
//         if (!err.message) err.message = 'Error while adding client Info';
//         throw err;
//     }
// }

const checkRequiredNoOfSeats = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;
    let totalNoOfSeats = data.totalNumberOfSeats;
    // let circulation = totalNoOfSeats*0.1;
    // let netBillableSeat = totalNoOfSeats + circulation;
    // console.log('data => ',data);
    // console.log('totalNoOfSeats => ',totalNoOfSeats);
    Proposal.updateOne({ _id: Id }, { $set: { totalNumberOfSeats: totalNoOfSeats } }).then((result) => {
        if (result.acknowledged === true) {
            if (result.modifiedCount > 0) {
                req.proposal = { totalNoOfSeats }
                next();
            }
            else {
                let error = new Error('Something went wrong while calculating total no of Seats');
                throw error;
            }
        }
        else {
            let error = new Error('Cannot find proposal with given Id');
            throw error;
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while calculating total no of Seats';
        if (!err.status) err.status = 400;
        next(err);
    })
}

const addProposalRequirement = (req, res, next) => {
    // console.log("Requirement-------------",req.body)
    let data = req.body;
    let Id = req.params.Id;
    let consolidatedSeats = false;
    let seatAvailability = true;
    let totalNumberOfSeats = data.totalNumberOfSeats;
    try {
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 406;
            throw error;
        }
        Proposal.findById(Id).then((proposal) => {
            if (!proposal) {
                let error = new Error('Proposal not found with given Id');
                error.status = 404;
                throw error;
            }
            else {
               

                // Deciding in which workstation seats should be selected

             

                Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            const logData = { seatsSelected: req.proposal.totalNoOfSeats, logMessage: 'Added Requirement Info'}
                            LogController.proposal.update(Id, logData);
                            Proposal.find()
                                .where('location').equals(proposal.location).where('center').equals(proposal.center)
                                .where('clientName').equals(proposal.clientName)
                                .where('totalNumberOfSeats').gte(proposal.totalNumberOfSeats - ((proposal.totalNumberOfSeats * 5) / 100)).lte(proposal.totalNumberOfSeats + ((proposal.totalNumberOfSeats * 5) / 100))
                                .then((result) => {
                                    let conflict = (result.length > 1) ? true : false;
                                    Proposal.updateOne({ _id: Id }, { $set: { seatAvailability, consolidatedSeats,totalNumberOfSeats, status: conflict ? 'Conflict': 'In-Progress' } }).then((result) => {
                                        res.status(202).send({
                                            "Message": "Requirement added Successfully!",
                                            "conflict": conflict,
                                        });
                                    }).catch((err) => {
                                        if (!err.message) err.message = 'Something went wrong';
                                        if (!err.status) err.status = 500;
                                        return next(err);
                                    })
                                    // if (result.length > 1) {
                                    //     res.status(202).send({
                                    //         "Message": "Requirement added Successfully!",
                                    //         "conflict": true,
                                    //         "seatsAvailability": seatAvailability,
                                    //         "consolidatedSeats": consolidatedSeats
                                    //     })
                                    // }
                                    // else {
                                    //     res.status(202).send({
                                    //         "Message": "Requirement added Successfully!",
                                    //         "conflict": false,
                                    //         "seatsAvailability": seatAvailability,
                                    //         "consolidatedSeats": consolidatedSeats
                                    //     })
                                    // }
                                })
                            // Proposal.find()
                            //     .where('workStation.workStationNumber').gte(data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100)).lte(data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100))
                            //     .where('workStation.storageRoomNumber').gte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100)).lte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100))
                            //     .where('workStation.cafeteriaNumber').gte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100)).lte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100))
                            //     .where('cabin.cabinNumber').gte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100)).lte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100))
                            //     .where('cabin.visitorMeetingRoom.visitorMeetingRoomNumber').gte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100)).lte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100))
                            //     .where('meetingRooms.meetingRoomsNumber').gte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100)).lte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100))
                            //     .where('center').equals(data.center)
                            //     .where('location').equals(data.location)
                            //     .then((result) => {
                            //         console.log(result);
                            //     }).catch((err) => {
                            //         console.log(err);
                            //     });
                            // res.status(202).send({
                            //     "Message": "Requirement added Successfully!"
                            // });
                        }
                        else {
                            let error = new Error('Proposal not found with given Id');
                            error.status = 404;
                            throw error;
                        }
                    }
                    else {
                        let error = new Error('Error When adding Requirement to proposal');
                        error.status = 400;
                        throw error;
                    }
                    
                }).catch((err) => {
                    if (!err.message) err.message = 'Error when adding requirement to proposal';
                    if (!err.status) err.status = 400;
                    // console.log(err);

                    next(err);
                })
          
            }
            
        }).catch((err) => {
            if (!err.message) err.message = 'Error when adding requirement to proposal';
            if (!err.status) err.status = 400;
            // console.log(err);

            next(err);
        })
    }
    catch (err) {
        if (!err.status) err.status = 400;
        if (!err.message) err.message = 'Error while adding Requirement To Proposal';
        // console.log(err);

        throw err;
    }
}

const create = {
    init: initProposal,
    addClientInfo: addClientInfo,
    checkRequiredNoOfSeats: checkRequiredNoOfSeats,
    addProposalRequirement: addProposalRequirement
};

module.exports = create;