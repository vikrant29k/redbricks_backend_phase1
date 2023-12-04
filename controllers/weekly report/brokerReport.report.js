const Broker = require('../../models/broker/broker.model')
const exceljs = require('exceljs')
const path = require('path')
const nodemailer = require('nodemailer')
const Proposal = require('../../models/proposal/proposal.model')
const mongoose = require('mongoose')

const brokerReport = async (req, res, next) => {
  const user = req.user
  // console.log(user)
  try {
    var date = new Date()
    const month = date.getMonth()
    const year = date.getFullYear()
    date = new Date().toLocaleString();
    const data = await Broker.find();

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('brokerReport');
    // Define your columns and headers...
    worksheet.columns = [
      { header: 'Broker Category', key: 'brokerCategory', width: 16 },
      { header: 'SPOC Name', key: 'SPOCName', width: 15 },
      { header: 'Broker Type', key: 'brokerType', width: 12 },
      { header: 'SPOC Number', key: 'SPOCNumber', width: 15 },
      { header: 'SPOC Email', key: 'SPOCEmail', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 11 },
      { header: 'Updated At', key: 'updatedAt', width: 11 },
      { header: 'Total Proposals', key: 'totalProposals', width: 14 },
      { header: 'Approve Proposals', key: 'approveProposals', width: 17 },
      { header: 'In-Progress Proposals', key: 'inProgressProposals', width: 20 },
      { header: 'This Month Proposals', key: 'thisMonthProposals', width: 20 }
    ];
    const promises = data.map(async (broker, index) => {
      const totalProposalCount = await Proposal.countDocuments({ brokerCategory: mongoose.Types.ObjectId(broker._id) });
      const approveProposalCount = await Proposal.countDocuments({
        brokerCategory: mongoose.Types.ObjectId(broker._id),
        $or: [
          { status: "Completed and approved" },
          { status: "Completed and Locked" },
        ],
      });
       const thisMonthProposals = await Proposal.find({ brokerCategory: mongoose.Types.ObjectId(broker._id), createdAt: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } })
      //  console.log(thisMonthProposals.length)

      const inProgressProposalCount = totalProposalCount - approveProposalCount;
      let editObj = broker.toObject();
      editObj.totalProposals = totalProposalCount;
      editObj.approveProposals = approveProposalCount;
      editObj.inProgressProposals = inProgressProposalCount;
      editObj.thisMonthProposals = thisMonthProposals.length;
      // console.log(editObj)
      worksheet.addRow(editObj);
    });
    // return next("thisMonthProposals")
    await Promise.all(promises);
    // workbook.title = `Brokers Report`;
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffff00' },
    };
    worksheet.getRow(1).font = {
      bold: true
    }
    worksheet.getRow(1).alignment={horizontal:'center'};
    worksheet.eachRow({includeEmpty:true},(row, rowNumber)=>{
      row.alignment = {horizontal:'center'}
    })
    await workbook.xlsx.writeFile(path.join('weeklyReport/BrokersReport', `All Brokers Report.xlsx`));

    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      auth: {
        user: process.env.NODEMAILER_AUTH_USER,
        pass: process.env.NODEMAILER_AUTH_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.NODEMAILER_AUTH_USER,
      to: user.userName,
      subject: `Brokers Report ${date}`,
      text: `Attached is the Brokers report of ${date}`,
      attachments: [
        {
          path: path.join('weeklyReport/BrokersReport', `All Brokers Report.xlsx`),
          filename: `All Brokers Report ${date}.xlsx`
        }
      ]
    };
    // res.status(200).send('Email sent successfully');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({Message:"Email sent successfully"});
      }
    });

  } catch (err) {
    if (!err.message) err.message = 'Something went wrong';
    return next(err);
  }
}
module.exports = brokerReport;