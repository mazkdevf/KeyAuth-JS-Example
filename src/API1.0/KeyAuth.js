//* Importing UUID Generator *//
const uuid = require('uuid').v4

//* Importing Hashing / Ciphers from "crypto" *//
const { createHash, createCipheriv, createDecipheriv } = require('crypto')

//* Importing ExecSync from "child_process" *//
const { execSync } = require('child_process')

//* Importing Axios *//
const axios = require('axios')

//* Importing OS *//
const os = require('os')

//* Import FS *//
const fs = require("fs")

//* KeyAuth Class *//
class KeyAuth {
  /**
     * @param {string} [name] - The name of the application
     * @param {string} [ownerId] - The ownerId of the application
     * @param {string} [secret] - The secret of the application
     * @param {string} [version] - The version of the application
    **/
  constructor(name, ownerId, secret, version) {
    if (!(name && ownerId && secret && version)) {
      Misc.error('Application not setup correctly.')
    }

    this.name = name
    this.ownerId = ownerId
    this.secret = secret
    this.version = version
    this.responseTime = null
  };

  /**
     * Initializes the connection with KeyAuth in order to use any of the functions
    **/
  Initialize = () => new Promise(async (resolve) => {
    this.EncKey = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')
    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('init').toString('hex'),
      ver: Encryption.encrypt(this.version, this.secret, init_iv),
      hash: this.hash_to_check,
      enckey: Encryption.encrypt(this.EncKey, this.secret, init_iv),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.secret, init_iv)
   

    if (response === 'KeyAuth_Invalid') {
      Misc.error('Invalid Application, please check your application details.')
    }

    const Json = JSON.parse(response)

    await this.Load_Response_Struct(Json)
    if (!Json.success || Json.success == false) {
      return resolve(false)
    }

    this.app_data = Json.appinfo

    this.sessionid = Json.sessionid
    this.initialized = true

    resolve(true)
  })

  /**
     * Registers the user using a license and gives the user a subscription that matches their license level
     * @param {string} [username] - The username for the user
     * @param {string} [password] - The password for the user
     * @param {string} [license] - The License Key for the sub
    **/
  register = (user, password, license, email = "") => new Promise(async (resolve) => {
    this.check_initialize()

    let hwId
    if (!hwId) {
      hwId = Misc.GetCurrentHardwareId()
    }

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('register').toString('hex'),
      username: Encryption.encrypt(user, this.EncKey, init_iv),
      pass: Encryption.encrypt(password, this.EncKey, init_iv),
      email: Encryption.encrypt(email, this.EncKey, init_iv),
      key: Encryption.encrypt(license, this.EncKey, init_iv),
      hwid: Encryption.encrypt(hwId, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success) {
      this.Load_User_Data(Json.info)
      return resolve(Json.message)
    } else {
      Misc.error(Json.message)
    }
  })

  forgot = (username, email) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('forgot').toString('hex'),
      username: Encryption.encrypt(username, this.EncKey, init_iv),
      email: Encryption.encrypt(email, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    resolve(Json?.success ? true : false)
  })

  /**
     * Authenticates the user using their username and password
     * @param {string} [username] - The username for the user
     * @param {string} [password] - The password for the user
    **/
  login = (username, password) => new Promise(async (resolve) => {
    this.check_initialize()

    let hwId
    if (!hwId) {
      hwId = Misc.GetCurrentHardwareId()
    }

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('login').toString('hex'),
      username: Encryption.encrypt(username, this.EncKey, init_iv),
      pass: Encryption.encrypt(password, this.EncKey, init_iv),
      hwid: Encryption.encrypt(hwId, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      this.Load_User_Data(Json.info)
      return resolve(Json)
    } else {
      Misc.error(Json.message)
    }

    resolve(Json.data)
  })

  /**
     * Authenticate without using usernames and passwords
     * @param {string} [key] - Licence used to login with
    **/
  license = (key) => new Promise(async (resolve) => {
    this.check_initialize()

    let hwId
    if (!hwId) {
      hwId = Misc.GetCurrentHardwareId()
    }

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('license').toString('hex'),
      key: Encryption.encrypt(key, this.EncKey, init_iv),
      hwid: Encryption.encrypt(hwId, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      this.Load_User_Data(Json.info)
      resolve(true)
    } else {
      Misc.error(Json.message)
    }
  })

  /**
     * Gives the user a subscription that has the same level as the key
     * @param {string} [username] - Username of the user thats going to get upgraded
     * @param {string} [license] - License with the same level as the subscription you want to give the user
    **/
  upgrade = (username, license) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('upgrade').toString('hex'),
      username: Encryption.encrypt(username, this.EncKey, init_iv),
      key: Encryption.encrypt(license, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (!Json.success || Json.success == false) {
      return resolve(Json.message)
    } else {
      // Don't let them yet for dashboard
      Misc.error(Json.message)
    }
  })

  /**
     * Gets an existing global variable
     * @param {string} [VarId] - Name of the variable / Variable ID
     * returns {string} - The value of the variable / The content of the variable
    **/
  var = (VarId) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('var').toString('hex'),
      varid: Encryption.encrypt(VarId, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json)
    }

    resolve(Json.message)
  })

  /**
     * Gets the an existing user variable
     * @Param {string} [VarId] - User Variable Name
     * returns {string} - The value of the variable / The content of the user variable
    **/
  GetVar = (VarId) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('getvar').toString('hex'),
      var: Encryption.encrypt(VarId, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json)
    }

    resolve(Json.message)
  })

  /**
     * Change the data of an existing user variable, *User must be logged in*
     * @Param {string} [VarId] - User variable name
     * @Param {string} [VarData] - The content of the variable
    **/
  SetVar = (VarId, VarData) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('setvar').toString('hex'),
      var: Encryption.encrypt(VarId, this.EncKey, init_iv),
      data: Encryption.encrypt(VarData, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json)
    }

    resolve(Json.message)
  })

  /**
     * Bans the current logged in user
    **/
  ban = () => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('ban').toString('hex'),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(true)
    }

    resolve(Json.message)
  })

  /**
     * KeyAuth acts as proxy and downlods the file in a secure way
     * @Param {string} [fileId] - File ID
     * returns {byte} - Returns The bytes of the download file
    **/
  file = (fileId, path = null, execute = false) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('file').toString('hex'),
      fileid: Encryption.encrypt(fileId.toString(), this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      if (path != null) {
        var bytes = await this.strToByteArray(Json.contents);
        fs.writeFile(path, bytes, async (err) => {
          if (err) throw err;

          if (execute) {
            var exec = require('child_process').exec;
            await exec(path, function (error, stdout, stderr) {
              if (error) {
                console.error(error);
                return;
              }
            });

            return resolve(true);
          } else {
            return resolve(true);
          }
        });
      } else {
        return resolve(this.strToByteArray(Json.contents))
      }
    }

    resolve(Json.message)
  })

  /**
     * Sends a request to a webhook that you've added in the dashboard in a safe way without it being showed for example a http debugger
     * @Param {string} [webId] - Webhook ID
     * @Param {string} [Params] - Webhook Parameters
     * @Param {string} [message] - Body of the request, empty by default
     * @Param {string} [username] - Content type, empty by default
     * Returns {string} - Returns the response of the webhook
    **/
  webhook = (webId, Params, body = '', contType = '') => new Promise(async (resolve) => { // havent tested
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('webhook').toString('hex'),
      webid: Encryption.encrypt(webId, this.EncKey, init_iv),
      params: Encryption.encrypt(Params, this.EncKey, init_iv),
      body: Encryption.encrypt(body, this.EncKey, init_iv),
      conttype: Encryption.encrypt(contType, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json)
    }

    resolve(Json.message)
  })

  /**
     * Check if the current session is validated or not
     * Returns {string} - Returns if the session is valid or not
    **/
  check = () => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('check').toString('hex'),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json)
    }

    resolve(Json.message)
  })

  /**
     * Checks if the current IP Address/HardwareId is blacklisted
     * returns {boolean} - Returns true if the IP Address/HardwareId is blacklisted, otherwise false
    **/
  checkBlack = () => new Promise(async (resolve) => {
    this.check_initialize()

    const hwid = Misc.GetCurrentHardwareId()
    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('checkblacklist').toString('hex'),
      hwid: Encryption.encrypt(hwid, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(true)
    }

    resolve(false)
  })

  /**
     * Fetch usernames of online users
     * Returns {array} - Returns an array of usernames
    **/
  fetchOnline = () => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('fetchOnline').toString('hex'),
      hwid: Encryption.encrypt(hwid, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(Json.users)
    } else {
      return resolve(Json.message)
    }
  })

  /**
     * Gets the last 20 sent messages of that channel
     * @param {string} [ChannelName] - The name of the channel, where you want the messages
     * Returns {array} the last 20 sent messages of that channel
    **/
  ChatGet = (ChannelName) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('fetchOnline').toString('hex'),
      channel: Encryption.encrypt(ChannelName, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      if (Json.messages[0].message == 'not_found') {
        return resolve([])
      } else {
        return resolve(Json.messages)
      }
    } else {
      return resolve([])
    }
  })

  /**
     * Sends a message to the given channel name
     * @param {string} [ChannelName] - Channel Name where the message will be sent to
     * @param {string} [Message] - Message what will be sent to [ChannelName]
     * Returns {bool} - Returns true if the message was sent, otherwise false
    **/
  ChatSend = (ChannelName, Message) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('fetchOnline').toString('hex'),
      message: Encryption.encrypt(Message, this.EncKey, init_iv),
      channel: Encryption.encrypt(ChannelName, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    let response = await this.make_request(post_data)
    response = Encryption.decrypt(response, this.EncKey, init_iv)

    const Json = JSON.parse(response)

    this.Load_Response_Struct(Json)
    if (Json.success && Json.success == true) {
      return resolve(true)
    } else {
      return resolve(false)
    }
  })

  /**
     * Logs the IP address,PC Name with a message, if a discord webhook is set up in the app settings, the log will get sent there and the dashboard if not set up it will only be in the dashboard
     * @param {string} [message] - Message / Discord Embed Title Message
     * Returns None
    **/
  log = (message) => new Promise(async (resolve) => {
    this.check_initialize()

    const init_iv = createHash('sha256').update(uuid().substring(0, 8)).digest('hex')

    const post_data = {
      type: Buffer.from('log').toString('hex'),
      pcuser: Encryption.encrypt(os.userInfo().username, this.EncKey, init_iv),
      message: Encryption.encrypt(message, this.EncKey, init_iv),
      sessionid: Buffer.from(this.sessionid).toString('hex'),
      name: Buffer.from(this.name).toString('hex'),
      ownerid: Buffer.from(this.ownerId).toString('hex'),
      init_iv
    }

    await this.make_request(post_data)
    resolve(true)
  })

  strToByteArray = (hex) => new Promise(async (resolve) => {
    try {
      const numberChars = hex.length;
      const bytes = new Uint8Array(numberChars / 2);
      for (let i = 0; i < numberChars; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      resolve(bytes)
    } catch (err) {
      console.error('The session has ended, open program again.');
      process.exit(0);
    }
  })

  /**
     * Check if the current session is initialized
     * @returns [true] if client is Initialized.
    **/
  check_initialize() {
    if (!this.initialized) {
      Misc.error('You must initialize the API before using it!')
    }
    return true
  };

  /**
     * Load the response struct for Response of Request
    **/
  Load_Response_Struct(data) {
    this.response = {
      success: data.success,
      message: data.message
    }
  }

  /**
     * Load the response struct for User Data
    **/
  Load_User_Data(data) {
    this.user_data = {
      username: data.username,
      ip: data.ip,
      hwid: data.hwid,
      createdate: data.createdate,
      lastlogin: data.lastlogin,
      subscriptions: data.subscriptions
    }
  }

  /**
     * Change Console Application Title
     * @param {string} [title] - Your new Title for the App
     * Returns Promise Timeout
    **/
  setTitle(title) {
    process.stdout.write(
      String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
    )
  }

  /**
     * Sleeping / Timeout Function
     * @param {number} [ms] - Time in milliseconds
     * Returns Promise Timeout
    **/
  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  /**
   * Request the API with the POST Data
   * @param {string} [data] - Post Data Array
   * Returns {array} - Returns the API Response [ENCRYPTED]
  **/
  make_request(data) {
    const startTime = Date.now(); // Start the stopwatch

    return new Promise(async (resolve) => {
      const request = await axios({
        method: 'POST',
        url: 'https://keyauth.win/api/1.0/',
        data: new URLSearchParams(data).toString()
      }).catch((err) => {
        Misc.error(err)
      })

      const endTime = Date.now(); // Stop the stopwatch

      this.responseTime = `${endTime - startTime} ms`;

      if (request && request.data) {
        resolve(request.data)
      } else {
        resolve(null)
      };
    })
  }
}

