
const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const { default: mongoose } = require('mongoose');
const fs = require('fs');
const nodemailer = require('nodemailer');
const LogController = require('../../log/main.log.controller');
const ProposalLog = require('../../../models/proposal-log/proposal-log.model');
const Location = require('../../../models/location/location.model');
const generateProposal = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;
    Proposal.findById(Id).then((proposal) => {
        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            error.status = 400;
            throw error;
        }
    // console.log(data)
        Location.findOne({ location: proposal.location, center: proposal.center ,floor:proposal.floor }).then((locationdata) => {
   
            Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                if (result.acknowledged === true) {
                    if (result.modifiedCount > 0) {
                        req.locationData = locationdata;
                        next();
                    }
                    else {
                        let error = new Error('Error while generation proposal with additional Data');
                        throw error;
                    }
                }
                else {
                    let error = new Error('Error while generating Proposal');
                    throw error;
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Error while generatin propoasl';
                throw err;
            })
        }).catch((err) => {
            if (!err.message) err.message = 'Error while generatin propoasl';
            throw err;
        })

    }).catch((err) => {
        if (!err.message) err.message = 'Error while generatin propoasl';
        next(err);
    })

}

const generateProposalPDF = (req, res, next) => {
    let Id = req.params.Id;
    // console.log(Id)
   let data= req.body;
   Proposal.findById(Id).populate('salesPerson', 'userName').then((proposal) => {
    // console.log(proposal)
    Location.findOne({ location: proposal.location, center: proposal.center }).then((locationdata) => {
        let finalAmount;
        let perSeatPrice;
       let totalNoOfSeats= (proposal.billableSeats).toFixed(2)+'ws'
       let leaseArea =(proposal.areaOfUsableSelectedSeat/ locationdata.efficiency).toFixed(2);
        if(proposal.Serviced==='no'){
             finalAmount = locationdata.rackRateNS * proposal.billableSeats;
             perSeatPrice = locationdata.rackRateNS
        }else{
            // if(locationdata.futureRackRate>0){
            //     finalAmount = locationdata.futureRackRate * proposal.totalNumberOfSeats;
            // perSeatPrice = locationdata.futureRackRate;
            // }else{
                finalAmount = locationdata.rackRate * proposal.billableSeats;
                perSeatPrice = locationdata.rackRate;
            // }
            
        }
        let previousAmount = finalAmount || proposal.previousFinalOfferAmmount;
    Proposal.updateOne({ _id:proposal._id }, { $set: { previousFinalOfferAmmount: finalAmount}}).then((result)=>{
      
        if (result.acknowledged === true) {
            result.message='Succesfully updated';
        }
        else throw Error('Problem while updating');

    if (!proposal) {
        let error = new Error('Invalid Proposal Id');
        throw error;
    }
  

  
    try {
        const locationMetaData = req.locationData ;
        const doc = new PDFDocument({ size: [800, 566], margin: 0 });
        doc.pipe(fs.createWriteStream(`./assets/proposal/generated/${proposal._id}.pdf`));

        // First Page ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        doc.image('./assets/proposal/image/proposal-layout__page1-background.png', 0, 0, { width: 800, height: 566 });
        doc.image('./assets/proposal/image/proposal-layout__page1-logo.png', 200, 350, { scale: 0.25 });
        doc.addPage();

        // Second Page /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.image('./assets/proposal/image/proposal-layout__page2-image.png', 0, 0, { width: 800, height: 566 });
        doc.addPage();

        // Third Page //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.fontSize(38).text('Our Clients', 0, 10, { width: 800, align: 'center' });
        doc.fontSize(16).fillColor('grey').text('Top clients rely on us for innovatice workspace solutions', 0, 50, { width: 800, align: 'center' }).fontSize(12);
        doc.image('./assets/proposal/image/proposal-layout__page3-our_client.png', 20, 150, { width: 760 });
        doc.addPage();
       
        //   const imageOptions = {
        //     fit: [800, 566], 
        //     align: 'center',
        //     valign: 'center',
        //   };

        //   doc.image(proposal.imageDataOfLayout, 0, 0, imageOptions);
          const imageFilePath = proposal.imagePath;

    // Add the image to the PDF
    // doc.image(imageFilePath, 0, 0, { fit: [800, 566], align: 'center', valign: 'center' });

        // doc.addPage();
        doc.rect(20, 10, 100, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text('Proposal ID', 20, 20, { width: 100, align: 'center' })
        doc.rect(120, 10, 660, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text(proposal._id , 120, 20, { width: 660, align: 'center' });
        
        doc.rect(660, 10, 120, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text(new Date().toLocaleDateString(), 660, 20, { width: 120, align: 'center' })

        doc.rect(20, 40, 100, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text('Name of Client', 20, 50, { width: 100, align: 'center' })
        doc.rect(120, 40, 660, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text(proposal.clientName || "(Direct Client)", 120, 50, { width: 660, align: 'center' });
        doc.rect(20, 70, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('Location', 20, 80, { width: 100, align: 'center' });
        doc.rect(120, 70, 660, 30).fillAndStroke('white', 'black').fillColor('black').text(locationMetaData.address, 120, 80, { width: 660, align: 'center' });
        
        doc.rect(20, 100, 100, 90).fillAndStroke('white', 'black').fillColor('black').text('Requirements', 20, 130, { width: 100, align: 'center' });
        doc.rect(120, 100, 660, 90).fillAndStroke('white', 'black').fillColor('black').text(`As per layout - ${proposal.content}`, 122, 105, { width: 660, align: 'left' });

        doc.rect(20, 190, 250, 30).fillAndStroke('white', 'black').fillColor('black').text('Any Non-Standard Requirement', 25, 200, { width: 250, align: 'left' });
        doc.rect(200, 190, 580, 30).fillAndStroke('white', 'black').fillColor('black').text(proposal.NonStandardRequirement, 205, 200, { width: 580, align: 'left' });
       
        doc.rect(20, 220, 50, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('1', 25, 230, { width: 50, align: 'left' });
        doc.rect(60, 220, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Rent Commencement Date', 60, 230, { width: 180, align: 'center' });
        doc.rect(240, 220, 540, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(`${proposal.rentCommencmentDate.toLocaleDateString()}`, 240, 230, { width: 540, align: 'center' });

        doc.rect(20, 250, 50, 30).fillAndStroke('white', 'black').fillColor('black').text('2', 25, 260, { width: 50, align: 'left' });
        doc.rect(60, 250, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Tenure', 60, 260, { width: 180, align: 'center' });
        doc.rect(240, 250, 540, 30).fillAndStroke('white', 'black').fillColor('black').text(`${proposal.Tenure} months`, 240, 260, { width: 540, align: 'center' });
        doc.rect(20, 280, 50, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('3', 25, 290, { width: 50, align: 'left' });
        doc.rect(60, 280, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Lock-in Period', 60, 290, { width: 180, align: 'center' });
        doc.rect(240, 280, 540, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(`${proposal.LockIn} months`, 240, 290, { width: 540, align: 'center' });
        
        doc.rect(20, 310, 50, 30).fillAndStroke('white', 'black').fillColor('black').text('4', 25, 320, { width: 50, align: 'left' });
        doc.rect(60, 310, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Notice Period (post lock-in)', 60, 320, { width: 180, align: 'center' });
        doc.rect(240, 310, 240, 30).fillAndStroke('white', 'black').fillColor('black').text(`${proposal.noticePeriod} months`, 250, 320, { width: 155, align: 'center' });
        
        doc.rect(395, 310, 50, 30).fillAndStroke('white', 'black').fillColor('black').text('5', 395, 320, { width: 50, align: 'center' });
        doc.rect(445, 310, 160, 30).fillAndStroke('white', 'black').fillColor('black').text('Deposit Term', 445, 320, { width: 160, align: 'center' });
        doc.rect(605, 310, 175, 30).fillAndStroke('white', 'black').fillColor('black').text(`${proposal.depositTerm} months`, 605, 320, { width: 155, align: 'center' });
        
        doc.rect(20, 340, 50, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('6', 25, 350, { width: 50, align: 'left' });
        doc.rect(60, 340, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Escalation (Per annum)', 60, 350, { width: 180, align: 'center' });
        doc.rect(240, 340, 540, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('6% p.a - post completion of 12 months', 240, 350, { width: 540, align: 'center' });
        doc.rect(20, 370, 50, 30).fillAndStroke('white', 'black').fillColor('black').text('7', 25, 380, { width: 50, align: 'left' });
        doc.rect(60, 370, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Interest-free Service Retainer', 60, 380, { width: 180, align: 'center' });
        doc.rect(240, 370, 540, 30).fillAndStroke('white', 'black').fillColor('black').text('6 months', 240, 380, { width: 540, align: 'center' });
        doc.rect(20, 400, 50, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('8', 25, 410, { width: 50, align: 'left' });
        doc.rect(60, 400, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Car Parking Charges', 60, 410, { width: 180, align: 'center' });
        doc.rect(240, 400, 540, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(`INR ${locationdata.carParkCharge} + taxes per ws/ per month`, 240, 410, { width: 540, align: 'center' });
        doc.rect(20, 430, 50, 30).fillAndStroke('white', 'black').fillColor('black').text('9', 25, 440, { width: 50, align: 'left' });
        doc.rect(60, 430, 180, 30).fillAndStroke('white', 'black').fillColor('black').text(proposal.createWithArea === 'count' ? 'Cost Per Seat' : 'Usable Carpet Area', 60, 440, { width: 180, align: 'center' });
        doc.rect(240, 430, 540, 30).fillAndStroke('white', 'black').fillColor('black').text(` ${proposal.createWithArea === 'count' ? 'INR ' +perSeatPrice + ' + taxes per month' : proposal.areaOfUsableSelectedSeat + ' Sq. Ft.'} `, 240, 440, { width: 540, align: 'center' });
        doc.rect(20, 460, 50, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('10', 25, 470, { width: 50, align: 'left' });
        doc.rect(60, 460, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(proposal.createWithArea === 'count' ? 'Billable Seat' : ' Lease Area', 60, 470, { width: 180, align: 'center' });
        doc.rect(240, 460, 540, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(` ${proposal.createWithArea === 'count' ? 'Approx ' + totalNoOfSeats : leaseArea + ' Sq. Ft. '}`, 240, 470, { width: 540, align: 'center' });
        doc.rect(20, 490, 50, 30).fillAndStroke('#999999', 'black').fillColor('black').text('11', 25, 500, { width: 50, align: 'left' });
        doc.rect(60, 490, 180, 30).fillAndStroke('#999999', 'black').fillColor('black').text('System Total Cost (+GST)', 60, 500, { width: 180, align: 'center' });
        doc.rect(240, 490, 540, 30).fillAndStroke('#999999', 'black').fillColor('black').text(`INR ${new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(previousAmount)}  + taxes per month`, 240, 500, { width: 540, align: 'center' });
        doc.rect(20, 520, 50, 30).fillAndStroke('#999999', 'black').fillColor('black').text('12', 25, 530, { width: 50, align: 'left' });
        doc.rect(60, 520, 180, 30).fillAndStroke('#999999', 'black').fillColor('black').text('Final Closing Cost (+GST)', 60, 530, { width: 180, align: 'center' });
        if (isNaN(proposal.finalOfferAmmount)) {
            // Display "Yet to be approved" when finalOfferAmmount is NaN
            doc.rect(240, 520, 540, 30).fillAndStroke('#999999', 'black').fillColor('black').text('Yet to be approved', 240, 530, { width: 540, align: 'center' });
          } else {
            // Format and display the number when finalOfferAmmount is not NaN
            doc.rect(240, 520, 540, 30).fillAndStroke('#999999', 'black').fillColor('black').text(`INR ${new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(proposal.finalOfferAmmount)}  + taxes per month`, 240, 530, { width: 540, align: 'center' });
          }
                  doc.addPage();
        //image add of selected content
        if(proposal.cubicalCount>0){
            doc.image('./assets/proposal/image/cubical.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        // if(proposal.workstation2x1>0){
        //     doc.image('./assets/proposal/image/workstation2x1.jpg', 0, 0, { width: 800, height: 566 });
        // doc.addPage();
        // }
        
        

        if(proposal.workstation3x2>0){
            doc.image('./assets/proposal/image/workstation3x2.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.workstation4x2>0){
            doc.image('./assets/proposal/image/workstation4x2.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.workstation5x2>0){
            doc.image('./assets/proposal/image/workstation5x2.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        // if(proposal.workstation5x2_5>0){
        //   doc.text("In Development");
        // doc.addPage();
        // }
        
        

        // if(proposal.workstation4x4>0){
        //     doc.text("In Development");
        // doc.addPage();
        // }
        
        

        if(proposal.workstation5x4>0){
            doc.image('./assets/proposal/image/workstation5x4.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.workstation5x5>0){
            doc.text("In Development");
        doc.addPage();
        }
        
        

        if(proposal.cabinRegular>0){
            doc.image('./assets/proposal/image/regular_cabin.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        // if(proposal.cabinMedium>0){
        //     doc.image('./assets/proposal/image/md_cabin.jpg', 0, 0, { width: 800, height: 566 });
        // doc.addPage();
        // }
        
        

        if(proposal.cabinLarge>0){
            doc.text("In Development");
        doc.addPage();
        }
        
        

        if(proposal.cabinMD>0){
            doc.image('./assets/proposal/image/md_cabin.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.meeting4P>0){
            doc.image('./assets/proposal/image/meeting_room_4p.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.meeting6P>0){
            doc.image('./assets/proposal/image/meeting_room_6p.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.meeting8P>0){
            doc.image('./assets/proposal/image/meeting_room_8p.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        

        if(proposal.meeting12P>0){
            doc.text("In Development",0, 0);
        doc.addPage();
        }
        
        

        if(proposal.meeting16P>0){
            doc.text("In Development",0, 0);
        doc.addPage();
        }

        if(proposal.board20P>0){
            doc.image('./assets/proposal/image/conference_room_20p.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        if(proposal.board24P>0){
            doc.image('./assets/proposal/image/conference_room_24p.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.collab4P>0){
            doc.image('./assets/proposal/image/collab_area.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.collab6P>0){
            doc.image('./assets/proposal/image/collab_area_medium.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        if(proposal.collab8P>0){
            doc.image('./assets/proposal/image/collab_area_large.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.dryPantryNumber>0){
            doc.image('./assets/proposal/image/dry_pantry.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        if(proposal.receptionSmall>0){
            doc.image('./assets/proposal/image/reception_small.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
      

        if(proposal.receptionMedium>0){
            doc.image('./assets/proposal/image/reception_medium.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.receptionLarge>0){
            doc.image('./assets/proposal/image/reception_large.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.storeRoomNumber>0){
            doc.image('./assets/proposal/image/store_room.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        
        if(proposal.phoneBoothNumber>0){
            doc.image('./assets/proposal/image/phone_booth.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        // if(proposal.nicheSeat2Pax>0){
        //     doc.image('./assets/proposal/image/niche_seating.jpg', 0, 0, { width: 800, height: 566 });
        // doc.addPage();
        // }
        // if(proposal.nicheSeat4Pax>0){
        //     doc.image('./assets/proposal/image/niche_seating_2.jpg', 0, 0, { width: 800, height: 566 });
        // doc.addPage();
        // }
        
        if(proposal.cafeteriaNumber>0){
            doc.image('./assets/proposal/image/cafeteria_seating.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
      

        if(proposal.server1Rack>0 || proposal.server2Rack>0 || proposal.server3Rack>0 || proposal.server4Rack>0){
            doc.image('./assets/proposal/image/server_room.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }


        if(proposal.prayerRoomNumber>0){
            doc.text("In Development",0, 0);
        doc.addPage();
        }

        if(proposal.wellnessRoomNumber>0){
            doc.image('./assets/proposal/image/wellness_room.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }

        if(proposal.trainingRoomNumber>0){
            doc.image('./assets/proposal/image/training_room.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        

        if(proposal.gameRoomNumber>0){
            doc.image('./assets/proposal/image/game_room.jpg', 0, 0, { width: 800, height: 566 });
        doc.addPage();
        }
        
        // Page Six Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.image('./assets/proposal/image/proposal-layout__page6.png', 0, 0, { width: 800, height: 566 });
        doc.addPage();

        // Page Seven Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.image('./assets/proposal/image/proposal-layout__page7.png', 0, 0, { width: 800, height: 566 });
        doc.addPage();

        // Page Eight Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.image('./assets/proposal/image/proposal-layout__page8.png', 0, 0, { width: 800, height: 566 });
        doc.addPage();

        // Page Nine Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.image('./assets/proposal/image/proposal-layout__page9.png', 0, 0, { width: 800, height: 566 });

        // PDF generation Ends Here ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        doc.end();

   

        if(proposal.status === 'Completed and approved'){
            res.status(200).send({
                "Message": 'Proposal Generated Successfully'
            });
        }  else{
                  Proposal.updateOne({ _id: Id }, { $set: { status: 'Completed But not Esclated' } }).then((updateResult) => {
                  if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                      LogController.proposal.update(proposal._id, { logMessage: 'Proposal Generated', proposalGenerated: 'yes' })
                      res.status(200).send({
                          "Message": 'Proposal Generated Successfully',
   
                      });
                      req.salesPersonEmail = proposal.salesPerson.userName;
                      next();
                  }
              }).catch((err) => {
                  if (!err.message) err.message = 'Something went wrong';
                  if (!err.status) err.status = 500;
                  return next(err);
              })
              
          }
      
        

        




    }
    catch (err) {
        if (!err.status) err.status = 500;
        if (!err.message) err.message = 'Server Error';
        throw err;
    }
 
})
})
}).catch((err) => {
    if (!err.message) err.message = 'Error while Generating proposal';
    next(err);
})



}

const sendProposalByEmail = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;

    const transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE,
        auth: {
            user: process.env.NODEMAILER_AUTH_USER,
            pass: process.env.NODEMAILER_AUTH_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.NODEMAILER_AUTH_USER,
        to: req.salesPersonEmail,
        subject: 'Proposal Document From Redbrick Office',
        text: 'Dear Sir/ma\'am, \n\n We are sending you the Document related to your proposal and location. All the documents attached to this email are computer generated the are not Fixed. Please contact relavent sales person if you have and query related you proposal\n \n Thanks and regards, \n Redbricks Office',
        attachments: [
            {
                filename: 'Proposal.pdf',
                path: path.join('assets', 'proposal', 'generated', `${Id}.pdf`)
            },
            {
                filename: 'Standard_Offerings_Fitout_2022.pdf',
                path: path.join('assets', 'proposal', 'pdf', 'Standard_Offerings_Fitout_2022.pdf')
            }
        ]
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return;
        ProposalLog.updateOne(Id, { logMessage: "Proposal Send on Email" });
    })
}

module.exports = {
    generateProposal: generateProposal,
    generateProposalPDF: generateProposalPDF,
    sendProposalByEmail: sendProposalByEmail
};