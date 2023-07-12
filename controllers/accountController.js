const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   res.locals.accountData = accountData
   res.locals.loggedin = 1
   return res.redirect("/account/")
   } 
   throw new Error('Password is wrong')
  } catch (error) {
    req.flash('notice', 'Please check your password')
    res.redirect('/account/login')
   return error
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const messages = await accountModel.getUnreadMessages(res.locals.accountData.account_id)
  const count = messages.length
  res.render("./account/logged-in", {
    title: "Account Management",
    nav,
    errors: null,
    count: count,
  })
}

/* ****************************************
*  Log out
* *************************************** */
async function accountLogout(req, res, next) {
  let nav = await utilities.getNav()
  res.locals.loggedin = 0
  res.locals.accountData ={}
  res.clearCookie("jwt")
  req.flash("notice", "You have successfully logged out")
  res.redirect("/")
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildEditAccount(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.accId);
  const data = await accountModel.getAccountById(account_id)
  res.render("account/update-view", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: data.account_firstname,
    account_lastname: data.account_lastname,
    account_email: data.account_email,
    account_id: account_id
  })
}

/* ****************************************
*  Deliver messages view
* *************************************** */
async function buildMessages(req, res, next) {
  let nav = await utilities.getNav()
  const message_from = parseInt(req.params.accId);
  const messages = await accountModel.getMessagesAndName(message_from)
  console.log(messages)
  const archMessages = await accountModel.getArchivedMessages(message_from)
  console.log(archMessages)
  const count = archMessages.length
  res.render("account/messages", {
    title: `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname} Inbox`,
    nav,
    errors: null,
    message_from: message_from,
    count: count,
    messagesArray: messages
  })
}

/* ****************************************
*  Deliver archived messages view
* *************************************** */
async function buildArchivedMessages(req, res, next) {
  let nav = await utilities.getNav()
  const message_to = parseInt(req.params.accId);
  const archMessages = await accountModel.getArchivedMessages(message_to)
  console.log(archMessages)
  res.render("account/archived-messages", {
    title: `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname} Archives`,
    nav,
    errors: null,
    messagesArray: archMessages
  })
}
/* ****************************************
*  Deliver new message view
* *************************************** */
async function buildNewMessage(req, res, next) {
  let nav = await utilities.getNav()
  const message_from = res.locals.accountData.account_id
  res.render("account/send-message", {
    title: 'New Message',
    nav,
    errors: null,
    message_from: message_from
  })
}

/* ****************************************
*  Deliver reply message view
* *************************************** */
async function buildReplyMessage(req, res, next) {
  let nav = await utilities.getNav()
  const message_from = res.locals.accountData.account_id
  const message_id = parseInt(req.params.messId);
  const message = await accountModel.getMessage(message_id)
  res.render("account/reply-message", {
    title: `RE: ${message.message_subject}`,
    nav,
    errors: null,
    message_from: message_from,
    message_to: message.message_from,
    message_subject: `RE: ${message.message_subject}`,
    message_body: `\n\n // Previous Message //\n${message.message_body}`
  })
}
/* ****************************************
*  Deliver view message view
* *************************************** */
async function buildViewMessage(req, res, next) {
  let nav = await utilities.getNav()
  const message_id = parseInt(req.params.messId);
  const message = await accountModel.getMessage(message_id)
  res.render("account/view-message", {
    title: message.message_subject,
    nav,
    errors: null,
    message: message
  })
}
/* ****************************************
*  Mark message as read
* *************************************** */
async function messageRead(req, res, next) {
  const message_id = parseInt(req.params.messId);
  await accountModel.updateMessageRead(message_id);
  req.flash("notice", "You have successfully marked a message as read")
  res.redirect(`/account/messages/${res.locals.accountData.account_id}`)
}
/* ****************************************
*  Archive message
* *************************************** */
async function messageArchived(req, res, next) {
  const message_id = parseInt(req.params.messId);
  await accountModel.updateMessageArchive(message_id);
  req.flash("notice", "You have successfully archived a message")
  res.redirect(`/account/messages/${res.locals.accountData.account_id}`)
}
/* ****************************************
*  Delete message
* *************************************** */
async function messageDelete(req, res, next) {
  const message_id = parseInt(req.params.messId);
  await accountModel.deleteMessage(message_id);
  req.flash("notice", "You have successfully deleted a message")
  res.redirect(`/account/messages/${res.locals.accountData.account_id}`)
}
/* ****************************************
*  Send new message
* *************************************** */
async function getNewMessage(req, res) {
  let nav = await utilities.getNav()
  const { message_to, message_subject, message_body, message_from } = req.body

  const messageResult = await accountModel.newMessage(
    message_to,
    message_subject,
    message_body, 
    message_from
  )
  console.log('test2')
  if (messageResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve sent a new message.`
    )
    res.redirect(`/account/messages/${message_from}`)
  } else {
    req.flash("notice", "Sorry, the  message failed.")
    res.status(501).render(`/account/messages`, {
      title: `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname} Inbox`,
      nav,
      message_from: message_from
    })
  }
}

/* ****************************************
*  Update account info
* *************************************** */
async function accountUpdate(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body


  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email, account_id
  )

  if (updateResult) {
    let account_type = res.locals.accountData.account_type
    let accountData = { account_id: parseInt(account_id), account_firstname, account_lastname, account_email, account_type }
    res.clearCookie("jwt")
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    req.flash(
      "notice",
      `Congratulations, you\'ve updated your account ${account_firstname} ${account_lastname}.`
    )
    res.redirect('/account/')
  } else {
    req.flash("notice", "Sorry, the  update failed.")
    res.status(501).render("account/update-validation", {
      title: "Update Account",
      nav,
    })
  }
}

/* ****************************************
*  Update account password info
* *************************************** */
async function accountPasswordUpdate(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  console.log(account_id)
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
    res.status(500).render("account/update-validation", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }


  const updatePassowrdResult = await accountModel.updateAccountPassword(hashedPassword, account_id)

  if (updatePassowrdResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve updated your account password.`
    )
    res.redirect('/account/')
  } else {
    req.flash("notice", "Sorry, the  update failed.")
    res.status(501).render("account/update-validation", {
      title: "Update Account",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, 
  accountLogout, buildEditAccount, accountUpdate, accountPasswordUpdate, buildMessages, buildNewMessage, 
  getNewMessage, buildViewMessage , buildReplyMessage, messageRead, messageArchived, buildArchivedMessages, 
  messageDelete}