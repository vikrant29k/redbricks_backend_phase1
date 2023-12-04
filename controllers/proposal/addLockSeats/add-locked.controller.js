// code that works perfectly to select the seats linearly...

const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const { default: mongoose } = require('mongoose');

const addLockedSeats = (req, res, next) => {
    let Id = req.params.Id;
    let selectFrom = req.params.selectFrom;
   
    // let location;
    // let requiredNoOfSeats;
    
    Proposal.findById(Id).then((proposal) => {

        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            throw error;
        }
        
        let location = proposal.center;
        let requiredNoOfSeats = proposal.totalNumberOfSeats;
        let workStationId;
        // let jsonPath = path.join()
        let jsonFileData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}_${proposal.floor}.json`))
        JsonData.findOne({layout:jsonFileData.layout}).then(layouDataFromjson=>{
          // console.log("=================")
          // console.log(layouDataFromjson)
          // console.log("=================")
          let workStationSelectedDataToAdd = {
            subWorkStationArea: [],
          };
        // let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}_${proposal.floor}.json`))
        let layoutData=layouDataFromjson.toObject()
        let workStationToBeSelectedIn = [];
        let workStationNotToBeSelected = [];
        let selectedWorkstationData = [];
        let workStationData
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
            const doc = new PDFDocument({ size: [800, 566], margin: 0 });
            doc.pipe(res);
            doc.image(path.join(__dirname, '..', '..', '..', 'assets', 'layout', 'image', `${proposal.location}_${proposal.center}_${proposal.floor}.png`), { height: 566, align: 'center', valign: 'center' });
            
            markSeatsOnLayout = (workstationToSelect) => {
              if (workstationToSelect.workStationId) {
                let workStationId = workstationToSelect.workStationId;
                let requiredNoOfSeats = workstationToSelect.seatesToBeSelectedInWorkstation;
                
                 workStationData = {...layoutData.workstations.find(
                    (workStation) => workStationId === workStation._id
                  ),
                };
                // console.log("=================",workStationData)
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

              workStationSelectedDataToAdd.subWorkStationArea.forEach((element, index) => {
                if (element?.automaticSubWorkstation === true) {
                  workStationData.subWorkStationArea.splice(index, 0, element);
                } else {
                  workStationData.subWorkStationArea[index] = {
                    ...workStationData.subWorkStationArea[index],
                    ...element,
                  };
                }
                // console.log(
                //   "///////////////////////////////////////////////////////////////////////////////////////////////\n",
                //   element
                // );
              });
              // console.log(
              //   "===================================Before delete=============================================\n",
              //   workStationSelectedDataToAdd.subWorkStationArea
              // );
      
              // delete workStationSelectedDataToAdd.subWorkStationArea;
      
              // workStationData = { ...workStationData, ...workStationSelectedDataToAdd }; we were pushing the same element again, so no need of it!!
              
              // console.log(
              //   "=======================================After delete====================================================\n",
              //   workStationSelectedDataToAdd.subWorkStationArea
              // );
      
              // workStationSelectedDataToAdd = {
              //   subWorkStationArea: [],
              // };
               
                // starting the default selection of seat from left side.
       
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
                      let selectedSubWorkStationData = {};
                      let automaticGeneratedSubWorkStation = {};
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
                            if (subWorkStationData.startingXAxisOpposite >subWorkStationData.selectedAreaXAxis) {
                              automaticGeneratedSubWorkStation = {
                                ...subWorkStationData,
                                startingXAxis:subWorkStationData.selectedAreaXAxis,
                                selectedAreaYAxis:subWorkStationData.selectedAreaYAxis -subWorkStationData.sizeOfSeat.height,
                                selectedAreaXAxis: subWorkStationData.selectedAreaXAxis,
                                automaticSubWorkstation: true,
                                AvailableNoOfSeats:subWorkStationData.AvailableNoOfSeats - j,
                              };
                              if (subWorkStationData?.automaticSubWorkstation === true)
                              automaticGeneratedSubWorkStation.startingXAxis =subWorkStationData.startingXAxis + 1;
                            subWorkStationData.selectedAreaXAxisOpposite =automaticGeneratedSubWorkStation.startingXAxis;
                            subWorkStationData.startingXAxisOpposite =automaticGeneratedSubWorkStation.startingXAxis;
                           
                          }
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
                      selectedSubWorkStationData = {
                        selectedAreaXAxis: subWorkStationData.selectedAreaXAxis,
                        selectedAreaYAxis: subWorkStationData.selectedAreaYAxis,
                        selectedAreaXAxisOpposite:subWorkStationData.startingXAxisOpposite,
                        AvailableNoOfSeats:subWorkStationData.AvailableNoOfSeats
                      };
                      // workStationSelectedDataToAdd.subWorkStationArea.push(
                      //   selectedSubWorkStationData
                      // );
                      if (Object.keys(automaticGeneratedSubWorkStation).length > 0) {
                        workStationSelectedDataToAdd.subWorkStationArea.push(
                          automaticGeneratedSubWorkStation
                        );
                      }        
                    } 
                    
                    workStationSelectedData.totalNoOfSeats = i;
                    workStationSelectedData.AvailableNoOfSeats = i; 
                  }
                  workStationSelectedDataToAdd = {
                    ...workStationSelectedDataToAdd,
                    _id: workStationId,
                    selectedAreaXAxis: workStationData.selectedAreaXAxis,
                    selectedAreaYAxis: workStationData.selectedAreaYAxis,
                    AvailableNoOfSeats:
                      workStationData.AvailableNoOfSeats - requiredNoOfSeats,
                  };
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
                  selectedWorkstationData = [
                    ...selectedWorkstationData,
                    workStationSelectedData
                ];
               
                } 

                workStationSelectedDataToAdd.subWorkStationArea.forEach((element, index) => {
                  if (element?.automaticSubWorkstation === true) {
                    workStationData.subWorkStationArea.splice(index, 0, element);
                  } else {
                    workStationData.subWorkStationArea[index] = {
                      ...workStationData.subWorkStationArea[index],
                      ...element,
                    };
                  }
                });





                console.log('======================================================================\n=====================================================')
              // console.log('WORKSTATION_SELECTED_DATA ==> ', selectedWorkstationData[0].subWorkStationArea);
              // console.log('======================================================================\n=====================================================')
              // console.log('WORKSTATION_DATA_TO_ADD ==> ', workStationSelectedDataToAdd.subWorkStationArea);
              // console.log('======================================================================\n=====================================================')
              // console.log("==========================\nWORKSTATIONDATATOADD => \n",workStationData.subWorkStationArea,"\n==========================")
              
               let selectionDataId = proposal.selectionData.toString();
                // console.log('>>>>>>>>>>>>>>>>>>>>>>\n',selectionDataId,'<<<<<<<<<<<')
              JsonData.findOneAndUpdate(
                {
                    layout: layoutData.layout,
                    
                },
               
                {
                    $set: {
                        'AvailableNoOfSeats':layoutData.AvailableNoOfSeats -  workstationToSelect.seatesToBeSelectedInWorkstation,
                        'workstations.$[workstation].AvailableNoOfSeats': workStationData.AvailableNoOfSeats -  workstationToSelect.seatesToBeSelectedInWorkstation,
                        'workstations.$[workstation].selectedAreaXAxis': workStationData.selectedAreaXAxis,
                        'workstations.$[workstation].selectedAreaYAxis': workStationData.selectedAreaYAxis,
                        // 'workstations.$[workstation].subWorkStationArea.$[subWorkstation].selectedAreaYAxis': workStationData.subWorkStationArea[0].selectedAreaYAxis,
                        // 'workstations.$[workstation].subWorkStationArea.$[subWorkstation].selectedAreaXAxis': workStationData.subWorkStationArea[0].selectedAreaXAxis,
                        // 'workstations.$[workstation].subWorkStationArea.$[subWorkstation].AvailableNoOfSeats': workStationData.subWorkStationArea[0].AvailableNoOfSeats,
                        'workstations.$[workstation].subWorkStationArea': workStationData.subWorkStationArea

                    },
                    
                      $push:{'selectedSeatsData':proposal.selectionData},
                    
                },
                
                
                {
                    arrayFilters: [
                        {
                            'workstation._id': workStationData._id
                        },
                        {
                            'subWorkstation._id':  workStationData.subWorkStationArea._id
                        }
                  ],
                  new: true
                }
            ).then((result) => {
                // if (result.nModified === 0) {
                //   console.log(`No matching document found for workstation with _id: ${workStationId}`);
                // } else {
                //   console.log(`Update Successful for workstation with _id: ${result._id} Also in subworkstation ${result.subWorkStationArea[0].sub_id}`);
                // }
              // console.log('SUBWORKSTATION_AREA', result.workstations[0].subWorkStationArea[0].sub_id)
              }).catch((err) => {

                console.error('Error while updating jsonData:', err);
              });

            
            };
            // console.log("WORKSTATION_SELECTED_DATA => ", workStationSelectedDataToAdd);
           
              workStationToBeSelectedIn.forEach((element) => {
                markSeatsOnLayout(element);
                // blankOutTheSeats(element);
              });
            
            doc.end();
           
        }
        catch (err) {
            if (!err.status) err.status = 500;
            if (!err.message) err.message = 'Server Error';
            throw err;
        }
      })
    }).catch((err) => {
        if (!err.message) err.message = 'Error while Generating proposal';
        next(err);
    })
}

module.exports = addLockedSeats;