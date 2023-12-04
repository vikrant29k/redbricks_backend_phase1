const cron = require('node-cron');
const User = require('../../models/user/user.model');
const ProposalLog = require('../../models/proposal-log/proposal-log.model');
const { default: mongoose } = require('mongoose');
const exceljs = require('exceljs');
const nodemailer = require('nodemailer');
const path = require('path');


// 
// const salesHeadCentersReport = cron.schedule('0 8 * * */Monday', () => {
// // const salesHeadCentersReport = cron.schedule('*/1 * * * *', () => {
//     let date = new Date().toDateString();
//     date = new Date(date);
//     let lastWeekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
//     User.find().where('role').equals('sales head').then((salesHeadList) => {
//         salesHeadList.forEach((salesHead) => {
//             ProposalLog.find().where('salesHead').equals(mongoose.Types.ObjectId(salesHead._id)).where('updatedAt').gt(lastWeekDate).populate('salesPerson','firstName lastName').then(async(logData) => {
//                 // console.log(logData);
//                 logData = await JSON.parse(JSON.stringify(logData));
//                 // console.log(logData);
                
//                 let temp = logData.map((log) => {
                    
//                     log.salesPerson = `${log.salesPerson.firstName} ${log.salesPerson.lastName}`;
//                     // console.log('log;:',log)
//                     // console.log(log);
//                     return log;
//                 });
//                 // console.log('Temp::',temp)
//                 const workbook = new exceljs.Workbook();
//                 const workSheet = workbook.addWorksheet('Weekly Report');
//                 workSheet.columns = [
//                     {
//                         header: 'Center Name',
//                         key: 'proposalId',
//                         width: 20
//                     },
//                     {
//                         header: 'Total Workstations',
//                         key: 'logMessage',
//                         width: 40
//                     },
//                     {
//                         header: 'Selected Workstation',
//                         key: 'salesPerson',
//                         width: 20
//                     },
//                     {
//                         header: 'Date',
//                         key: 'clientName',
//                         width: 20
//                     },
//                     {
//                         header: 'Sales',
//                         key: 'proposalGenerated',
//                         width: 30
//                     },
//                     {
//                         header: 'Selected workstation count',
//                         key: 'seatsSelected',
//                         width: 30
//                     },
//                     {
//                         header: 'Location',
//                         key: 'location',
//                         width: 20
//                     },
//                     {
//                         header: 'Center',
//                         key: 'center',
//                         width: 20
//                     }
//                 ];

//                 // workSheet.getRow(1).fill('#ffff00');
//                 workSheet.getRow(1).fill = {
//                     type: 'pattern',
//                     pattern: 'solid',
//                     fgColor: { argb: 'ffff00' },
//                 };
//                 workSheet.getRow(1).font = {
//                     bold: true
//                 }

//                 workSheet.addRows(temp);
//                 workbook.title = `Weekly Report from ${lastWeekDate.toDateString()} to ${date.toDateString()}`;
                
//                 workbook.xlsx.writeFile(path.join('weeklyReport', `${salesHead._id}.xlsx`)).then(() => {
//                     const transporter = nodemailer.createTransport({
//                         service: process.env.NODEMAILER_SERVICE,
//                         auth: {
//                             user: process.env.NODEMAILER_AUTH_USER,
//                             pass: process.env.NODEMAILER_AUTH_PASSWORD
//                         }
//                     });

//                     let mailOptions = {
//                         from: process.env.NODEMAILER_AUTH_USER,
//                         to: salesHead.userName,
//                         subject: `Weekly Report from ${lastWeekDate.toDateString()} to ${date.toDateString()}`,
//                         attachments: [
//                             {
//                                 path: path.join('weeklyReport', `${salesHead._id}.xlsx`),
//                                 filename: `Weekly Report from ${lastWeekDate.toDateString()} to ${date.toDateString()}.xlsx`
//                             }
//                         ]
//                     };
//                     transporter.sendMail(mailOptions, (err, info) => {
//                         if (err) return console.log(err);
//                         console.log('Sales head weekly report send::', salesHead.firstName + salesHead.lastName);
//                     })
//                 })
//             })
//         })
//     })
// })

// module.exports = salesHeadCentersReport;