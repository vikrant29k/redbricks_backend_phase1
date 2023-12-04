
const Proposal = require("../../../models/proposal/proposal.model");
const fs = require('fs');
const path = require('path'); // Import the path module

const sendImageData = async (req, res, next) => {
  try {
    const proposalId = req.params.Id;
    const data = req.body;
    const drawnSeats = data.drawnSeats;
    const seatSize = data.seatSize;
    const imageData = data.image; // This is the image data in data URL format

    // Define the file path where the image will be saved
    const fileName = `${proposalId}.png`; // Define the file name based on proposalId
    const filePath = path.join(__dirname, '../../../assets/proposal/proposalImage', fileName); // Build the full file path

    // Decode the data URL and save it as a file
    const base64Data = imageData.replace(/^data:image\/png;base64,/, ''); // Adjust the MIME type as needed
    fs.writeFileSync(filePath, base64Data, 'base64');

    const proposal = await Proposal.findByIdAndUpdate(
      proposalId,
      {
        $set: { seatsData: drawnSeats, seatSize: seatSize, imagePath: filePath }
      }
    );

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found.' });
    }

    return res.status(200).json({ message: 'Image file saved successfully.' });
  } catch (error) {
    console.error('Error saving image file:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = sendImageData;
