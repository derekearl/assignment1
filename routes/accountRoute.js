// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

//Route to build account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
//Route to build the registration route
router.get("/register", utilities.handleErrors(accountController.buildRegister))
//Route for account management
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
//Route to logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))
//Route to update account
router.get("/update-account/:accId", utilities.checkLogin, utilities.handleErrors(accountController.buildEditAccount))
//Route to messages center
router.get('/messages/:accId', utilities.checkLogin, utilities.handleErrors(accountController.buildMessages))
//Route to new message
router.get('/send-message/:accId', utilities.checkLogin, utilities.handleErrors(accountController.buildNewMessage))
//Route to send registration info
router.post('/register', regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))
// Process the login attempt
router.post("/login", regValidate.loginRules(), regValidate.checkLogData, utilities.handleErrors(accountController.accountLogin))
//Route to send update info
router.post("/updateAccount", utilities.checkLogin, regValidate.updateAccountRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.accountUpdate))
//Route to send update info
router.post("/updatePassword", utilities.checkLogin, regValidate.updateAccountPasswordRules(), regValidate.checkUpdatePasswordData, utilities.handleErrors(accountController.accountPasswordUpdate))
//Route to send a new message
router.post('/send_message', utilities.checkLogin, regValidate.newMessageRules(), regValidate.checkNewMessageData, utilities.handleErrors(accountController.getNewMessage) )

module.exports = router;