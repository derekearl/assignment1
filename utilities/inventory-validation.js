const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

//Set the classification rules
validate.classificationRules = () => {
    return [
        //classification_name is required and must be only letters
        body("classification_name")
        .trim()
        .isAlpha()
        .withMessage('Please provide a valid classification name')
    ]
}

//Set the inventory Rules
validate.inventoryRules = () => {
  return [
      //inv_make is required and must be only letters or spaces
      body("inv_make")
      .trim()
      .isAlpha('en-US',{ ignore: ' ' })
      .withMessage('Please provide a valid make'),

      //inv_model is required and must be only letters or spaces
      body("inv_model")
      .trim()
      .isAlpha('en-US',{ ignore: ' ' })
      .withMessage('Please provide a valid model'),

      //inv_year is required and must be only numbers, add length = 4
      body("inv_year")
      .trim()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage('Please provide a valid year'),

      //inv_description is required
      body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a valid description'),

      //inv_image is required
      body("inv_image")
      .trim()
      .custom((inv_image) => {
        console.log(inv_image)
        if(inv_image!='/images/vehicles/no-image.png') {
          throw new Error('Please provide a valid image')
        } else {
          return true
        }
      }),

      //inv_thumbnail is required
      body("inv_thumbnail")
      .trim()
      .custom((inv_thumbnail) => {
        if(inv_thumbnail!='/images/vehicles/no-image-tn.png') {
          throw new Error('Please provide a valid thumbnail')
        } else {
          return true
        }
      }),

      //inv_price is required and must be only numbers
      body("inv_price")
      .trim()
      .isNumeric()
      .withMessage('Please provide a valid price'),

      //inv_miles is required and must be only numbers
      body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage('Please provide a valid miles'),

      //inv_color is required and must be only letters
      body("inv_color")
      .trim()
      .isAlpha()
      .withMessage('Please provide a valid color'),
  ]
}

//Check the new class data
validate.checkNewClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty())
    {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
          errors,
          title: "Add New Classification",
          nav,
          classification_name,
        })
        return
      }
      next()
}

//Check the new car data
validate.checkNewCarData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty())
  {
      let nav = await utilities.getNav()
      let dropDown = await utilities.getDropDown(classification_id)
      res.render("inventory/add-inventory", {
        errors,
        title: "Add New Inventory",
        nav,
        dropDown,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
      return
    }
    next()
}

//Check the updated car data
validate.checkUpdatedCarData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  const name = `${inv_make} ${inv_model}`
  if(!errors.isEmpty())
  {
      let nav = await utilities.getNav()
      let dropDown = await utilities.getDropDown(classification_id)
      res.render("inventory/edit-inventory", {
        errors,
        title: "Edit " + name,
        nav,
        dropDown,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
      return
    }
    next()
}

module.exports = validate