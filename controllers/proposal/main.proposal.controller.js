const create = require('./create/create.proposal.controller');
const getAll = require('./getAll/getAll.proposal.controller');
const sendLayout = require('./layout/sendDataOfLayout.controller')
const sendOtp = require('./send-otp/send-otp.controller');
const verifyOtp = require('./verify-otp/verify-otp.controller');
const generate = require('./generate-proposal/new-generate-proposal.controller');
const checkSeatAvailabilityAndConsolidatedSeats = require('./checkSeatAvailabilityAndConsolidatedSeats/checkSeatAvailabilityAndConsolidatedSeats.proposal.controller');
const resolveConflict = require('./resolveConflict/resolveConflict.proposal.controller');
const getFinalOfferAmmount = require('./getFinalOfferAmmount/getFinalOfferAmmount.proposal.controller');
const updateFinalOfferAmmount = require('./esclateToClosure/esclateToClosure.proposal.controller');
const approveProposal = require('./approveProposal/approveProposal.proposal.controller');
const getProposalById = require('./getProposalById/getProposalById.controller')
const lockProposal = require('./lockProposal/lockProposal.proposal.controller')
const updateProposalId = require('./updateProposalId/update-proposalID.controller');
const addLockSeat = require('./addLockSeats/add-locked.controller');
const sendImageData = require('./layout/saveImageData.proposal.controller');
const getAllLockedProposal = require('./getAllLockedProposal/get-locked-proposal.proposal.controller')
const getLayoutDataByLocationId = require('./sendDataOfLayoutsOfLockedProposal/getLayoutData-LockedProposal.proposal.controller')
const deleteProposal = require('./delete/delete.proposal.controller')
const addOldClientProposals = require('./addOldProposals/add-old-clients-proposal.proposal.controller');
const declineProposal= require('./decline Proposal/decline-proposal.proposal.controller')
const proposalController = {
    create: create,
    getAll: getAll,
    getProposalById:getProposalById,
    layout: sendLayout,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    generate: generate,
    checkSeatAvailabilityAndConsolidatedSeats,
    resolveConflict,
    finalOfferAmmount: getFinalOfferAmmount,
    updateFinalOfferAmmount,
    approveProposal,
    lockProposal,
    updateProposalId,
    addLockSeat:addLockSeat,
    sendImage:sendImageData,
    getLockedProposal:getAllLockedProposal,
    getLayoutDataByLocationId:getLayoutDataByLocationId,
    addOldClientProposals:addOldClientProposals,
    deleteProposal:deleteProposal,
    declineProposal:declineProposal
};

module.exports = proposalController;