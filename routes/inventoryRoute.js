// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/inventory-validation')
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build the car view
router.get("/detail/:carId", utilities.handleErrors(invController.buildByCarId));
// Route to build the management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildMangement));
// Route to build the add classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
// Route to build the add car view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddCar));
// Route to build the edit data view
router.get('/edit/:carId', utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));
// Route to return classification data as JSON
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))
// Route to build the delete data view
router.get('/delete/:carId', utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory));
// Route to add the new classification data
router.post("/add-classification", utilities.checkAccountType, regValidate.classificationRules(), regValidate.checkNewClassData, utilities.handleErrors(invController.addNewClass));
// Route to add the new car data
router.post("/add-inventory", utilities.checkAccountType, regValidate.inventoryRules(), regValidate.checkNewCarData, utilities.handleErrors(invController.addNewCar));
// Route to edit car data
router.post("/update/", utilities.checkAccountType, regValidate.inventoryRules(), regValidate.checkUpdatedCarData, utilities.handleErrors(invController.updateCar))
// Route to delete car data
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteCar))

module.exports = router;