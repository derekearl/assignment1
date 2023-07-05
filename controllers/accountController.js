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
    console.log(regResult)
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
      errors: null,
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
  console.log(accountData)
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
  res.render("./account/logged-in", {
    title: "Account Management",
    nav,
    errors: null,
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

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout, buildEditAccount, accountUpdate, accountPasswordUpdate }
