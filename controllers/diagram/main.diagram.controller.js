const saveDiagram = require('../diagram/add-diagram/add-diagram.controller');
const getDiagram = require('../diagram/get-diagram/getDiagram.controller')
const mainDiagramController = {
    saveDiagram:saveDiagram,
    getDiagram
}
module.exports =mainDiagramController;