class Encryption {
  /**
     * Encrypts a string with a key and iv
     * @param {string} [message] - String to encrypt
     * @param {string} [enc_key] - Key to encrypt with
     * @param {string} [iv] - IV to encrypt with
     * Returns {string} - Returns the encrypted string
    **/
  static encrypt(message, enc_key, iv) {
    try {
      const _key = createHash('sha256').update(enc_key).digest('hex').substring(0, 32)

      const _iv = createHash('sha256').update(iv).digest('hex').substring(0, 16)

      return this.encrypt_string(message, _key, _iv)
    } catch (err) {
      Misc.error('Invalid Application Information. Long text is secret short text is ownerid. Name is supposed to be app name not username')
    }
  };

  static encrypt_string(plain_text, key, iv) {
    const Cipher = createCipheriv('aes-256-cbc', key, iv)
    let Crypto_Cipher = Cipher.update(plain_text, 'utf-8', 'hex')
    Crypto_Cipher += Cipher.final('hex')
    return Crypto_Cipher
  };

  /**
     * Decrypts a string with a key and iv
     * @param {string} [message] - String to decrypt
     * @param {string} [enc_key] - Key to decrypt with
     * @param {string} [iv] - IV to decrypt with
     * Returns {string} - Returns the decrypted string
    **/
  static decrypt(message, key, iv) {
    try {
      const _key = createHash('sha256').update(key).digest('hex').substring(0, 32)

      const _iv = createHash('sha256').update(iv).digest('hex').substring(0, 16)

      return this.decrypt_string(message, _key, _iv)
    } catch (err) {
      Misc.error('Invalid Application Information. Long text is secret short text is ownerid. Name is supposed to be app name not username')
    }
  };

  static decrypt_string(cipher_text, key, iv) {
    const Decrypt_Cipher = createDecipheriv('aes-256-cbc', key, iv)
    let Decrypted = Decrypt_Cipher.update(cipher_text, 'hex', 'utf-8')
    Decrypted += Decrypt_Cipher.final('utf-8')
    return Decrypted
  }
}

class Misc {
  /**
     * Get the current user HardwareId
     * @returns {string} - Returns user HardwareID
    **/
  static GetCurrentHardwareId() {
    if (os.platform() != 'win32') return false

    const cmd = execSync('wmic useraccount where name="%username%" get sid').toString('utf-8')

    const system_id = cmd.split('\n')[1].trim()
    return system_id
  };

  /**
     * Error Print Function
     * @param {string} [message] - Message to Show and then exit app.
    **/
  static error(message) {
    console.log(message)
    return process.exit(0)
  }
}

/**
 * Export KeyAuth Class to be used in other files
**/
module.exports = KeyAuth
