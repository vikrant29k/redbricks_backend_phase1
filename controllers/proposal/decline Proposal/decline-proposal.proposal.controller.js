const Proposal = require("../../../models/proposal/proposal.model");
const LogController = require('../../../models/proposal-log/proposal-log.model');
const { Message } = require("twilio/lib/twiml/MessagingResponse");
const declineProposal = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let currentUser = req.user;
        let data = req.body;
    //    console.log(Id)
    //    console.log(data)
       if (!Id) throw new Error('Id not Provided').status = 400;
       if (currentUser.role === 'sales head') {
           Proposal.findById(Id).then((proposal) => {
               Proposal.updateOne({ _id: proposal._id }, { $set: {declineNote: data.note,status: 'Completed and Declined', lockedProposal:false, escalateForCloser:false } }).then((updateResult) => {
               LogController.findOneAndUpdate({proposalId: proposal._id}, {$set:{'logMessage':`Completed and Declined(Note-[${data.note}])`}}).then(result=>{
                //    console.log(result)
               }).catch((err) => {

                   console.error('Error while updating Log data:', err);
                 });

                   if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                        res.status(200).send({Message:"Declined Successfully"})
                      
                   }
                   else throw new Error('Something went wrong').status = 400;
               }).catch((err) => {
                   if (!err.message) err.message = 'Something went wrong';
                   if (!err.status) err.status = 400;
                   return next(err);
               })
           }).catch((err) => {
               if (!err.message) err.message = 'Something went wrong';
               if (!err.status) err.status = 400;
               return next(err);
           })
       }
       else throw new Error('Unauthorized user').status = 401;
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = declineProposal;