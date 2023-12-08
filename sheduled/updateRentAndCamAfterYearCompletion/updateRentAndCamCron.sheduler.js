const mongoose = require('mongoose');
const axios = require('axios');

const cron = require('node-cron');
const Location = require('../../models/location/location.model');

function recalculate(id){
    try {
      const locationId = id; // You need to pass the locationId from the frontend

      if (!locationId) {
        return res.status(404).json({ message: 'Location not found' });
      }
      Location.findById(mongoose.Types.ObjectId(locationId)).then((locationData) => {
        let rentCamTotal=locationData.rentSheet[0].rent+locationData.rentSheet[0].cam;
        locationData.rentAndCamTotal=rentCamTotal

        let costOfElectricity = locationData.costOfElectricity;
        let costOfOps = locationData.costOfOps;
        let costStandardInteriors = locationData.costOfStandardInteriors;

        let years3Rent = (costStandardInteriors / 36) * 1.12;
        let amortizedFitOutRentFor3Years = years3Rent;
        locationData.amortizedFitOutRentFor3Years=amortizedFitOutRentFor3Years
        let total_1 = years3Rent + costOfElectricity + costOfOps +rentCamTotal;
        locationData.total_1=total_1;
        let adminMarketing = total_1 * 0.05;
        locationData.adminMarketingAndOverHeads=adminMarketing

        let brokerage = total_1 * 0.07;
        locationData.brokerage=brokerage

        let total_2 = total_1 + adminMarketing + brokerage;
        locationData.total_2=total_2;

        let profitBeforeTax = total_2 * 0.5;
        locationData.profitBeforeTax=profitBeforeTax;

        let total_3 = total_2 + profitBeforeTax;
        locationData.total_3=total_3;
        let rateOfInventoryOnLeaseArea = (22 / 0.7) * total_3;
        locationData.rateOfInventoryOnLeaseArea=rateOfInventoryOnLeaseArea;

        let includeCommonsAmeneities = rateOfInventoryOnLeaseArea * 1.1;
        locationData.includeCommonsAmenities=includeCommonsAmeneities
        let on80perDiversityFactor = includeCommonsAmeneities / 0.8;
        locationData.on80perDiversityFactor=on80perDiversityFactor
        let systemValue = Math.round(on80perDiversityFactor);
        locationData.systemPrice=systemValue
        let rackValue = Math.ceil(on80perDiversityFactor / 1000) * 1000 + 1000;
        locationData.rackRate=rackValue;
        // Non-serviced values
        let nonServiceCalculation =
        Number(
            (((amortizedFitOutRentFor3Years +rentCamTotal) +
            (amortizedFitOutRentFor3Years +rentCamTotal) * 0.05 +
            (amortizedFitOutRentFor3Years +rentCamTotal) * 0.07) *
            0.5) +
            (amortizedFitOutRentFor3Years +rentCamTotal) +
            (amortizedFitOutRentFor3Years +rentCamTotal) * 0.05 +
            (amortizedFitOutRentFor3Years +rentCamTotal) * 0.07
        );
        let nonServiceROI = Number((22 / 0.7) * nonServiceCalculation);
        let nonServiceICA = Number(nonServiceROI * 1.1);
        let systemValueNS = Number(Math.round(nonServiceICA / 0.8).toFixed(0));
        locationData.systemPriceNS=systemValueNS
        let rackValueNS = Math.ceil(systemValueNS / 1000) * 1000 + 1000;
        locationData.rackRateNS=rackValueNS

        Location.updateOne({ _id: mongoose.Types.ObjectId(locationId) }, { $set: locationData }).then((result) => {
            if (result.acknowledged) {
                if (result.modifiedCount > 0) {
                   console.log("Calculation Updated")
                }
                else {
                    console.log("Calculation Not Updated")
                }
            }
            else {
                console.log("Error While updateing calculation")
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong while updation location data';
            if (!err.status) err.status = 503;
            next(err);
        })
      })
  
    } catch (error) {
      console.error('Error during recalculation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

const updateRentAndCamYearly = cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();

    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
   
    const locations = await Location.find({
      'rentSheet.year': { $exists: true, $lte: oneYearAgo.toISOString() },
    });
  
    for (const location of locations) {
      for (const entry of location.rentSheet) {
        const entryDate = new Date(entry.year);
 
        if (oneYearAgo.getTime() >=entryDate.getTime() ) {
      
          const rentIncreasePercentage = location.percentageforRentCam;
          const camIncreasePercentage = location.percentageforRentCam;

          entry.rent *= (1 + rentIncreasePercentage / 100).toFixed(2);
          entry.cam *= (1 + camIncreasePercentage / 100).toFixed(2);

          entry.year = currentDate.toISOString();
        }
      }

    
      await Location.updateOne(
        { _id: location._id },
        {
          $set: {
            rentSheet: location.rentSheet,
          },
        }
      );
     recalculate(location._id)
    }

    console.log('Rent and Cam updated successfully.');
  } catch (error) {
    console.error('Error updating Rent and Cam:', error);
  }
});

module.exports = updateRentAndCamYearly;
