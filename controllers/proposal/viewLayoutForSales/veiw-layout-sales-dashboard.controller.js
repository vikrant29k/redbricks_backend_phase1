
const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const selectionData = require('../../../models/selectionData/selectionData.modal');
const Location = require('../../../models/location/location.model');
let allData;
async function getAllSelectionData() {
  try {
    allData = await selectionData.find({});
  } catch (err) {
    console.error('Error retrieving data:', err);
  }
}

// Call the function to get and print all data from the collection
getAllSelectionData();

const viewLayoutSales = (req, res, next) => {
    let Id = req.params.Id;
    console.log("Hellooo")
    Location.findById(Id).then((proposal) => {

        if (!proposal) {
            let error = new Error('Invalid Location Id');
            throw error;
        }
        try {
            const doc = new PDFDocument({ size: [800, 566], margin: 0 });
            doc.pipe(res);
            doc.image(path.join(__dirname, '..', '..', '..', 'assets', 'layout', 'image', `${proposal.location}_${proposal.center}_${proposal.floor}.png`), { height: 566, align: 'center', valign: 'center' });
       
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
                                    ).fillOpacity(1).fill(color);
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
                                    ).fillOpacity(1).fill(color);
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
                                            ).fillOpacity(0).fill(color);
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
            doc.end();
        }
        catch (err) {
            if (!err.status) err.status = 500;
            if (!err.message) err.message = 'Server Error';
            throw err;
        }
      
    }).catch((err) => {
        if (!err.message) err.message = 'Error while Generating proposal';
        next(err);
    })
}

module.exports = viewLayoutSales;