const axios = require("axios");
const { stringify } = require("querystring");
const systeminformation = require("systeminformation");

var datastore = {
  name: null,
  ownerid: null,
  secret: null,
  version: null,
  sessionid: null,
};

var msg = {
  message: null,
  author: null,
  timestamp: null,
};

let intialized = false;

var response = {
  success: null,
  message: null,
};

var app_data = {
  numUsers: null,
  numOnlineUsers: null,
  numKeys: null,
  version: null,
  customerPanelLInk: null,
  downloadLink: null,
};

var user_data = {
  username: null,
  ip: null,
  hwid: null,
  createdate: null,
  lastlogin: null,
  subscriptions: null,
};

let sys = {
  username: null,
  hwid: null,
};

async function error(message) {
  console.log("Error: " + message);
  return process.exit(0);
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection: ', error);
});

async function checkvalues() {
  if (
    !datastore.name ||
    !datastore.ownerid ||
    !datastore.secret ||
    !datastore.version
  ) {
    error("Application not setup correctly.");
  }
}

async function req(post_data) {
  var returndata = null;

  await axios
    .get("https://keyauth.win/api/1.1/" + post_data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => {
      returndata = res.data;
    })
    .catch((err) => {
      if (err.response.status == 429) {
        error("Rate Limited! - KeyAuth");
      } else if (err.response.status == 502) {
        error("502 Bad Gateway! - KeyAuth");
      } else {
        if (err.response.status == 200) {
        } else {
          error(`${err.response.status} ${err.response.statusText}! - KeyAuth`);
        }
      }
    });
  return returndata;
}

async function load_response_struct(data) {
  response.success = data.success;
  response.message = data.message;
}

async function load_app_data(data) {
  app_data.numUsers = data.numUsers;
  app_data.numOnlineUsers = data.numOnlineUsers;
  app_data.numKeys = data.numKeys;
  app_data.version = data.version;
  app_data.customerPanelLInk = data.customerPanelLink;
}

async function load_user_data(data) {
  user_data.username = data.username;
  user_data.ip = data.ip;
  user_data.hwid = data.hwid;
  user_data.createdate = data.createdate;
  user_data.lastlogin = data.lastlogin;
  user_data.subscriptions = data.subscriptions;
}

async function checkinit() {
  if (!intialized) {
    error("Please initzalize first");
  }
}

function Sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getHWID() {
  //Credits to https://github.com/sebhildebrandt/systeminformation
  await systeminformation.blockDevices((data) => {
    sys.hwid = data[0].serial;
  });
}

async function getUSER() {
  //Credits to https://github.com/sebhildebrandt/systeminformation
  await systeminformation.users((data) => {
    sys.username = data[0].user;
  });
}
/// -------------> CHANGE THESE ON INDEX.JS NOT HERE <-------------
/// <param name="name">Application Name</param>
/// <param name="ownerid">Your OwnerID, can be found in your account settings.</param>
/// <param name="secret">Application Secret</param>
/// <param name="version">Application Version, if version doesnt match it will open the download link you set up in your application settings and close the app, if empty the app will close</param>
/// -------------> CHANGE THESE ON INDEX.JS NOT HERE <-------------

