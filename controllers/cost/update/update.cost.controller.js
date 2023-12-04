const Cost = require("../../../models/cost/cost.model");
// const { default: mongoose } = require("mongoose");
// const fs = require('fs');
// const path = require('path');

const updateCostSheet = (req, res, next) => {
   let data = req.body;
//    console.log(data);
   Cost.updateOne({servicedOrNonService:'yes'},{$set:data}).then(updateResult=>{
    if(updateResult.acknowledged && (updateResult.modifiedCount > 0)){
        res.send({
            message:'Update Successfully'
        })
    } else throw new Error('Something went wrong');
   })
}


module.exports = updateCostSheet;


