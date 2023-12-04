const mongoose = require('mongoose');

// Define the subWorkstationArea schema
const subWorkstationAreaSchema = new mongoose.Schema({
            sub_id:Number,
            totalNoOfSeats: Number,
            AvailableNoOfSeats: Number,
            sizeOfSeat: {
                width: Number,
                height: Number
            },
            startingXAxis: Number,
            startingYAxis: Number,
            lastYAxis: Number,
            selectedAreaXAxis: Number,
            selectedAreaYAxis: Number,
            selectedAreaXAxisOpposite: Number,
            startingXAxisOpposite: Number,
            automaticSubWorkstation: Boolean,
            partition: [
                {
                    startingPosition: Number,
                    startingPositionOpposite: Number,
                    width: Number,
                    height: Number
                }
            ],
            gapPosition: [
                {
                    pillar: Boolean,
                    startingPositon: Number,
                    startingPositonOpposite: Number,
                    pillarWidth: Number,
                    pillarHeight: Number
                }
            ],
            pillarPosition: [
                {
                    startingXPosition: Number,
                    startingXPositionOpposite: Number,
                    startingYPosition: Number,
                    pillarWidth: Number,
                    pillarHeight: Number
                }
            ]

});

// Define the workstation schema
const workstationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId, // Define _id as an ObjectId
    default: mongoose.Types.ObjectId // Provide a default function to generate new ObjectIds
  },
  AvailableNoOfSeats: Number,
  sizeOfSeat: {
    width: Number,
    height: Number
  },
  startingXAxis: Number,
  startingXAxisOpposite: Number,
  startingYAxis: Number,
  lastYAxis: Number,
  selectedAreaXAxis: Number,
  selectedAreaXAxisOpposite: Number,
  selectedAreaYAxis: Number,
  partition: [
    {
      startingPosition: Number,
      startingPositionOpposite: Number,
      width: Number,
      height: Number
  }
  ],
  gapPosition: [
    {
      pillar: Boolean,
      startingPositon: Number,
      startingPositonOpposite: Number,
      pillarWidth: Number,
      pillarHeight: Number
    }
  ],
  pillarPosition: [
    {
      startingXPosition: Number,
      startingXPositionOpposite: Number,
      startingYPosition: Number,
      pillarWidth: Number,
      pillarHeight: Number
    }
  ],
  subWorkStationArea: [subWorkstationAreaSchema]
});

// Define the main schema that contains the workstations array
const jsonDataSchema = new mongoose.Schema({
  layout: String,
  imageFile: {
    type: String,
    required: true
},
  AvailableNoOfSeats: Number,
  totalNoOfSeats: Number,
  workstations: [workstationSchema],
  selectedSeatsData:Array,
});

// Create the model
const JsonData = mongoose.model('JsonData', jsonDataSchema);


module.exports = JsonData;