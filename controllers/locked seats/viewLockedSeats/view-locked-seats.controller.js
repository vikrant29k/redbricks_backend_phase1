
const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const { default: mongoose } = require('mongoose');
const JsonData = require('../../../models/jsonData/jsonData.model');
const selectionData = require('../../../models/selectionData/selectionData.modal');

const getRandomColor=()=> {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const markSeatsOnLayoutAll=(jsondataId,filePath,doc,color)=>{
  return new Promise(async (resolve, reject) => {
    try{
      // console.log("<><><><><><<><>")
      // console.log(color)
      const layoutDraw = await selectionData.findById(mongoose.Types.ObjectId(jsondataId));
      let layoutData=layoutDraw.toObject()
    // console.log(layoutData)
          // const doc = new PDFDocument({ size: [800, 566], margin: 0 });
          // doc.pipe(res);
          const imagePath = path.join(__dirname, '..', '..', '..', filePath);
          // console.log("Image path:", imagePath);
          doc.image(imagePath, { height: 566, align: 'center', valign: 'center' });
  
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
                          ).fillOpacity(0.8).fill(color);
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
                          ).fillOpacity(0.8).fill(color);
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
                          ).fillOpacity(0.8).fill(color);
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
                          ).fillOpacity(0.8).lineWidth(0.2).fill(color);
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
                                  ).fillOpacity(0.8).fill(color);
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
                                  ).fillOpacity(0.8).fill(color);
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
                                  ).fillOpacity(0.8).fill(color);
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
                                  ).fillOpacity(0).fill(color);
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
                                  ).fillOpacity(0.8).lineWidth(0.2).fill(color);
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
     
  // console.log("layoutDraw",i++)
         
          // doc.end();
          resolve()
         
  } catch (error) {
    console.error("Error occurred during selectionData.findById:", error);
    reject(error);
  }
});


}

const generateLayout = async (req, res, next) => {
  let Id = req.params.Id;
// console.log("/<><><><><<>><>\<><><>",Id)
  try {
    const jsonData = await JsonData.findById(Id);
    const flattenedArray = jsonData.selectedSeatsData;
    
    const filePath = jsonData.imageFile;
    const doc = new PDFDocument({ size: [800, 566], margin: 0 });
    doc.pipe(res);
    for (const data of flattenedArray) {
      try {
        // console.log('DATA => ',data);
        let color = getRandomColor();
        // console.log('COLOR => ',color)
        for(let element of data){
            // console.log('ELEMENT => ',element);
            await markSeatsOnLayoutAll(element,filePath, doc,color);
        }
        // await data.forEach(async (element) => {
        // })
      } catch (error) {
        console.error("Error occurred during PDF generation:", error);
        res.status(500).json({ error: "An error occurred during PDF generation." });
        return; 
      }
    }
    // console.log("dgfhjkl;")
    doc.end();
    // console.log('END');
    // res.end();
  } catch (error) {
    console.error("Error occurred during JSON data retrieval:", error);
    res.status(500).json({ error: "An error occurred during JSON data retrieval." });
  }
};



module.exports = generateLayout;