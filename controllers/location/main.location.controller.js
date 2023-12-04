const getCentersInLocation = require("./centersInLocation/centersInLocation.loation.controller");
const createLocation = require("./create/create.location.controller");
const deleteLocationData = require("./delete/delete.location.controller");
const getAllLocation = require("./getAll/getAll.location.controller");
const getLocationById = require("./getById/getById.location.controller");
const getRent = require("./getRent/getRent.location.controller");
const getLocationList = require("./location-list/location-list.location.controller");
const updateLocationData = require("./update/update.location.controller");
const updateRackValue = require('./updateRackValue/updateRackValue.location.controller');
const getFloorsInCenter = require('./floorsInCenter/floorInCenters.location.controller')
const getImageById = require('./getImage/getImageById.location.controller');
const addLayoutData = require('./addLayouts/add-layout.location.controller');
const getBorderDataById = require("./getBorderData/getBorderData.location.controller");
const getCenterImages = require('./getCenterImages/getCenterImages.location.controller');
const deleteImage = require('./images/deleteImage.location.controller')

const locationController = {
    create: createLocation,
    addLayout:addLayoutData,
    getAll: getAllLocation,
    getById: getLocationById,
    getLoctionList: getLocationList,
    getCentesInLocation: getCentersInLocation,
    getFloorsInCenter:getFloorsInCenter,
    delete: deleteLocationData,
    update: updateLocationData,
    getRentSheet:getRent,
    updateRackValue,
    getImage:getImageById,
    getBorder:getBorderDataById,
    getCenterImages:getCenterImages,
    deleteImage:deleteImage
}

module.exports = locationController;