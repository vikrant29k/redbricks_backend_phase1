const diagramController = require('../../controllers/diagram/main.diagram.controller');

const diagramRoute = require('express').Router();

diagramRoute.post('/saveDiagram', diagramController.saveDiagram);
diagramRoute.get('/getDiagram/:diagramName',diagramController.getDiagram)
module.exports = diagramRoute;