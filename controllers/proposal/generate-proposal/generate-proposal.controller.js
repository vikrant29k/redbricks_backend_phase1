
const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const { default: mongoose } = require('mongoose');
const fs = require('fs');
const nodemailer = require('nodemailer');
const LogController = require('../../log/main.log.controller');
const ProposalLog = require('../../../models/proposal-log/proposal-log.model');
const Location = require('../../../models/location/location.model');
const selectionData = require('../../../models/selectionData/selectionData.modal');
const JsonData = require('../../../models/jsonData/jsonData.model')
let allData;
async function getAllSelectionData() {
  try {
    // Fetch all documents from the 'selectionData' collection
    allData = await selectionData.find({});

    // Print each document using forEach
    // allData.forEach((document) => {
    //   // console.log("<<<<======>>>>>",document,"<<<<======>>>>>");
    // });

    // Alternatively, you can also use a for...of loop to print the documents
    // for (const document of allData) {
    //   console.log(document);
    // }
  } catch (err) {
    console.error('Error retrieving data:', err);
  }
}

// Call the function to get and print all data from the collection
getAllSelectionData();
const generateProposal = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;
    Proposal.findById(Id).then((proposal) => {
        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            error.status = 400;
            throw error;
        }
    
        Location.findOne({ location: proposal.location, center: proposal.center ,floor:proposal.floor }).then((locationdata) => {
        
          
          
            // Location.updateOne({ location: proposal.location, center: proposal.center }, { $set: { selectedNoOfSeats: locationdata.selectedNoOfSeats+proposal.totalNumberOfSeats, totalProposals: locationdata.totalProposals + 1}}).then((result)=>{
            //     if (result.acknowledged === true) {
            //         result.message='Succesfully updated';
            //     }
            //     else throw Error('Problem while updating');
            // });
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
   let data= req.body;
//    console.log("pdf genrate data=>",data)
   
    // let location;
    // let requiredNoOfSeats;

    Proposal.findById(Id).populate('salesPerson', 'userName').then((proposal) => {
        Location.findOne({ location: proposal.location, center: proposal.center }).then((locationdata) => {
            let finalAmount;
            let perSeatPrice;
           let totalNoOfSeats= (proposal.totalNumberOfSeats).toFixed(2)+'ws'
           let leaseArea =(proposal.areaOfUsableSelectedSeat/ locationdata.efficiency).toFixed(2);
            if(proposal.Serviced==='no'){
                 finalAmount = locationdata.rackRateNS * proposal.totalNumberOfSeats;
                 perSeatPrice = locationdata.rackRateNS
            }else{
                // if(locationdata.futureRackRate>0){
                //     finalAmount = locationdata.futureRackRate * proposal.totalNumberOfSeats;
                // perSeatPrice = locationdata.futureRackRate;
                // }else{
                    finalAmount = locationdata.rackRate * proposal.totalNumberOfSeats;
                    perSeatPrice = locationdata.rackRate;
                // }
                
            }
            let previousAmount = finalAmount || proposal.previousFinalOfferAmmount;
        Proposal.updateOne({ _id:proposal._id }, { $set: { finalOfferAmmount: finalAmount}}).then((result)=>{
          
            if (result.acknowledged === true) {
                result.message='Succesfully updated';
            }
            else throw Error('Problem while updating');

        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            throw error;
        }
      
        let selectFrom = req.params.selectFrom || proposal.selectFrom;
        let location = proposal.center;
        let requiredNoOfSeats = proposal.totalNumberOfSeats;
        let workStationId;
        // let jsonPath = path.join()
        let jsonFileData =  require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}_${proposal.floor}.json`))
        JsonData.findOne({layout:jsonFileData.layout}).then(layouDataFromjson=>{

          let layoutData=layouDataFromjson.toObject()
        // let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}_${proposal.floor}.json`))
        let workStationToBeSelectedIn = [];
        let workStationNotToBeSelected = [];
        // let layoutData = require(`../../../assets/layout/json/${location}.json`);/
        
        let selectedWsId;
        // Deciding in which workstation seats should be selected

        try {
            let seatsToBeSelected = requiredNoOfSeats;
            layoutData.workstations.forEach((workStation) => {
              if (
                requiredNoOfSeats <= workStation.AvailableNoOfSeats &&
                workStationToBeSelectedIn.length <= 0
              ) {
                selectedWsId = workStation._id;
                workStationId = workStation._id;
                workStationToBeSelectedIn = [
                  ...workStationToBeSelectedIn,
                  {
                    workStationId: workStation._id,
                    seatesToBeSelectedInWorkstation: requiredNoOfSeats,
                  },
                ];
              }
            });
            layoutData.workstations.forEach((workStation) => {
              if (selectedWsId !== workStation._id && selectedWsId !== undefined) {
                workStationId = workStation._id;
                workStationNotToBeSelected = [
                  ...workStationNotToBeSelected,
                  {
                    workStationId: workStation._id,
                    seatesToBeSelectedInWorkstation: workStation.AvailableNoOfSeats,
                  },
                ];
              }
            });
            if (workStationToBeSelectedIn.length <= 0) {
              if (seatsToBeSelected <= layoutData.AvailableNoOfSeats) {
                layoutData.workstations.forEach((workStation) => {
                  if (seatsToBeSelected !== 0) {
                    if (workStation.AvailableNoOfSeats <= seatsToBeSelected) {
                      seatsToBeSelected -= workStation.AvailableNoOfSeats;
                      workStationToBeSelectedIn = [
                        ...workStationToBeSelectedIn,
                        {
                          workStationId: workStation._id,
                          seatesToBeSelectedInWorkstation:
                            workStation.AvailableNoOfSeats,
                        },
                      ];
                    } else if (workStation.AvailableNoOfSeats >= seatsToBeSelected) {
                      workStationToBeSelectedIn = [
                        ...workStationToBeSelectedIn,
                        {
                          workStationId: workStation._id,
                          seatesToBeSelectedInWorkstation: seatsToBeSelected,
                        },
                      ];
        
                      seatsToBeSelected = 0;
                    }
                  } else {
                    workStationNotToBeSelected.push({
                      workStationId: workStation._id,
                      seatesToBeSelectedInWorkstation: workStation.AvailableNoOfSeats,
                    });
                  }
                });
                if (seatsToBeSelected !== 0) {
                  let error = new Error("Space not Available!");
                  error.status = 404;
                  throw error;
                }
              }
            }
            if (workStationToBeSelectedIn.length <= 0) {
              let error = new Error("Space not available!");
              error.status = 404;
              throw error;
            }
          }
        catch (err) {
            if (!err.message) err.message = 'Error while selecting Zone';
            throw err;
        }
        try {
            // console.log('locationMetaData => ',req.locationData);
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
            doc.image(path.join(__dirname, '..', '..', '..', 'assets', 'layout', 'image', `${proposal.location}_${proposal.center}_${proposal.floor}.png`), { height: 566, align: 'center', valign: 'center' });

            let selectedWorkstationData = [];


            // Generation of layout start from here ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          
            markSeatsOnLayout = (workstationToSelect) => {
                if (workstationToSelect.workStationId) {
                  let workStationId = workstationToSelect.workStationId;
                  let requiredNoOfSeats =
                    workstationToSelect.seatesToBeSelectedInWorkstation;
                  let workStationData = {
                    ...layoutData.workstations.find(
                      (workStation) => workStationId === workStation._id
                    ),
                  };
                  let rowComplete = false;
                  let subWorkStationStarted = false;
                  let subWorkStationData;
          
                  let workStationSelectedData = {
                    _id: workStationData._id,
                    sizeOfSeat: { ...workStationData.sizeOfSeat },
                    startingXAxis: workStationData.startingXAxis,
                    startingXAxisOpposite: workStationData.startingXAxisOpposite,
                    startingYAxis: workStationData.startingYAxis,
                    lastYAxis: workStationData.lastYAxis,
                    selectedAreaXAxis: workStationData.selectedAreaXAxis,
                    selectedAreaXAxisOpposite: workStationData.selectedAreaXAxisOpposite,
                    selectedAreaYAxis: workStationData.selectedAreaYAxis,
                    partition: [],
                    gapPosition: [],
                    pillarPosition: [],
                    subWorkStationArea: []
                }

                  // If it is defined to start the selection of seat from right then only it will only select from right otherwise from left side
                  if (selectFrom === "right") {
                    for (let i = 1; i <= requiredNoOfSeats; i++) {
                      // If row is completed
                      if (rowComplete === true) {
                        workStationData.selectedAreaXAxisOpposite -=
                          workStationData.sizeOfSeat.width;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        rowComplete = false;
                      }
                      // Checking for Pillar and drawing
                      workStationData.pillarPosition.forEach((pillar) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            pillar.startingXPositionOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            pillar.startingXPositionOpposite + 1 &&
                          workStationData.selectedAreaYAxis >
                            pillar.startingYPosition - 1 &&
                          workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                        ) {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  pillar.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  pillar.pillarWidth,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          workStationData.selectedAreaYAxis += pillar.pillarHeight;
                        }
                      });
                      // checking for partition and drawing
                      workStationData.partition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            gap.startingPositionOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            gap.startingPositionOpposite + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite - gap.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite - gap.width,
                                workStationData.selectedAreaYAxis + gap.height,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis + gap.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("red");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxisOpposite -= gap.width;
                        }
                      });
                      // checking for gap between workstation and drawing it
                      workStationData.gapPosition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            gap.startingPositonOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            gap.startingPositonOpposite + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  gap.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  gap.pillarWidth,
                                workStationData.selectedAreaYAxis + gap.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis + gap.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxisOpposite -= gap.pillarWidth;
                        }
                      });
                      // checking for partition and drawing
                      workStationData.partition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            gap.startingPositionOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            gap.startingPositionOpposite + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite - gap.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite - gap.width,
                                workStationData.selectedAreaYAxis + gap.height,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis + gap.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("red");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxisOpposite -= gap.width;
                        }
                      });
                      // checking for pillar and drawing;
                      workStationData.pillarPosition.forEach((pillar) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            pillar.startingXPositionOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            pillar.startingXPositionOpposite + 1 &&
                          workStationData.selectedAreaYAxis >
                            pillar.startingYPosition - 1 &&
                          workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                        ) {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  pillar.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  pillar.pillarWidth,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          workStationData.selectedAreaYAxis += pillar.pillarHeight;
                        }
                      });
                      // checking if sub-Workstation started or not
                      workStationData.subWorkStationArea.forEach((subWorkStation) => {
                        if (
                          workStationData.selectedAreaXAxisOpposite >
                            subWorkStation.startingXAxisOpposite - 1 &&
                          workStationData.selectedAreaXAxisOpposite <
                            subWorkStation.startingXAxisOpposite + 1
                        ) {
                          subWorkStationStarted = true;
                          subWorkStationData = { ...subWorkStation };
                        }
                      });
                      // checking if row is completed till now or not;
                      if (
                        workStationData.selectedAreaYAxis >
                          workStationData.lastYAxis - 1 &&
                        workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                      ) {
                        rowComplete = true;
                      }
                      // restricting the selection of seat if sub-WorkStation started
                      if (subWorkStationStarted === false) {
                        // if row completed before selecting the seat then it should not count the current selection
                        if (rowComplete === true) {
                          i--;
                        }
                        // if row is not completed till now then it should select seat
                        else {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  workStationData.sizeOfSeat.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite -
                                  workStationData.sizeOfSeat.width,
                                workStationData.selectedAreaYAxis +
                                  workStationData.sizeOfSeat.height,
                              ],
                              [
                                workStationData.selectedAreaXAxisOpposite,
                                workStationData.selectedAreaYAxis +
                                  workStationData.sizeOfSeat.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .lineWidth(0.2)
                            .stroke("blue");
                          workStationData.selectedAreaYAxis +=
                            workStationData.sizeOfSeat.height;
                        }
                      }
                      // checking if row is completed after selection of seat
                      if (
                        workStationData.selectedAreaYAxis >
                          workStationData.lastYAxis - 1 &&
                        workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                      ) {
                        rowComplete = true;
                      }
                      // if Sub-Workstation started
                      if (subWorkStationStarted === true) {
                        let subrowComplete;
                        let subWorkStationLastCheck = false;
                        for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                          // checking if Sub-Workstation row completed or not
                          if (subrowComplete === true) {
                            subWorkStationData.selectedAreaXAxisOpposite -=
                              subWorkStationData.sizeOfSeat.width;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subrowComplete = false;
                          }
                          // checking if pillar started in Sub-WorkStation
                          subWorkStationData.pillarPosition.forEach((pillar) => {
                            if (
                              subWorkStationData.selectedAreaXAxisOpposite >
                                pillar.startingXPositionOpposite - 1 &&
                              subWorkStationData.selectedAreaXAxisOpposite <
                                pillar.startingXPositionOpposite + 1 &&
                              subWorkStationData.selectedAreaYAxis >
                                pillar.startingYPosition - 1 &&
                              subWorkStationData.selectedAreaYAxis <
                                pillar.startingYPosition + 1
                            ) {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                            }
                          });
                          // checking if partition started in Sub-WorkStation
                          subWorkStationData.partition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxisOpposite >
                                gap.startingPositionOpposite - 1 &&
                              subWorkStationData.selectedAreaXAxisOpposite <
                                gap.startingPositionOpposite + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.width,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("red");
                              subrowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxisOpposite -= gap.width;
                            }
                          });
                          // checking if gap started in Sub-WorkStation
                          subWorkStationData.gapPosition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxisOpposite >
                                gap.startingPositonOpposite - 1 &&
                              subWorkStationData.selectedAreaXAxisOpposite <
                                gap.startingPositonOpposite + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      gap.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis +
                                      gap.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              rowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxisOpposite -=
                                gap.pillarWidth;
                            }
                          });
                          // checking if partition started in Sub-WorkStation
                          subWorkStationData.partition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxisOpposite >
                                gap.startingPositionOpposite - 1 &&
                              subWorkStationData.selectedAreaXAxisOpposite <
                                gap.startingPositionOpposite + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      gap.width,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("red");
                              subrowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxisOpposite -= gap.width;
                            }
                          });
                          // checking if pillar started in Sub-WorkStation
                          subWorkStationData.pillarPosition.forEach((pillar) => {
                            if (
                              subWorkStationData.selectedAreaXAxisOpposite >
                                pillar.startingXPositionOpposite - 1 &&
                              subWorkStationData.selectedAreaXAxisOpposite <
                                pillar.startingXPositionOpposite + 1 &&
                              subWorkStationData.selectedAreaYAxis >
                                pillar.startingYPosition - 1 &&
                              subWorkStationData.selectedAreaYAxis <
                                pillar.startingYPosition + 1
                            ) {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                            }
                          });
                          // checking if Sub-Workstation row is completed or not till now
                          if (
                            subWorkStationData.selectedAreaYAxis >
                              subWorkStationData.lastYAxis - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              subWorkStationData.lastYAxis + 1
                          ) {
                            subrowComplete = true;
                          }
                          // restricting the selection of seat if last sub-workstation check is running
                          if (subWorkStationLastCheck === false) {
                            // if row is completed before selection of seat then decreasing the number of seat selected
                            if (subrowComplete === true) {
                              i--;
                              j--;
                            }
                            // if row is not completed till now
                            else {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      subWorkStationData.sizeOfSeat.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite -
                                      subWorkStationData.sizeOfSeat.width,
                                    subWorkStationData.selectedAreaYAxis +
                                      subWorkStationData.sizeOfSeat.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxisOpposite,
                                    subWorkStationData.selectedAreaYAxis +
                                      subWorkStationData.sizeOfSeat.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .lineWidth(0.2)
                                .stroke("red");
                            }
                          }
                          subWorkStationData.selectedAreaYAxis +=
                            subWorkStationData.sizeOfSeat.height;
                          // checking if row is completed after selection of seat
                          if (
                            subWorkStationData.selectedAreaYAxis >
                              subWorkStationData.lastYAxis - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              subWorkStationData.lastYAxis + 1
                          ) {
                            subrowComplete = true;
                          }
                          // reached the limit of total no of seat could be selected
                          if (
                            i === Number(requiredNoOfSeats) ||
                            j === Number(subWorkStationData.AvailableNoOfSeats)
                          ) {
                            if (subWorkStationLastCheck === false) {
                              i--;
                              j--;
                              subWorkStationLastCheck = true;
                            } else {
                              workStationData.selectedAreaXAxisOpposite =
                                subWorkStationData.startingXAxis;
                              break;
                            }
                          }
                          i++;
                        }
                        subWorkStationStarted = false;
                      }
                    }
                  }
                  // starting the default selection of seat from left side.
                  else {
                    for (let i = 1; i <= requiredNoOfSeats; i++) {
                      // If row is completed
                      if (rowComplete === true) {
                        workStationData.selectedAreaXAxis +=workStationData.sizeOfSeat.width;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationSelectedData.selectedAreaXAxisOpposite = workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width;
                        workStationSelectedData.startingXAxisOpposite = workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width;
                        
                        rowComplete = false;
                      }
                      // Checking for Pillar and drawing
                      workStationData.pillarPosition.forEach((pillar) => {
                        if (
                          workStationData.selectedAreaXAxis >
                            pillar.startingXPosition - 1 &&
                          workStationData.selectedAreaXAxis <
                            pillar.startingXPosition + 1 &&
                          workStationData.selectedAreaYAxis >
                            pillar.startingYPosition - 1 &&
                          workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                        ) {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + pillar.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + pillar.pillarWidth,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          workStationData.selectedAreaYAxis += pillar.pillarHeight;
                          workStationSelectedData.pillarPosition = [
                            ...workStationSelectedData.pillarPosition,
                            pillar
                        ]
                        }
                      });
                      // checking for partition and drawing
                      workStationData.partition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                          workStationData.selectedAreaXAxis < gap.startingPosition + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.width,
                                workStationData.selectedAreaYAxis + gap.height,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis + gap.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("red");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxis += gap.width;
                          workStationSelectedData.partition = [
                            ...workStationSelectedData.partition,
                            gap
                        ];
                        }
                      });
                      // checking for gap between workstation and drawing it
                      workStationData.gapPosition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxis > gap.startingPositon - 1 &&
                          workStationData.selectedAreaXAxis < gap.startingPositon + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.pillarWidth,
                                workStationData.selectedAreaYAxis + gap.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis + gap.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxis += gap.pillarWidth;
                          workStationSelectedData.gapPosition = [
                            ...workStationSelectedData.gapPosition,
                            gap
                        ];
                        }
                      });
                      // checking for partition and drawing
                      workStationData.partition.forEach((gap) => {
                        if (
                          workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                          workStationData.selectedAreaXAxis < gap.startingPosition + 1
                        ) {
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + gap.width,
                                workStationData.selectedAreaYAxis + gap.height,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis + gap.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("red");
                          rowComplete = false;
                          workStationData.selectedAreaYAxis =
                            workStationData.startingYAxis;
                          workStationData.selectedAreaXAxis += gap.width;
                          workStationSelectedData.partition = [
                            ...workStationSelectedData.partition,
                            gap
                        ];
                        }
                      });
                      // checking for pillar and drawing;
                      workStationData.pillarPosition.forEach((pillar) => {
                        if (
                          workStationData.selectedAreaXAxis >
                            pillar.startingXPosition - 1 &&
                          workStationData.selectedAreaXAxis <
                            pillar.startingXPosition + 1 &&
                          workStationData.selectedAreaYAxis >
                            pillar.startingYPosition - 1 &&
                          workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                        ) {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + pillar.pillarWidth,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis + pillar.pillarWidth,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis + pillar.pillarHeight,
                              ]
                            )
                            .fillOpacity(0.4)
                            .fill("green");
                          workStationData.selectedAreaYAxis += pillar.pillarHeight;
                          workStationSelectedData.pillarPosition = [
                            ...workStationSelectedData.pillarPosition,
                            pillar
                        ];
                        }
                      });
                      // checking if sub-Workstation started or not
                      workStationData.subWorkStationArea.forEach((subWorkStation) => {
                        if (workStationData.selectedAreaXAxis >subWorkStation.startingXAxis - 1 && workStationData.selectedAreaXAxis < subWorkStation.startingXAxis + 1
                        ) {
                          subWorkStationStarted = true;
                          subWorkStationData = { ...subWorkStation };
                        }
                      });
                      // checking if row is completed till now or not;
                      if (
                        workStationData.selectedAreaYAxis >
                          workStationData.lastYAxis - 1 &&
                        workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                      ) {
                        rowComplete = true;
                      }
                      // restricting the selection of seat if sub-WorkStation started
                      if (subWorkStationStarted === false) {
                        // if row completed before selecting the seat then it should not count the current selection
                        if (rowComplete === true) {
                          i--;
                        }
                        // if row is not completed till now then it should select seat
                        else {
                          doc
                            .polygon(
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis +
                                  workStationData.sizeOfSeat.width,
                                workStationData.selectedAreaYAxis,
                              ],
                              [
                                workStationData.selectedAreaXAxis +
                                  workStationData.sizeOfSeat.width,
                                workStationData.selectedAreaYAxis +
                                  workStationData.sizeOfSeat.height,
                              ],
                              [
                                workStationData.selectedAreaXAxis,
                                workStationData.selectedAreaYAxis +
                                  workStationData.sizeOfSeat.height,
                              ]
                            )
                            .fillOpacity(0.4)
                            .lineWidth(0.2)
                            .stroke("blue");
                          workStationData.selectedAreaYAxis +=
                            workStationData.sizeOfSeat.height;
                        }
                      }
                      // checking if row is completed after selection of seat
                      if (
                        workStationData.selectedAreaYAxis >
                          workStationData.lastYAxis - 1 &&
                        workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                      ) {
                        rowComplete = true;
                      }
                      // if Sub-Workstation started
                      if (subWorkStationStarted === true) {
                        let subrowComplete;
                        let subWorkStationLastCheck = false;
                        let subWorkStationSelectedData = {
                          totalNoOfSeats: subWorkStationData.totalNoOfSeats,
                          AvailableNoOfSeats: subWorkStationData.AvailableNoOfSeats,
                          sizeOfSeat: { ...subWorkStationData.sizeOfSeat },
                          startingXAxis: subWorkStationData.startingXAxis,
                          startingYAxis: subWorkStationData.startingYAxis,
                          lastYAxis: subWorkStationData.lastYAxis,
                          selectedAreaXAxis: subWorkStationData.selectedAreaXAxis,
                          selectedAreaYAxis: subWorkStationData.selectedAreaYAxis,
                          partition: [],
                          gapPosition: [],
                          pillarPosition: []
                      }
                        for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                          // if row completed in Sub-Workstation
                          if (subrowComplete === true) {
                            subWorkStationData.selectedAreaXAxis +=
                              subWorkStationData.sizeOfSeat.width;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subrowComplete = false;
                          }
                          // checking for pillar in current Sub-Workstation
                          subWorkStationData.pillarPosition.forEach((pillar) => {
                            if (
                              subWorkStationData.selectedAreaXAxis >
                                pillar.startingXPosition - 1 &&
                              subWorkStationData.selectedAreaXAxis <
                                pillar.startingXPosition + 1 &&
                              subWorkStationData.selectedAreaYAxis >
                                pillar.startingYPosition - 1 &&
                              subWorkStationData.selectedAreaYAxis <
                                pillar.startingYPosition + 1
                            ) {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                              subWorkStationSelectedData.pillarPosition = [
                                ...subWorkStationSelectedData.pillarPosition,
                                pillar
                            ];
                            }
                          });
                          // checking for partition in current Sub-Workstation
                          subWorkStationData.partition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxis >
                                gap.startingPosition - 1 &&
                              subWorkStationData.selectedAreaXAxis <
                                gap.startingPosition + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis + gap.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis + gap.width,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("red");
                              rowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxis += gap.width;
                              subWorkStationSelectedData.partition = [
                                ...subWorkStationSelectedData.partition,
                                gap
                            ];
                            }
                          });
                          // checking for gap in current Sub-Workstation
                          subWorkStationData.gapPosition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxis >
                                gap.startingPositon - 1 &&
                              subWorkStationData.selectedAreaXAxis <
                                gap.startingPositon + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      gap.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      gap.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      gap.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis +
                                      gap.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              rowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxis += gap.pillarWidth;
                              subWorkStationSelectedData.gapPosition = [
                                ...subWorkStationSelectedData.gapPosition,
                                gap
                            ];
                            }
                          });
                          // checking for partition in current Sub-Workstation
                          subWorkStationData.partition.forEach((gap) => {
                            if (
                              subWorkStationData.selectedAreaXAxis >
                                gap.startingPosition - 1 &&
                              subWorkStationData.selectedAreaXAxis <
                                gap.startingPosition + 1
                            ) {
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis + gap.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis + gap.width,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis + gap.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("red");
                              subrowComplete = false;
                              subWorkStationData.selectedAreaYAxis =
                                subWorkStationData.startingYAxis;
                              subWorkStationData.selectedAreaXAxis += gap.width;
                              subWorkStationSelectedData.partition = [
                                ...subWorkStationSelectedData.partition,
                                gap
                            ];
                            }
                          });
                          // checking for pillar in current Sub-Workstation
                          subWorkStationData.pillarPosition.forEach((pillar) => {
                            if (
                              subWorkStationData.selectedAreaXAxis >
                                pillar.startingXPosition - 1 &&
                              subWorkStationData.selectedAreaXAxis <
                                pillar.startingXPosition + 1 &&
                              subWorkStationData.selectedAreaYAxis >
                                pillar.startingYPosition - 1 &&
                              subWorkStationData.selectedAreaYAxis <
                                pillar.startingYPosition + 1
                            ) {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      pillar.pillarWidth,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis +
                                      pillar.pillarHeight,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .fill("green");
                              subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                              
                              subWorkStationSelectedData.pillarPosition = [
                                ...subWorkStationSelectedData.pillarPosition,
                                pillar
                            ];
                            }
                          });
                          // checking if row is completed in Sub-Workstation or not;
                          if (
                            subWorkStationData.selectedAreaYAxis >
                              subWorkStationData.lastYAxis - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              subWorkStationData.lastYAxis + 1
                          ) {
                            subrowComplete = true;
                          }
                          // if row completed in Sub-Workstation till now then skip the current count of seat selection
                          if (subWorkStationLastCheck === false) {
                            if (subrowComplete === true) {
                              j--;
                              i--;
                            } else {
                              doc
                                .polygon(
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      subWorkStationData.sizeOfSeat.width,
                                    subWorkStationData.selectedAreaYAxis,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis +
                                      subWorkStationData.sizeOfSeat.width,
                                    subWorkStationData.selectedAreaYAxis +
                                      subWorkStationData.sizeOfSeat.height,
                                  ],
                                  [
                                    subWorkStationData.selectedAreaXAxis,
                                    subWorkStationData.selectedAreaYAxis +
                                      subWorkStationData.sizeOfSeat.height,
                                  ]
                                )
                                .fillOpacity(0.4)
                                .lineWidth(0.2)
                                .stroke("red");
                            }
                          }
                          subWorkStationData.selectedAreaYAxis +=
                            subWorkStationData.sizeOfSeat.height;
                          // check if row is completed in after selecting seat
                          if (
                            subWorkStationData.selectedAreaYAxis >
                              subWorkStationData.lastYAxis - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              subWorkStationData.lastYAxis + 1
                          ) {
                            subrowComplete = true;
                          }
                          // check if required no of seate is selected or the available no of seat in current Sub-Workstation are all selected.
                          if (
                            i === Number(requiredNoOfSeats) ||
                            j === Number(subWorkStationData.AvailableNoOfSeats)
                          ) {
                            // rowComplete = true;
                            if (subWorkStationLastCheck === false) {
                              i--;
                              j--;
                              subWorkStationLastCheck = true;
                            }  else {
                              workStationData.selectedAreaXAxis = subWorkStationData.startingXAxisOpposite;
                              subWorkStationLastCheck = false;
                              let xAxisDifference = subWorkStationData.selectedAreaXAxisOpposite - subWorkStationData.selectedAreaXAxis;
                              subWorkStationSelectedData = {
                                  ...subWorkStationSelectedData,
                                  totalNoOfSeats: j,
                                  AvailableNoOfSeats: j,
                                  selectedAreaXAxisOpposite: (xAxisDifference > 3) ? subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width : subWorkStationData.selectedAreaXAxisOpposite,
                                  startingXAxisOpposite: (xAxisDifference > 3) ? subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width : subWorkStationData.startingXAxisOpposite
                              }
                              subWorkStationData.selectedAreaXAxisOpposite = subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width;
                              subWorkStationData.startingXAxisOpposite = subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width;
                              let yAxisDifference = subWorkStationData.lastYAxis - (subWorkStationData.selectedAreaYAxis - subWorkStationData.sizeOfSeat.height) 
                              if ((yAxisDifference > 3) && ((subWorkStationData.selectedAreaYAxis - subWorkStationData.sizeOfSeat.height) !== subWorkStationData.startingYAxis)) {
                                  let pillarForRemainingSeatsInRow = {
                                      startingXPosition: subWorkStationData.selectedAreaXAxis,
                                      startingXPositionOpposite: subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width,
                                      startingYPosition: subWorkStationData.selectedAreaYAxis - subWorkStationData.sizeOfSeat.height,
                                      pillarWidth: subWorkStationData.sizeOfSeat.width,
                                      pillarHeight: yAxisDifference
                                  }
                                  subWorkStationSelectedData.pillarPosition.push(pillarForRemainingSeatsInRow);
                              }
                              break;
                          }
                          }
                          i++;
                        }
                        workStationSelectedData.selectedAreaXAxisOpposite = subWorkStationStarted ? subWorkStationData.selectedAreaXAxisOpposite : workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width;
                        workStationSelectedData.startingXAxisOpposite = subWorkStationStarted ? subWorkStationData.startingXAxisOpposite : workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width;

                        // workStationSelectedData.totalNoOfSeats = i;
                        workStationSelectedData.subWorkStationArea = [
                            ...workStationSelectedData.subWorkStationArea,
                            subWorkStationSelectedData
                        ];
                        subWorkStationStarted = false;
                      }
                      workStationSelectedData.totalNoOfSeats = i;
                      workStationSelectedData.AvailableNoOfSeats = i;
                    }
                    let workStationYAxisDifference = workStationData.lastYAxis - workStationData.selectedAreaYAxis;
                    if (workStationYAxisDifference > 3) {
                        let pillarForRemainingSeatsInRow = {
                            startingXPosition: workStationData.selectedAreaXAxis,
                            startingXPositionOpposite: workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width,
                            startingYPosition: workStationData.selectedAreaYAxis,
                            pillarWidth: workStationData.sizeOfSeat.width,
                            pillarHeight: workStationYAxisDifference
                        }
                        workStationSelectedData.pillarPosition.push(pillarForRemainingSeatsInRow);
                    }
                  } 
                  selectedWorkstationData = [
                    ...selectedWorkstationData,
                    workStationSelectedData
                ];
                }
              };
              blankOutTheRemainingWorkStation = (wSNotToSelect) => {
                if (wSNotToSelect.workStationId) {
                  let workStationId = wSNotToSelect.workStationId;
                  // let requiredNoOfSeats = wSNotToSelect.seatesToBeSelectedInWorkstation;
                  let workStationData = {
                    ...layoutData.workstations.find(
                      (workStation) => workStationId == workStation._id
                    ),
                  };
                  let rowComplete = false;
                  let subWorkStationStarted = false;
                  let subWorkStationData;
                  let requiredNoOfSeats = workStationData.AvailableNoOfSeats;
                  for (let i = 1; i <= requiredNoOfSeats; i++) {
                    // If row is completed
                    if (rowComplete === true) {
                      workStationData.selectedAreaXAxis +=
                        workStationData.sizeOfSeat.width;
                      workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                      rowComplete = false;
                    }
                    // Checking for Pillar and drawing
                    workStationData.pillarPosition.forEach((pillar) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          pillar.startingXPosition - 1 &&
                        workStationData.selectedAreaXAxis <
                          pillar.startingXPosition + 1 &&
                        workStationData.selectedAreaYAxis >
                          pillar.startingYPosition - 1 &&
                        workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                      ) {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ]
                          )
                          .fillOpacity(1)
                          .fillAndStroke("white");
                        workStationData.selectedAreaYAxis += pillar.pillarHeight;
                      }
                    });
                    // checking for partition and drawing
                    workStationData.partition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPosition + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis + gap.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.height,
                            ]
                          )
                          .fillOpacity(1)
                          .fillAndStroke("white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.width;
                      }
                    });
                    // checking for gap between workstation and drawing it
                    workStationData.gapPosition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPositon - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPositon + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.pillarWidth,
                              workStationData.selectedAreaYAxis + gap.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.pillarHeight,
                            ]
                          )
                          .fillOpacity(1)
                          .fillAndStroke("white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.pillarWidth;
                      }
                    });
                    // checking for partition and drawing
                    workStationData.partition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPosition + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis + gap.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.height,
                            ]
                          )
                          .fillOpacity(1)
                          .fillAndStroke("white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.width;
                      }
                    });
                    // checking for pillar and drawing;
                    workStationData.pillarPosition.forEach((pillar) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          pillar.startingXPosition - 1 &&
                        workStationData.selectedAreaXAxis <
                          pillar.startingXPosition + 1 &&
                        workStationData.selectedAreaYAxis >
                          pillar.startingYPosition - 1 &&
                        workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                      ) {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ]
                          )
                          .fillOpacity(1)
                          .fillAndStroke("white");
                        workStationData.selectedAreaYAxis += pillar.pillarHeight;
                      }
                    });
                    // checking if sub-Workstation started or not
                    workStationData.subWorkStationArea.forEach((subWorkStation) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          subWorkStation.startingXAxis - 1 &&
                        workStationData.selectedAreaXAxis <
                          subWorkStation.startingXAxis + 1
                      ) {
                        subWorkStationStarted = true;
                        subWorkStationData = { ...subWorkStation };
                      }
                    });
                    // checking if row is completed till now or not;
                    if (
                      workStationData.selectedAreaYAxis > workStationData.lastYAxis - 1 &&
                      workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                    ) {
                      rowComplete = true;
                    }
                    // restricting the selection of seat if sub-WorkStation started
                    if (subWorkStationStarted === false) {
                      // if row completed before selecting the seat then it should not count the current selection
                      if (rowComplete === true) {
                        i--;
                      }
                      // if row is not completed till now then it should select seat
                      else {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis +
                                workStationData.sizeOfSeat.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis +
                                workStationData.sizeOfSeat.width,
                              workStationData.selectedAreaYAxis +
                                workStationData.sizeOfSeat.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis +
                                workStationData.sizeOfSeat.height,
                            ]
                          )
                          .fillOpacity(1)
                          .lineWidth(0.2)
                          .fillAndStroke("white");
                        workStationData.selectedAreaYAxis +=
                          workStationData.sizeOfSeat.height;
                      }
                    }
                    // checking if row is completed after selection of seat
                    if (
                      workStationData.selectedAreaYAxis > workStationData.lastYAxis - 1 &&
                      workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                    ) {
                      rowComplete = true;
                    }
                    // if Sub-Workstation started
                    if (subWorkStationStarted === true) {
                      let subrowComplete;
                      let subWorkStationLastCheck = false;
                      for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                        // if row completed in Sub-Workstation
                        if (subrowComplete === true) {
                          subWorkStationData.selectedAreaXAxis +=
                            subWorkStationData.sizeOfSeat.width;
                          subWorkStationData.selectedAreaYAxis =
                            subWorkStationData.startingYAxis;
                          subrowComplete = false;
                        }
                        // checking for pillar in current Sub-Workstation
                        subWorkStationData.pillarPosition.forEach((pillar) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              pillar.startingXPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              pillar.startingXPosition + 1 &&
                            subWorkStationData.selectedAreaYAxis >
                              pillar.startingYPosition - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              pillar.startingYPosition + 1
                          ) {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ]
                              )
                              .fillOpacity(1)
                              .fillAndStroke("white");
                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                          }
                        });
                        // checking for partition in current Sub-Workstation
                        subWorkStationData.partition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              gap.startingPosition + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ]
                              )
                              .fillOpacity(1)
                              .fillAndStroke("white");
                            rowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.width;
                          }
                        });
                        // checking for gap in current Sub-Workstation
                        subWorkStationData.gapPosition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPositon - 1 &&
                            subWorkStationData.selectedAreaXAxis < gap.startingPositon + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis + gap.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.pillarHeight,
                                ]
                              )
                              .fillOpacity(1)
                              .fillAndStroke("white");
                            rowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.pillarWidth;
                          }
                        });
                        // checking for partition in current Sub-Workstation
                        subWorkStationData.partition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              gap.startingPosition + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ]
                              )
                              .fillOpacity(1)
                              .fillAndStroke("white");
                            subrowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.width;
                          }
                        });
                        // checking for pillar in current Sub-Workstation
                        subWorkStationData.pillarPosition.forEach((pillar) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              pillar.startingXPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              pillar.startingXPosition + 1 &&
                            subWorkStationData.selectedAreaYAxis >
                              pillar.startingYPosition - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              pillar.startingYPosition + 1
                          ) {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ]
                              )
                              .fillOpacity(1)
                              .fillAndStroke("white");
                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                          }
                        });
                        // checking if row is completed in Sub-Workstation or not;
                        if (
                          subWorkStationData.selectedAreaYAxis >
                            subWorkStationData.lastYAxis - 1 &&
                          subWorkStationData.selectedAreaYAxis <
                            subWorkStationData.lastYAxis + 1
                        ) {
                          subrowComplete = true;
                        }
                        // if row completed in Sub-Workstation till now then skip the current count of seat selection
                        if (subWorkStationLastCheck === false) {
                          if (subrowComplete === true) {
                            j--;
                            i--;
                          } else {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    subWorkStationData.sizeOfSeat.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    subWorkStationData.sizeOfSeat.width,
                                  subWorkStationData.selectedAreaYAxis +
                                    subWorkStationData.sizeOfSeat.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    subWorkStationData.sizeOfSeat.height,
                                ]
                              )
                              .fillOpacity(1)
                              .lineWidth(0.2)
                              .fillAndStroke("white");
                          }
                        }
                        subWorkStationData.selectedAreaYAxis +=
                          subWorkStationData.sizeOfSeat.height;
                        // check if row is completed in after selecting seat
                        if (
                          subWorkStationData.selectedAreaYAxis >
                            subWorkStationData.lastYAxis - 1 &&
                          subWorkStationData.selectedAreaYAxis <
                            subWorkStationData.lastYAxis + 1
                        ) {
                          subrowComplete = true;
                        }
                        // check if required no of seate is selected or the available no of seat in current Sub-Workstation are all selected.
                        if (
                          i === Number(requiredNoOfSeats) ||
                          j === Number(subWorkStationData.AvailableNoOfSeats)
                        ) {
                          // rowComplete = true;
                          if (subWorkStationLastCheck === false) {
                            i--;
                            j--;
                            subWorkStationLastCheck = true;
                          } else {
                            workStationData.selectedAreaXAxis =
                              subWorkStationData.startingXAxisOpposite;
                            subWorkStationLastCheck = false;
                            break;
                          }
                        }
                        i++;
                      }
                      subWorkStationStarted = false;
                    }
                  }
                }
              };
              blankOutTheSeats = (wSNotToSelect) => {
                let b = 0;
                if (wSNotToSelect.workStationId) {
                  let workStationId = wSNotToSelect.workStationId;
                  let gotNoOfSeatsToSKip = wSNotToSelect.seatesToBeSelectedInWorkstation;
                  let workStationData = {
                    ...layoutData.workstations.find(
                      (workStation) => workStationId === workStation._id
                    ),
                  };
                  let rowComplete = false;
                  let subWorkStationStarted = false;
                  let subWorkStationData;
                  let requiredNoOfSeats = workStationData.AvailableNoOfSeats;
          
                  // starting the default selection of seat from left side.
          
                  for (let i = 1; i <= requiredNoOfSeats; i++) {
                    // If row is completed
                    if (rowComplete === true) {
                      workStationData.selectedAreaXAxis +=
                        workStationData.sizeOfSeat.width;
                      workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                      rowComplete = false;
                    }
                    // Checking for Pillar and drawing
                    workStationData.pillarPosition.forEach((pillar) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          pillar.startingXPosition - 1 &&
                        workStationData.selectedAreaXAxis <
                          pillar.startingXPosition + 1 &&
                        workStationData.selectedAreaYAxis >
                          pillar.startingYPosition - 1 &&
                        workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                      ) {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                        workStationData.selectedAreaYAxis += pillar.pillarHeight;
                      }
                    });
                    // checking for partition and drawing
                    workStationData.partition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPosition + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis + gap.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.height,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .fill(i <= gotNoOfSeatsToSKip ? "red" : "white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.width;
                      }
                    });
                    // checking for gap between workstation and drawing it
                    workStationData.gapPosition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPositon - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPositon + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.pillarWidth,
                              workStationData.selectedAreaYAxis + gap.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.pillarHeight,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.pillarWidth;
                      }
                    });
                    // checking for partition and drawing
                    workStationData.partition.forEach((gap) => {
                      if (
                        workStationData.selectedAreaXAxis > gap.startingPosition - 1 &&
                        workStationData.selectedAreaXAxis < gap.startingPosition + 1
                      ) {
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + gap.width,
                              workStationData.selectedAreaYAxis + gap.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + gap.height,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .lineWidth(0)
                          .fill(i <= gotNoOfSeatsToSKip ? "red" : "white");
                        rowComplete = false;
                        workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                        workStationData.selectedAreaXAxis += gap.width;
                      }
                    });
                    // checking for pillar and drawing;
                    workStationData.pillarPosition.forEach((pillar) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          pillar.startingXPosition - 1 &&
                        workStationData.selectedAreaXAxis <
                          pillar.startingXPosition + 1 &&
                        workStationData.selectedAreaYAxis >
                          pillar.startingYPosition - 1 &&
                        workStationData.selectedAreaYAxis < pillar.startingYPosition + 1
                      ) {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis + pillar.pillarWidth,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis + pillar.pillarHeight,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                        workStationData.selectedAreaYAxis += pillar.pillarHeight;
                      }
                    });
                    // checking if sub-Workstation started or not
                    workStationData.subWorkStationArea.forEach((subWorkStation) => {
                      if (
                        workStationData.selectedAreaXAxis >
                          subWorkStation.startingXAxis - 1 &&
                        workStationData.selectedAreaXAxis <
                          subWorkStation.startingXAxis + 1
                      ) {
                        subWorkStationStarted = true;
                        subWorkStationData = { ...subWorkStation };
                      }
                    });
                    // checking if row is completed till now or not;
                    if (
                      workStationData.selectedAreaYAxis > workStationData.lastYAxis - 1 &&
                      workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                    ) {
                      rowComplete = true;
                    }
                    // restricting the selection of seat if sub-WorkStation started
                    if (subWorkStationStarted === false) {
                      // if row completed before selecting the seat then it should not count the current selection
                      if (rowComplete === true) {
                        i--;
                      }
                      // if row is not completed till now then it should select seat
                      else {
                        doc
                          .polygon(
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis +
                                workStationData.sizeOfSeat.width,
                              workStationData.selectedAreaYAxis,
                            ],
                            [
                              workStationData.selectedAreaXAxis +
                                workStationData.sizeOfSeat.width,
                              workStationData.selectedAreaYAxis +
                                workStationData.sizeOfSeat.height,
                            ],
                            [
                              workStationData.selectedAreaXAxis,
                              workStationData.selectedAreaYAxis +
                                workStationData.sizeOfSeat.height,
                            ]
                          )
                          .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                          .lineWidth(0)
                          .fillAndStroke(i <= gotNoOfSeatsToSKip ? "blue" : "white");
                        workStationData.selectedAreaYAxis +=
                          workStationData.sizeOfSeat.height;
                      }
                    }
                    // checking if row is completed after selection of seat
                    if (
                      workStationData.selectedAreaYAxis > workStationData.lastYAxis - 1 &&
                      workStationData.selectedAreaYAxis < workStationData.lastYAxis + 1
                    ) {
                      rowComplete = true;
                    }
                    // if Sub-Workstation started
                    if (subWorkStationStarted === true) {
                      let subrowComplete;
                      let subWorkStationLastCheck = false;
                      for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                        // if row completed in Sub-Workstation
                        if (subrowComplete === true) {
                          subWorkStationData.selectedAreaXAxis +=
                            subWorkStationData.sizeOfSeat.width;
                          subWorkStationData.selectedAreaYAxis =
                            subWorkStationData.startingYAxis;
                          subrowComplete = false;
                        }
                        // checking for pillar in current Sub-Workstation
                        subWorkStationData.pillarPosition.forEach((pillar) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              pillar.startingXPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              pillar.startingXPosition + 1 &&
                            subWorkStationData.selectedAreaYAxis >
                              pillar.startingYPosition - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              pillar.startingYPosition + 1
                          ) {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                          }
                        });
                        // checking for partition in current Sub-Workstation
                        subWorkStationData.partition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              gap.startingPosition + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "red" : "white");
                            rowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.width;
                          }
                        });
                        // checking for gap in current Sub-Workstation
                        subWorkStationData.gapPosition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPositon - 1 &&
                            subWorkStationData.selectedAreaXAxis < gap.startingPositon + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis + gap.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.pillarHeight,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                            rowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.pillarWidth;
                          }
                        });
                        // checking for partition in current Sub-Workstation
                        subWorkStationData.partition.forEach((gap) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              gap.startingPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              gap.startingPosition + 1
                          ) {
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis + gap.width,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis + gap.height,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "red" : "white");
                            subrowComplete = false;
                            subWorkStationData.selectedAreaYAxis =
                              subWorkStationData.startingYAxis;
                            subWorkStationData.selectedAreaXAxis += gap.width;
                          }
                        });
                        // checking for pillar in current Sub-Workstation
                        subWorkStationData.pillarPosition.forEach((pillar) => {
                          if (
                            subWorkStationData.selectedAreaXAxis >
                              pillar.startingXPosition - 1 &&
                            subWorkStationData.selectedAreaXAxis <
                              pillar.startingXPosition + 1 &&
                            subWorkStationData.selectedAreaYAxis >
                              pillar.startingYPosition - 1 &&
                            subWorkStationData.selectedAreaYAxis <
                              pillar.startingYPosition + 1
                          ) {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    pillar.pillarWidth,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    pillar.pillarHeight,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "green" : "white");
                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                          }
                        });
                        // checking if row is completed in Sub-Workstation or not;
                        if (
                          subWorkStationData.selectedAreaYAxis >
                            subWorkStationData.lastYAxis - 1 &&
                          subWorkStationData.selectedAreaYAxis <
                            subWorkStationData.lastYAxis + 1
                        ) {
                          subrowComplete = true;
                        }
                        // if row completed in Sub-Workstation till now then skip the current count of seat selection
                        if (subWorkStationLastCheck === false) {
                          if (subrowComplete === true) {
                            j--;
                            i--;
                          } else {
                            doc
                              .polygon(
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    subWorkStationData.sizeOfSeat.width,
                                  subWorkStationData.selectedAreaYAxis,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis +
                                    subWorkStationData.sizeOfSeat.width,
                                  subWorkStationData.selectedAreaYAxis +
                                    subWorkStationData.sizeOfSeat.height,
                                ],
                                [
                                  subWorkStationData.selectedAreaXAxis,
                                  subWorkStationData.selectedAreaYAxis +
                                    subWorkStationData.sizeOfSeat.height,
                                ]
                              )
                              .fillOpacity(i <= gotNoOfSeatsToSKip ? 0.01 : 1)
                              .fill(i <= gotNoOfSeatsToSKip ? "red" : "white");
                          }
                        }
                        subWorkStationData.selectedAreaYAxis +=
                          subWorkStationData.sizeOfSeat.height;
                        // check if row is completed in after selecting seat
                        if (
                          subWorkStationData.selectedAreaYAxis >
                            subWorkStationData.lastYAxis - 1 &&
                          subWorkStationData.selectedAreaYAxis <
                            subWorkStationData.lastYAxis + 1
                        ) {
                          subrowComplete = true;
                        }
                        b++;
          
                        if (b == gotNoOfSeatsToSKip) {
                          // console.log(b, "Seat Selection Complete");
                        }
                        // check if required no of seate is selected or the available no of seat in current Sub-Workstation are all selected.
                        if (
                          i === Number(requiredNoOfSeats) ||
                          j === Number(subWorkStationData.AvailableNoOfSeats)
                        ) {
                          // console.log(i,"Sdasd",requiredNoOfSeats,"asdasd",j)
          
                          // rowComplete = true;
                          if (subWorkStationLastCheck === false) {
                            i--;
                            j--;
                            subWorkStationLastCheck = true;
                          } else {
                            workStationData.selectedAreaXAxis =
                              subWorkStationData.startingXAxisOpposite;
                            subWorkStationLastCheck = false;
                            break;
                          }
                        }
          
                        i++;
                      }
                      subWorkStationStarted = false;
                    }
                  }
                }
              };
              seatsSelectedWhite=(layouts)=>{
          
                // console.log("<><><><><><<><>")
                // console.log(color)
                const layoutDraw = layouts
                let layoutData=layoutDraw.toObject()
                let color = 'white'
                    // const doc = new PDFDocument({ size: [800, 566], margin: 0 });
                    // doc.pipe(res);
                    // const imagePath = path.join(__dirname, '..', '..', '..', filePath);
                    // console.log("Image path:", imagePath);
                    // doc.image(imagePath, { height: 566, align: 'center', valign: 'center' });
            
                    let requiredNoOfSeats = layoutData.AvailableNoOfSeats;
                    let workStationData = layoutData
                    let rowComplete = false;
                    let subWorkStationStarted = false;
                    let subWorkStationData;
          
                    // If it is defined to start the selection of seat from right then only it will only select from right otherwise from left side
               
                    // starting the default selection of seat from left side.
                   
                        for (let i = 1; i <= requiredNoOfSeats; i++) {
                            // If row is completed
                            if (rowComplete === true) {
                                workStationData.selectedAreaXAxis += workStationData.sizeOfSeat.width;
                                workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                rowComplete = false;
                            }
                            // Checking for Pillar and drawing
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                    (workStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0).fill(color);
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(1).fill(color);
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.width;
                                }
                            });
                            // checking for gap between workstation and drawing it
                            workStationData.gapPosition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPositon - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPositon + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.pillarWidth, workStationData.selectedAreaYAxis + gap.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.pillarHeight]
                                    ).fillOpacity(1).fill(color);
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.pillarWidth;
                                }
                            });
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(1).fill(color);
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.width;
                                }
                            });
                            // checking for pillar and drawing;
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                    (workStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0).fill(color);
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking if sub-Workstation started or not
                            workStationData.subWorkStationArea.forEach((subWorkStation) => {
          
                                if ((workStationData.selectedAreaXAxis > (subWorkStation.startingXAxis - 1)) && (workStationData.selectedAreaXAxis < (subWorkStation.startingXAxis + 1))) {
                                    subWorkStationStarted = true;
                                    subWorkStationData = { ...subWorkStation };
                                }
                            })
                            // checking if row is completed till now or not;
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // restricting the selection of seat if sub-WorkStation started
                            if (subWorkStationStarted === false) {
                                // if row completed before selecting the seat then it should not count the current selection
                                if (rowComplete === true) {
                                    i--;
                                }
                                // if row is not completed till now then it should select seat
                                else {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height]
                                    ).fillOpacity(1).lineWidth(0.2).fill(color);
                                    workStationData.selectedAreaYAxis += workStationData.sizeOfSeat.height;
                                }
                            }
                            // checking if row is completed after selection of seat
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // if Sub-Workstation started
                            if (subWorkStationStarted === true) {
                                let subrowComplete;
                                let subWorkStationLastCheck = false;
                                for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                                    // if row completed in Sub-Workstation
                                    if (subrowComplete === true) {
                                        subWorkStationData.selectedAreaXAxis += subWorkStationData.sizeOfSeat.width;
                                        subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                        subrowComplete = false;
                                    }
                                    // checking for pillar in current Sub-Workstation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                            (subWorkStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(1).fill(color);
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    })
                                    // checking for partition in current Sub-Workstation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(1).fill(color);
                                            rowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.width;
                                        }
                                    });
                                    // checking for gap in current Sub-Workstation
                                    subWorkStationData.gapPosition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPositon - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPositon + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.pillarWidth, subWorkStationData.selectedAreaYAxis + gap.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.pillarHeight]
                                            ).fillOpacity(1).fill(color);
                                            rowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.pillarWidth;
                                        }
                                    });
                                    // checking for partition in current Sub-Workstation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(1).fill(color);
                                            subrowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.width;
                                        }
                                    });
                                    // checking for pillar in current Sub-Workstation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                            (subWorkStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(1).fill(color);
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    })
                                    // checking if row is completed in Sub-Workstation or not;
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // if row completed in Sub-Workstation till now then skip the current count of seat selection
                                    if (subWorkStationLastCheck === false) {
                                        if (subrowComplete === true) {
                                            j--;
                                            i--;
                                        }
                                        else {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height]
                                            ).fillOpacity(1).lineWidth(0.2).fill(color);
                                        }
                                    }
                                    subWorkStationData.selectedAreaYAxis += subWorkStationData.sizeOfSeat.height;
                                    // check if row is completed in after selecting seat
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // check if required no of seate is selected or the available no of seat in current Sub-Workstation are all selected.
                                    if ((i === Number(requiredNoOfSeats)) || (j === Number(subWorkStationData.AvailableNoOfSeats))) {
          
                                        // rowComplete = true;
                                        if (subWorkStationLastCheck === false) {
                                            i--;
                                            j--;
                                            subWorkStationLastCheck = true;
                                        }
                                        else {
                                            workStationData.selectedAreaXAxis = subWorkStationData.startingXAxisOpposite;
                                            subWorkStationLastCheck = false;
                                            break;
                                        }
                                    }
                                    i++;
                                }
                                subWorkStationStarted = false;
                            }
                        
            }
               
  
            }
            allData.forEach((element)=>{
              console.log("<<<<======>>>>>--------------\n",element.workstationLocked,"\n<<<<======>>>>>")
              if(element.workstationLocked===true){
                seatsSelectedWhite(element)
              }
             
            })
              workStationToBeSelectedIn.forEach((element) => {
                markSeatsOnLayout(element);
                blankOutTheSeats(element);
                let addProposalInLocation ={
                  proposalId:proposal._id,
                  seatSelected:proposal.totalNumberOfSeats,
                  workStationId:element.workStationId,
                  locked:false,
                }
                Location.updateOne(
                  { location: proposal.location, center: proposal.center, floor: proposal.floor },
                  { $addToSet: { proposals: { $each: [addProposalInLocation] } } }
                ).then((result) => {
                  if (result.acknowledged === true) {
                    if (result.modifiedCount > 0) {
                      result.message = 'Added Successfully';
                    } else {
                      result.message = 'Data already exists';
                    }
                  } else {
                    throw new Error('Problem while updating');
                  }
                });
              });
              workStationNotToBeSelected.forEach((element) => {
                blankOutTheRemainingWorkStation(element);
              });

            doc.addPage();
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
            doc.rect(240, 520, 540, 30).fillAndStroke('#999999', 'black').fillColor('black').text(`INR ${new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(proposal.finalOfferAmmount)}  + taxes per month`, 240, 530, { width: 540, align: 'center' });
            doc.addPage();
            //image add of selected content
            if(proposal.cubicalCount>0){
                doc.image('./assets/proposal/image/cubical.jpg', 0, 0, { width: 800, height: 566 });
            doc.addPage();
            }
            
            

            if(proposal.workstation2x1>0){
                doc.image('./assets/proposal/image/workstation2x1.jpg', 0, 0, { width: 800, height: 566 });
            doc.addPage();
            }
            
            

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
            
            

            if(proposal.workstation5x2_5>0){
              doc.text("In Development");
            doc.addPage();
            }
            
            

            if(proposal.workstation4x4>0){
                doc.text("In Development");
            doc.addPage();
            }
            
            

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
            
            

            if(proposal.cabinMedium>0){
                doc.image('./assets/proposal/image/md_cabin.jpg', 0, 0, { width: 800, height: 566 });
            doc.addPage();
            }
            
            

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

            if(proposal.nicheSeat2Pax>0){
                doc.image('./assets/proposal/image/niche_seating.jpg', 0, 0, { width: 800, height: 566 });
            doc.addPage();
            }
            if(proposal.nicheSeat4Pax>0){
                doc.image('./assets/proposal/image/niche_seating_2.jpg', 0, 0, { width: 800, height: 566 });
            doc.addPage();
            }
            
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

            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///  let selectedWorkstationData = []; save to Database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            selectedWorkstationData.forEach((element) => {
                delete element._id;
            })

            if(proposal.status === 'Completed and approved'){
                res.status(200).send({
                    "Message": 'Proposal Generated Successfully'
                });
            }
            else{
              // console.log('SELECTED_WORKSTATIONdATA_LENGTH =>',selectedWorkstationData.length);
                    selectionData.insertMany(selectedWorkstationData).then((result) => {
                      // console.log(result);
                    let selectedWorkstationDataIds = [];
                    result.forEach((element) => selectedWorkstationDataIds.push(element._id));
                    Proposal.updateOne({ _id: Id }, { $set: { status: 'Completed But not Esclated', selectFrom: selectFrom, selectionData: selectedWorkstationDataIds } }).then((updateResult) => {
                    if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                        LogController.proposal.update(proposal._id, { logMessage: 'Proposal Generated', proposalGenerated: 'yes' })
                        res.status(200).send({
                            "Message": 'Proposal Generated Successfully',
                            "data":selectedWorkstationDataIds
                        });
                        req.salesPersonEmail = proposal.salesPerson.userName;
                        next();
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong';
                    if (!err.status) err.status = 500;
                    return next(err);
                })
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