module.exports = {
  api: async function (name, ownerid, secret, version) {
    if (!name || !ownerid || !secret || !version) {
      error("Application not setup correctly.");
    }

    datastore.name = name;
    datastore.ownerid = ownerid;
    datastore.secret = secret;
    datastore.version = version;
  },
  init: async function () {
    await checkvalues(); //makes sure that api values are filled.

    const values_to_upload = {
      type: "init",
      name: datastore.name,
      ownerid: datastore.ownerid,
      ver: datastore.version,
    };
    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
      error("Application not found");
    }

    if (
      response ===
      "This program hash does not match, make sure you're using latest version"
    ) {
      error("Please Disable Program Hash, Thanks!");
    }

    var json = response;

    load_response_struct(json);
    if (json.success) {
      await load_app_data(json.appinfo);
      datastore.sessionid = json.sessionid;
      intialized = true;
    } else if (json.message == "invalider") {
      app_data.downloadLink = json.download;
    }
  },
  Login: async function (username, password) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
      type: "login",
      username: username,
      pass: password,
      hwid: hwid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
      error("Application not found");
    }

    var json = response;
    load_response_struct(json);

    if (json.success) {
      load_user_data(json.info);
    }
  },
  Register: async function (username, password, key) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
      type: "register",
      username: username,
      pass: password,
      key: key,
      hwid: hwid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
      error("Application not found");
    }

    var json = response;
    load_response_struct(json);
    if (json.success) {
      load_user_data(json.info);
    }
  },
  License: async function (key) {
    checkvalues();
    checkinit();

    await Sleep(1500);

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
      type: "license",
      key: key,
      hwid: hwid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
      error("Application not found");
    }

    var json = response;
    load_response_struct(json);
    if (json.success) {
      load_user_data(json.info);
    }
  },
  Upgrade: async function (username, key) {
    checkvalues();

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
      type: "upgrade",
      username: username,
      key: key,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);

    if (response === "KeyAuth_Invalid") {
      error("Application not found");
    }

    var json = response;

    json.success = false;
    load_response_struct(json);
  },
  check: async function () {
    checkinit();
    const values_to_upload = {
      type: "check",
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);
  },
  checkblacklist: async function () {
    checkinit();

    await getHWID();
    const hwid = sys.hwid;

    const values_to_upload = {
      type: "checkblacklist",
      hwid: hwid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;

    load_response_struct(json);
    if (json.success) {
      return true;
    } else {
      return false;
    }
  },
  setvar: async function (varname, data) {
    checkinit();

    const values_to_upload = {
      type: "setvar",
      var: varname,
      data: data,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);
  },
  getvar: async function (varname) {
    checkinit();

    const values_to_upload = {
      type: "getvar",
      var: varname,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);

    if (json.success) {
      return json.response;
    } else {
      return null;
    }
  },
  SetJSON_var: async function (VarName, data) {
    checkinit();

    if (!VarName || !data) {
      try {
        throw new Exception(
          "SetJSON_var | User Variable name / Data is empty / null"
        );
      } catch (e) { }
    }

    var json = JSON.stringify(data);

    await setvar(VarName, json);
    if (!response.success) {
      error(`\nStatus: ${KeyAuth.response.message}`);
    } else {
      return "Successfully set up JSON on User Variable";
    }
  },
  GetJSON_var: async function (result, value) {
    if (!result || !value) {
      try {
        throw new Exception("GetJSON_var | Result / Value is empty / null");
      } catch (e) { }
    }

    if (result === null) {
      var lol =
        "Result is null!, Please check that this variable is existing...";
      return lol;
    } else {
      var lol = JSON.parse(result);

      if (value === "all") {
        lol = lol;
      } else {
        lol = lol[value];
      }
      return lol;
    }
  },
  ban: async function () {
    checkinit();

    const values_to_upload = {
      type: "ban",
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);
  },
  variable: async function (varid) {
    checkinit();

    const values_to_upload = {
      type: "var",
      varid: varid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;

    load_response_struct(json);

    if (json.success) {
      return json.message;
    } else {
      return null;
    }
  },
  webhook: async function (webid, param, body = "", conttype = "") {
    checkinit();

    const values_to_upload = {
      type: "webhook",
      webid: webid,
      params: param,
      body: body,
      conttype: conttype,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;

    load_response_struct(json);

    if (json.success) {
      return json.message;
    } else {
      return null;
    }
  },
  download: async function (fileid) {
    checkinit();

    const values_to_upload = {
      type: "file",
      fileid: fileid,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    var response = await req(parameters);
    var json = response;
    load_response_struct(json);

    if (json.success) {
      return str_to_byte_arr(json.contents);
    } else {
      return null;
    }
  },
  log: async function (message) {
    checkinit();

    await getUSER();
    let pcuser = sys.username;

    const values_to_upload = {
      type: "log",
      pcuser: pcuser,
      message: message,
      sessionid: datastore.sessionid,
      name: datastore.name,
      ownerid: datastore.ownerid,
    };

    const parameters = "?" + stringify(values_to_upload);

    await req(parameters);
  },
  Sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  Title: function (title) {
    process.stdout.write(
      String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
  },
  response: response,
  user_data: user_data,
  app_data: app_data,
  sys: sys,
  datastore: datastore,
};
