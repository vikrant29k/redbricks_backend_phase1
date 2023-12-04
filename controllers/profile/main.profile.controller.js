const getProfile = require('./get/get.profile.controller');
const updateUserProfile = require('./update/update.profile.controller');

const profileController = {
    get: getProfile,
    update: updateUserProfile
}

module.exports = profileController;