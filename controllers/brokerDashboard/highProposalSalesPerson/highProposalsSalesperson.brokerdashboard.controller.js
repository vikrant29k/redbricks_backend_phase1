const Proposal = require('../../../models/proposal/proposal.model')
const User = require('../../../models/user/user.model')
const mongoose = require('mongoose')

const highProposalSalesperson = async (req,res,next)=>{
    try{
    const brokerId = req.params.Id
    const pipeline = [
        {
            $match: {
                brokerCategory: mongoose.Types.ObjectId(brokerId)
            }
        },
        {
            $group: {
                _id: '$salesPerson',
                totalProposals: { $sum: 1 },
                // inprogressCount: {
                //     $sum: {
                //         $cond: {
                //             if: { $eq: ['$status', 'In-Progress'] },
                //             then: 1,
                //             else: 0
                //         }
                //     }
                // },
                approveCount: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$status', 'Completed and approved'] },
                            then: 1,
                            else: 0
                        }
                    }
                },
                lockedCount: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$status', 'Completed and Locked'] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $sort: { totalProposals: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                // from: 'users', // Name of the "users" collection

                // localField: '_id', // Field from the "proposals" collection
                // foreignField: '_id', // Field from the "users" collection
                // as: 'salesPersonData' // Alias for the joined data
                from: 'users', // Name of the "users" collection
                    let: { salesPersonId: '$_id' }, // Define a variable to store the salesPerson ID
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$salesPersonId'] } // Match based on the salesPerson ID
                            }
                        },
                        {
                            $project: {
                                _id: 0, // Include the _id field
                                firstName: 1, // Include the username field
                                lastName: 1 // Include the email field
                            }
                        }
                    ],
                    as: 'salesPersonData' // Alias for the joined data
            }
        }
    ]

    const result = await Proposal.aggregate(pipeline)
    
    // const user = await User.findOne({ _id: mongoose.Types.ObjectId(result[0]._id) });
    // console.log(result[0], user)
    res.send(result)
}catch (err) {
    if (!err.message) err.message = 'Something went wrong';
    next(err);
}
}

module.exports = highProposalSalesperson