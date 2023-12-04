const proposalController = require('../../controllers/proposal/main.proposal.controller');
const middleware = require('../../middlewares/main.middlewares');

const proposalRoute = require('express').Router();

proposalRoute.get('/init/:Id',middleware.authentication, proposalController.create.init);

proposalRoute.post('/addClientInfo/:Id',middleware.authentication, proposalController.create.addClientInfo);

proposalRoute.post('/addRequirement/:Id',middleware.authentication,proposalController.create.checkRequiredNoOfSeats, proposalController.create.addProposalRequirement);

proposalRoute.post('/update');

proposalRoute.post('/delete');

proposalRoute.get('/getAll',middleware.authentication, proposalController.getAll);

proposalRoute.get('/getById');

proposalRoute.get('/layout/:Id', proposalController.layout);

proposalRoute.post('/generate/:Id/?:selectFrom',middleware.authentication, proposalController.generate.generateProposal, proposalController.generate.generateProposalPDF, proposalController.generate.sendProposalByEmail);

// proposalRoute.post('/send-otp/:Id',middleware.authentication, proposalController.sendOtp);

// proposalRoute.post('/verify-otp/:Id', middleware.authentication, proposalController.verifyOtp);

proposalRoute.get('/checkSeatAvailabilityAndConsolidatedSeats/:Id', proposalController.checkSeatAvailabilityAndConsolidatedSeats);

proposalRoute.get('/resolveConflict/:Id', middleware.authentication, proposalController.resolveConflict);

proposalRoute.get('/finalOfferAmmount/:Id', middleware.authentication, proposalController.finalOfferAmmount);

proposalRoute.post('/esclateToClosure/:Id', middleware.authentication,middleware.authentication, proposalController.updateFinalOfferAmmount);

proposalRoute.get('/getProposalById/:Id', middleware.authentication,proposalController.getProposalById);

proposalRoute.post('/approveProposal/:Id', middleware.authentication,proposalController.approveProposal, proposalController.generate.generateProposalPDF);

proposalRoute.post('/lockProposal/:Id', middleware.authentication,proposalController.lockProposal);

proposalRoute.post('/updateProposalId/:Id',proposalController.updateProposalId);

proposalRoute.post('/saveImage/:Id', middleware.authentication,proposalController.sendImage);

proposalRoute.get('/getAllLockedProposal', middleware.authentication,proposalController.getLockedProposal);

proposalRoute.post('/addOldProposal', middleware.authentication,proposalController.addOldClientProposals);

proposalRoute.delete('/delete/:Id',middleware.authentication,proposalController.deleteProposal)

proposalRoute.get('/getLayoutDataOfSameLocation/:Id',proposalController.getLayoutDataByLocationId);

proposalRoute.post('/declineProposal/:Id',middleware.authentication,proposalController.declineProposal)
module.exports = proposalRoute;