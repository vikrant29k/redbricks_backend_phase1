const Diagram = require('../../../models/diagram/diagrams.model');

const getDiagram = async (req, res, next) => {
    try {
        const diagramName = req.params.diagramName;
        
        // Find the diagram by name
        const diagram = await Diagram.findOne({ diagramName }).select('diagramName data');
    
        if (!diagram) {
          return res.status(404).json({ message: 'Diagram not found' });
        }
    
        res.json(diagram);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

module.exports = getDiagram;
