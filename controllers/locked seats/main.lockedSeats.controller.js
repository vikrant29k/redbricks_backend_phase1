const viewSingleProposal = require('./viewSingleLockedProposal/view-proposal-layout.controller')
const viewLayout = require('./viewLockedSeats/view-locked-seats.controller')
const deleteProposal= require('./deleteLockedSeats/delete-locked-seats.controller')
const mainLayoutData = {
    viewSingleProposal:viewSingleProposal,
    viewLayout:viewLayout,
    delete:deleteProposal
}
module.exports = mainLayoutData