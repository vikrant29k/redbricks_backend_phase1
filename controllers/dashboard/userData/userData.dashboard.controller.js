const User = require("../../../models/user/user.model");

const getUserData = async (req, res, next) => {
    try {
        const currentUser = req.user;
        // console.log(req.params.Page)
        let query;
        if (currentUser.role === 'admin') {
            query = User.aggregate([
                { $match: { role: 'sales' } },
                { $addFields: { proposalCount: { $size: "$proposals" } } },
                { $sort: { proposalCount: -1 } },
                { $skip: (req.params.Page - 1) * 5 },
                { $limit: 5 },
                { $project: { firstName: 1, lastName: 1, proposalCount: 1 } }
            ])
        }
        else if (currentUser.role === 'sales head') {
            query = User.aggregate([
                { $match: { role: 'sales', salesHead: currentUser._id } },
                { $addFields: { proposalCount: { $size: "$proposals" } } },
                { $sort: { proposalCount: -1 } },
                { $skip: (req.params.Page - 1) * 5 },
                { $limit: 5 },
                { $project: { firstName: 1, lastName: 1, proposalCount: 1 } }
            ])
        }
        else {
            let err = new Error("Unauthorized User");
            err.status = 403;
            throw err;
        }
        const users = await query.exec();
        res.status(200).json(users)
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        return next(err);
    }
}

module.exports = getUserData;
// const { default: mongoose } = require("mongoose");
// const Proposal = require("../../../models/proposal/proposal.model");
// const User = require("../../../models/user/user.model");

// const getUserData = (req, res, next) => {
//     try {
//         const currentUser = req.user;
//         if (currentUser.role === 'admin') {
//             User.find().select('firstName lastName proposals').where('role').equals('sales').then(async (user) => {
//                 user = await user.map((element) => {
//                     let temp = JSON.parse(JSON.stringify(element));
//                     temp = { ...temp, totalProposalCount: temp.proposals.length };
//                     delete temp.proposals;
//                     return temp;
//                 });
//                 res.json(user);
//             }).catch((err) => {
//                 if (!err.message) err.message = 'Something went wrong';
//                 return next(err);
//             })
//         }
//         else if (currentUser.role === 'sales head') {
//             User.find().select('firstName lastName proposals').where('role').equals('sales').where('salesHead').equals(currentUser._id).then((user) => {
//                 user = user.map((element) => {
//                     let temp = JSON.parse(JSON.stringify(element));
//                     temp = { ...temp, totalProposalCount: temp.proposals.length };
//                     delete temp.proposals;
//                     return temp;
//                 })
//                 res.json(user);
//             }).catch((err) => {
//                 if (!err.message) err.message = 'Something went wrong';
//                 return next(err);
//             })
//         }
//         else {
//             let error = new Error('Unauthorized Person!');
//             error.status = 401;
//             throw error;
//         }
//     }
//     catch (err) {
//         if (!err.message) err.message = 'Something went wrong';
//         throw err;
//     }
// }

// module.exports = getUserData;