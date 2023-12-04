const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const selectionDataSchema = new Schema({
    workstationLocked:{
        type:Boolean,
        default:false
    },
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
    totalNoOfSeats: Number,
    AvailableNoOfSeats: Number,
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
    subWorkStationArea: [
        {   
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

        }
    ]
})

const selectionData = mongoose.model('selectionData', selectionDataSchema);

module.exports = selectionData; 