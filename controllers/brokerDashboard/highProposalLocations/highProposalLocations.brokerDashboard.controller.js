const mongoose = require('mongoose')
const Proposal = require('../../../models/proposal/proposal.model')

const highproposalsLocations = async (req, res, next) => {
    try {
        const brokerId = req.params.Id;
        // const data = req.body;
        const pipeline = [
            {
                $match: {
                    brokerCategory: mongoose.Types.ObjectId(brokerId)
                }
            },
            {
                $group: {
                    _id: '$location',
                    proposalCount: { $sum: 1 }
                }
            },
            {
                $sort: { proposalCount: -1 }
            },
            {
                $limit: 5
            }
        ]

        Proposal.aggregate(pipeline).then((data) => {
            data = data.map((element) => Object.values(element));
            res.status(200).send(data)
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })

    } catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        next(err);
    }
}

module.exports = highproposalsLocations;