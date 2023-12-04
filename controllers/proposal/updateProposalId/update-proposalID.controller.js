const Proposal = require("../../../models/proposal/proposal.model");



const updateId = (req, res, next) => {
    try {
        let propoaslId = req.params.Id;
      
        // let data = req.body;
        if(!propoaslId) {
        throw new Error('Id not provided');
    }else{
        Proposal.findById(propoaslId).then((proposal) => {
            Proposal.updateOne({_id:proposal._id},{$set:{revised:proposal.revised+1}}).then((updateResult)=>{
                if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                    res.status(202).send({
                        "Message": "Proposal Edited"
                    })
                }
                else throw new Error('Something went wrong');
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong while updating';
                return next(err);
            })
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong while finding id';
        return next(err);
    })
       
    }
       
       
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = updateId;