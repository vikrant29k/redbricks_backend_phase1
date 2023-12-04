const Proposal = require('../../../models/proposal/proposal.model');
const mongoose = require('mongoose');

const averageProposalPerMonth = async (req, res, next) => {
    try {
        const brokerId = req.params.Id;
        const targetMonth = req.body.targetMonth;
        const targetYear = req.body.targetYear;
        if (!targetMonth || !targetYear) {
            let err = new Error("Enter month and year")
            return next(err)
        }
        // const daysInMonth=(month, year)=> {
        //     return new Date(year, month, 0).getDate();
        //   }
        Proposal.find({ brokerCategory: mongoose.Types.ObjectId(brokerId), createdAt: { $gte: new Date(targetYear, targetMonth - 1, 1), $lt: new Date(targetYear, targetMonth, 1) } }).then((proposals) => {
            // console.log(proposals.length)
            // let days = daysInMonth(targetMonth,targetYear)
            // console.log("days ==>", days)
            // let averageProposalInMonth = proposals.length/days
            // res.send({averageProposalInMonth: averageProposalInMonth})
            res.status(200).send({ totalProposalsCount: proposals.length })
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
    } catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        next(err);
    }
};

module.exports = averageProposalPerMonth;
