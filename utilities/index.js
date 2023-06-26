const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildInventoryInfo = async function(data) {
  car = data;
  return `<div class='carInfo'>
    <img class='carImg' src="${car.inv_image}" alt='${car.inv_year} ${car.inv_make} ${car.inv_model}'>
    <h4 class='carDetails'>${car.inv_make} ${car.inv_model} Details</h4>
    <div><h4 class='carPrice'>Price: $${new Intl.NumberFormat('en-US').format(car.inv_price)}</h4></div>
    <div><p class='carDesc'><span>Description:</span> ${car.inv_description}</p></div>
    <div><p class='carColor'><span>Color:</span> ${car.inv_color}</p></div>
    <div><p class='carMiles'><span>Miles:</span> ${new Intl.NumberFormat('en-US').format(car.inv_miles)}</p></div>
  </div>`
}

/* ************************
 * Constructs the drop down option
 ************************** */
Util.getDropDown = async function (optionSelected = null) {
  let data = await invModel.getClassifications()
  let list = '<select id="classification_id" name="classification_id">'
  data.rows.forEach((row) => {
    if(row.classification_id==optionSelected){
      list += `<option id="${row.classification_id}" value="${row.classification_id}" selected>${row.classification_name}</option>`
    } else {
      list += `<option id="${row.classification_id}" value="${row.classification_id}">${row.classification_name}</option>`
    }
  })
  list += "</select>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Decode token
 * ************************************ */
Util.decodeToken = (token) => {
  let base64Url = token.split('.')[1]
  let base64 = base64Url.replace('-','+').replace('_','/')
  return JSON.parse(atob(base64))
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin) {
    let token = req.cookies.jwt
    user = Util.decodeToken(token)
    if(user.account_type != 'Client') {
      next()
    } else {
      req.flash("notice", "You don't have clearance to view that page")
      return res.redirect("/")
    }
  } else {
    req.flash("notice", "You don't have clearance to view that page")
    return res.redirect("/")
  }
}

module.exports = Util