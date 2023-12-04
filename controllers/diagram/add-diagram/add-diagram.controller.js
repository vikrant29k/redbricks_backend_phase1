const Diagram = require('../../../models/diagram/diagrams.model');

// Create a new record with layoutBorder data
const saveDiagram = async (req, res, next) => {
    try {
        // Assuming your request body contains the diagram data and name
        const { diagramName, data } = req.body;

        // Check if a diagram with the same name already exists
        const existingDiagram = await Diagram.findOne({ diagramName });

        if (existingDiagram) {
            // Send a response indicating that a diagram with the same name already exists
            return res.status(400).json({ message: 'Diagram with the same name already exists' });
        }

        // Create a new diagram record
        const newDiagram = new Diagram({
            diagramName: diagramName, // Set the name of the diagram
            data: data, // Set the diagram data
        });

        // Save the diagram record to the database
        const savedDiagram = await newDiagram.save();

        res.status(201).json(savedDiagram); // Respond with the saved diagram record
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = saveDiagram;
