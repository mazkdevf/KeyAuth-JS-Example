import axios from "axios"
import { stringify } from "querystring"
import systeminformation from "systeminformation"

var datastore = {
    name: null,
    ownerid: null,
    secret: null,
    version: null,
    sessionid: null
};

var msg = {
    message: null,
    author: null,
    timestamp: null
}

let intialized = false;

/// -------------> CHANGE THESE ON INDEX.JS NOT HERE <-------------
/// <param name="name">Application Name</param>
/// <param name="ownerid">Your OwnerID, can be found in your account settings.</param>
/// <param name="secret">Application Secret</param>
/// <param name="version">Application Version, if version doesnt match it will open the download link you set up in your application settings and close the app, if empty the app will close</param>
/// -------------> CHANGE THESE ON INDEX.JS NOT HERE <-------------

async function api(name, ownerid, secret, version) {
    
    if (!name || !ownerid || !secret || !version ) {
        error("Application not setup correctly.");
    }
    
    datastore.name = name;
    datastore.ownerid = ownerid;
    datastore.secret = secret;
    datastore.version = version;
}

/// <summary>
/// Initializes the connection with keyauth in order to use any of the functions
/// </summary>
async function init() {
    await checkvalues(); //makes sure that api values are filled.

    const values_to_upload = {
        'type': 'init',
        'name': datastore.name,
        'ownerid': datastore.ownerid,
        'ver': datastore.version
    }
    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
        error("Application not found")
    }

    if (response === "This program hash does not match, make sure you're using latest version") {
        error("Please Disable Program Hash, Thanks!")
    }

    var json = response;

    if (json.success) {
        await load_app_data(json.appinfo);
        datastore.sessionid = json.sessionid;
        intialized = true;
    } else if (json.message == "invalider") {
        app_data.downloadLink = json.download;
    }
}

//#region Response Strings

var response = {
    success: null,
    message: null
}


async function load_response_struct(data) {
    response.success = data.success;
    response.message = data.message;
}

//#endregion

/// <summary>
/// Authenticates the user using their username and password
/// </summary>
/// <param name="username">Username</param>
/// <param name="password">Password</param>

async function Login(username, password) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
        'type': 'login',
        'username': username,
        'pass': password,
        'hwid': hwid,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
        error("Application not found")
    }

    var json = response;
    load_response_struct(json);

    if (json.success) {
        load_user_data(json.info)
    }
}

/// <summary>
/// Registers the user using a license and gives the user a subscription that matches their license level
/// </summary>
/// <param name="username">Username</param>
/// <param name="password">Password</param>
/// <param name="key">License</param>

async function Register(username, password, key) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
        'type': 'register',
        'username': username,
        'pass': password,
        'key': key,
        'hwid': hwid,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
        error("Application not found")
    }

    var json = response;
    load_response_struct(json);
    if (json.success) {
        load_user_data(json.info)
    }
}


/// <summary>
/// Authenticate without using usernames and passwords
/// </summary>
/// <param name="key">Licence used to login with</param>

async function License(key) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
        'type': 'license',
        'key': key,
        'hwid': hwid,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
        error("Application not found")
    }

    var json = response;
    load_response_struct(json);
    if (json.success) {
        load_user_data(json.info)
    }
}

/// <summary>
/// Gives the user a subscription that has the same level as the key
/// </summary>
/// <param name="username">Username of the user thats going to get upgraded</param>
/// <param name="key">License with the same level as the subscription you want to give the user</param>

async function Upgrade(username, key) {
    checkvalues();

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
        'type': 'upgrade',
        'username': username,
        'key': key,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
        error("Application not found")
    }

    var json = response;

    json.success = false;
    load_response_struct(json);
}

async function check() {
    checkinit();
    const values_to_upload = {
        'type': 'check',
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json)
}

async function setvar(varname, data) {
    checkinit();

    const values_to_upload = {
        'type': 'setvar',
        'var': varname,
        'data': data,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);
}

async function getvar(varname) {
    checkinit();

    const values_to_upload = {
        'type': 'getvar',
        'var': varname,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);

    if (json.success) {
        return json.response;
    } else {
        return null;
    }
}

async function ban() {
    checkinit();

    const values_to_upload = {
        'type': 'ban',
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);
}

async function variable(varid) {
    checkinit();

    const values_to_upload = {
        'type': 'var',
        'varid': varid,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;

    load_response_struct(json);

    if (json.success) {
        return json.message;
    } else {
        return null;
    }
}

async function webhook(webid, param, body = "", conttype = "") {
    checkinit();

    const values_to_upload = {
        'type': 'webhook',
        'webid': webid,
        'params': param,
        'body': body,
        'conttype': conttype,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;

    load_response_struct(json);

    if (json.success) {
        return json.message;
    } else {
        return null;
    }
}

async function download(fileid) {
    checkinit();

    const values_to_upload = {
        'type': 'file',
        'fileid': fileid,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);


    if (json.success) {
        return str_to_byte_arr(json.contents);
    } else {
        return null;
    }

}

async function log(message) {
    checkinit();

    await getUSER();
    let pcuser = sys.username;

    const values_to_upload = {
        'type': 'log',
        'pcuser': pcuser,
        'message': message,
        'sessionid': datastore.sessionid,
        'name': datastore.name,
        'ownerid': datastore.ownerid,
    }

    const parameters = "?" + stringify(values_to_upload);

    await req(parameters);
}

//#region app_data

var app_data = {
    numUsers: null,
    numOnlineUsers: null,
    numKeys: null,
    version: null,
    customerPanelLInk: null,
    downloadLink: null
};

async function load_app_data(data) {
    app_data.numUsers = data.numUsers;
    app_data.numOnlineUsers = data.numOnlineUsers;
    app_data.numKeys = data.numKeys;
    app_data.version = data.version;
    app_data.customerPanelLInk = data.customerPanelLink;
}

//#endregion

//#region user_data

var user_data = {
    username: null,
    ip: null,
    hwid: null,
    createdate: null,
    lastlogin: null,
    subscriptions: null
}

async function load_user_data(data) {
    user_data.username = data.username;
    user_data.ip = data.ip;
    user_data.hwid = data.hwid;
    user_data.createdate = data.createdate;
    user_data.lastlogin = data.lastlogin;
    user_data.subscriptions = data.subscriptions;
}
//#endregion

//#region Functions
async function checkvalues() {
    if (!datastore.name || !datastore.ownerid || !datastore.secret || !datastore.version ) {
        error("Application not setup correctly.");
    }
}

async function error(message) {
    console.log(message);
    return process.exit(0);
}

async function checkinit() {
    if (!intialized) {
        error("Please initzalize first")
    }
}

let sys = {
    username: null,
    hwid: null,
}

async function getHWID() {
    //Credits to https://github.com/sebhildebrandt/systeminformation
    await systeminformation.blockDevices((data) => {
        sys.hwid = data[0].serial;
    })
}

async function getUSER() {
    //Credits to https://github.com/sebhildebrandt/systeminformation
    await systeminformation.users((data) => {
        sys.username = data[0].user
    })
}
//#endregion

export { api, app_data, user_data, init, Login, Register, License, Upgrade, log, webhook, getvar, setvar, ban, download, variable, check } //KEYAUTH API

async function req(post_data) {

    var returndata = null;

    await axios.get('https://keyauth.win/api/1.1/' + post_data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then((res) => {
        returndata = res.data;
    }).catch((err) => {
        console.error(err);
    });
    return returndata;
}

//#region ADDONS

function Title(title)
{
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
  );
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export { Title, Sleep, response, error } //CUSTOM STUFF
//#endregion
