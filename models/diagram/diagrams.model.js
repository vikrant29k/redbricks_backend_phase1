const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diagramSchema = new Schema({
diagramName: { 
    type: String,
    required: true 
},
 data:{type:Array}
}, {
    timestamps: true
});

const Diagram = mongoose.model('Diagram', diagramSchema);

module.exports = Diagram;