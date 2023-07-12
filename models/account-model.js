const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_firstname, account_lastname, account_email FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching id found")
  }
}

/* *****************************
*   Update account
* *************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id){
  try {
      const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
      const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
      return data.rows[0]
  } catch (error) {
    console.error("Update Error")
  }
}

/* *****************************
*   Update account Password
* *************************** */
async function updateAccountPassword(account_password, account_id){
  try {
      const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
      const data = await pool.query(sql, [account_password, account_id])
      return data.rows[0]
  } catch (error) {
    console.error("Update Error")
  }
}

/* *****************************
*   Add new message
* *************************** */
async function newMessage(message_to, message_subject, message_body, message_from){
  try {
      const sql = "INSERT INTO message (message_subject, message_body, message_to, message_from) VALUES ($1, $2, $3, $4) RETURNING *"
      return await pool.query(sql, [message_subject, message_body, message_to, message_from])
  } catch (error) {
      return error.message
  }
}

/* *****************************
* Return messages not read using messages_to
* ***************************** */
async function getUnreadMessages(message_to) {
  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_from, message_read, message_archived FROM message WHERE message_to = $1 AND message_read = false',
      [message_to])
    return result.rows
  } catch (error) {
    return new Error("No message found")
  }
}

/* *****************************
* Return messageusing messages_id
* ***************************** */
async function getMessage (message_id) {
  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_from, message_read, message_archived FROM message WHERE message_id = $1',
      [message_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No message found")
  }
}
/* *****************************
*   Update message as read
* *************************** */
async function updateMessageRead(message_id){
  try {
      const sql = "UPDATE public.message SET message_read = true WHERE message_id = $1 RETURNING *"
      const data = await pool.query(sql, [message_id])
      return data.rows[0]
  } catch (error) {
    console.error("Update Error")
  }
}
/* *****************************
*   Update message as archived
* *************************** */
async function updateMessageArchive(message_id){
  try {
      const sql = "UPDATE public.message SET message_archived = true WHERE message_id = $1 RETURNING *"
      const data = await pool.query(sql, [message_id])
      return data.rows[0]
  } catch (error) {
    console.error("Update Error")
  }
}
/* *****************************
*   Delete message
* *************************** */
async function deleteMessage(message_id){
  try {
      const sql = "DELETE FROM public.message WHERE message_id = $1"
      await pool.query(sql, [message_id])
  } catch (error) {
    console.error("Error Deleting Message")
  }
}
/* *****************************
* Return archived messages using messages_to
* ***************************** */
async function getArchivedMessages (message_to) {
  try {
    const result = await pool.query(
      'SELECT m.*, a.account_firstname AS message_from_firstname, a.account_lastname AS message_from_lastname FROM public.message m LEFT JOIN public.account a ON m.message_from = a.account_id WHERE m.message_to IN ($1) AND m.message_archived = true',
      [message_to])
    return result.rows
  } catch (error) {
    return new Error("No message found")
  }
}

/* *****************************
* Return messages and sender name using messages_to
* ***************************** */
async function getMessagesAndName(message_to) {
  try {
    const result = await pool.query(
      'SELECT m.*, a.account_firstname AS message_from_firstname, a.account_lastname AS message_from_lastname FROM public.message m LEFT JOIN public.account a ON m.message_from = a.account_id WHERE m.message_to IN ($1) AND m.message_archived = false',
      [message_to])
    return result.rows
  } catch (error) {
    return new Error("No matching email found")
  }
}

module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updateAccountPassword, 
  newMessage, getUnreadMessages, getArchivedMessages, getMessagesAndName, getMessage, updateMessageRead, updateMessageArchive,
  deleteMessage}