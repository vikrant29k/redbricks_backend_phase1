const User = require('../../../models/user/user.model')

const getCount = async (req, res, next) => {
    try {
        if(req.user.role==="admin"){
        const Admin = await User.countDocuments({ role: "admin" })
        const SalesHead = await User.countDocuments({ role: "sales head" })
        const Sales = await User.countDocuments({ role: "sales" })
        res.status(200).send({ Admin, SalesHead, Sales })
    }else{
        let err = new Error("unauthorize user ")
        err.statusCode=401;
        next(err);
    }
    }
    catch (err) {
        next(err)
    }
}

module.exports = getCount;