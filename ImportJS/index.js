import * as KeyAuth from './KeyAuth.js'
import readline from "readline";
import moment from "moment"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

KeyAuth.api(
    "", // Application Name
    "", // OwnerID
    "", // Application Secret
    "1.0" // Application Version
)

await KeyAuth.cls();
await KeyAuth.init();

if (!KeyAuth.response.success) {
    KeyAuth.error("Status: " + KeyAuth.response.message)
}

KeyAuth.Title("KeyAuth JS Example - 1.1 API")
console.log("\n Application Data:")
console.log(` Number of users: ${KeyAuth.app_data.numUsers}`)
console.log(` Number of online users: ${KeyAuth.app_data.numOnlineUsers}`)
console.log(` Number of keys: ${KeyAuth.app_data.numKeys}`)
console.log(` Application Version: ${KeyAuth.app_data.version}`)
console.log(` Customer panel link: ${KeyAuth.app_data.customerPanelLInk}\n`)
await KeyAuth.check();
await KeyAuth.Sleep(1200);
console.log(` Current Session Validation Status: ${KeyAuth.response.message}`);
console.log(` Blacklisted: ${await KeyAuth.checkblacklist()}`);

await rl.question("\n [1] Login\n [2] Register\n [3] Upgrade\n [4] License key only\n\n Choose option: ", async function(choice) {
    if (choice === "1") {
        rl.question("Whats your username: ", async function(username) {
            rl.question("Whats your password: ", async function(password) {
                await KeyAuth.Login(username, password);
                if (!KeyAuth.response.success) {
                    KeyAuth.error("Status: " + KeyAuth.response.message)
                }
                loggedin();
                rl.close();
            })
        })
    } 
    else if (choice === "2") {
        rl.question("Whats your username: ", async function(username) {
            rl.question("Whats your password: ", async function(password) {
                rl.question("Whats your License: ", async function(key) {
                    await KeyAuth.Register(username, password, key);
                    if (!KeyAuth.response.success) {
                        KeyAuth.error("Status: " + KeyAuth.response.message)
                    }
                    loggedin();
                    rl.close();
                })
            })
        })
    }
    else if (choice === "3") {
        rl.question("Whats your username: ", async function(username) {
            rl.question("Whats your License: ", async function(key) {
                await KeyAuth.Upgrade(username, key);
                if (!KeyAuth.response.success) {
                    KeyAuth.error("Status: " + KeyAuth.response.message)
                }
                loggedin();
                rl.close();
            })
        })
    }
    else if (choice === "4") {
        rl.question("Whats your License: ", async function(key) {
            await KeyAuth.License(key);
            if (!KeyAuth.response.success) {
                KeyAuth.error("Status: " + KeyAuth.response.message)
            }
            loggedin();
            rl.close();
        })
    }
    else {
        console.log("?")
        rl.close();
    }
})

async function loggedin() {
    console.log("\n Logged In!")

    //User Data
    console.log(` Username: ${KeyAuth.user_data.username}`)
    console.log(` IP address: ${KeyAuth.user_data.ip}`)
    console.log(` Hardware-Id: ${KeyAuth.user_data.hwid}`)
    console.log(` Created at: ${moment.unix(KeyAuth.user_data.createdate).format("DD-MM-YYYY - HH:mm:ss")}`)
    console.log(` Last Login: ${moment.unix(KeyAuth.user_data.lastlogin).format("DD-MM-YYYY - HH:mm:ss")}`)


    for (var i = 0; i < KeyAuth.user_data.subscriptions.length; i++)
    {
        console.log(` [${i}] Subscription name: ${KeyAuth.user_data.subscriptions[i].subscription} | Expires at: ${moment.unix(KeyAuth.user_data.subscriptions[i].expiry).format("DD-MM-YYYY - HH:mm:ss")} | Time left in seconds ${KeyAuth.user_data.subscriptions[i].timeleft}`)
    }


    KeyAuth.check();
    console.log(` Current Session Validation Status: ${KeyAuth.response.message}`);

    console.log("\n\n Closing in 10 seconds...")
    await KeyAuth.Sleep(10000);
    process.exit(0);

}


//#region Extra Stuff
/*
  //
  //* --> set user variable 'discord' to 'test#0001' (if the user variable with name 'discord' doesn't exist, it'll be created) <--

  await KeyAuth.setvar("discord", "test#0000");
  if (!KeyAuth.response.success) {
    KeyAuth.error(`\nStatus: ${KeyAuth.response.message}`)
  } else {
    console.log("\n Succesfully set user variable.")
  }

  //
  //* --> display the user variable 'discord' <--

  let uservar = await KeyAuth.getvar("discord");
  if (!KeyAuth.response.success) {
    KeyAuth.error(`\nStatus: ${KeyAuth.response.message}`)
  } else {
    console.log(`\n User variable value: ${uservar}`)
  }

  //* KeyAuth.log("User logged in") // log text to website and discord webhook (if set)

  //* let's say you want to send request to https://keyauth.com/api/seller/?sellerkey=f43795eb89d6060b74cdfc56978155ef&type=black&ip=1.1.1.1&hwid=abc
  //* but doing that from inside the loader is a bad idea as the link could get leaked.
  //* Instead, you should create a webhook with the https://keyauth.com/api/seller/?sellerkey=f43795eb89d6060b74cdfc56978155ef part as the URL
  //* then in your loader, put the rest of the link (the other paramaters) in your loader. And then it will send request from KeyAuth server and return response in string resp Credits to mak.

  //
  //* --> example to send normal request with no POST data <--
  string resp = await KeyAuthApp.webhook("7kR0UedlVI", "&type=black&ip=1.1.1.1&hwid=abc");

  //
  //* --> example to send form data <--
  resp = KeyAuth.webhook("7kR0UedlVI", "", "type=init&name=test&ownerid=j9Gj0FTemM", "application/x-www-form-urlencoded");
  //
  //* --> example to send JSON <--
  let resp = await KeyAuth.webhook("HTeP5e21OC", "", "{\"content\": \"webhook message here\", \"embeds\": null}", "application/json") // if Discord webhook message successful, response will be empty
  if (!KeyAuth.response.success) {
     KeyAuth.error(`\nStatus: ${KeyAuth.response.message}`)
  } else {
     console.log(`\n Response recieved from webhook request: ${resp}`)
  }

  //
  //* --> FILEID Downloads <--
  var result = await KeyAuth.download("763996");
  if (!KeyAuth.response.success) {
    KeyAuth.error(`\nStatus: ${KeyAuth.response.message}`)
  } else {
    //* FILE save using inbuild FileSystem
    try {
      fs.writeFileSync(
        pathtobuild,
        Buffer.from(byteArray)
      );
    } catch (error) {
      console.log(error)
    }
  }

  //
  //* --> Application Variables <--
  let appvar = await KeyAuth.variable("test");
  if (!KeyAuth.response.success) {
    KeyAuth.error(`\nStatus: ${KeyAuth.response.message}`)
  } else {
    console.log(`\n App variable data: ${appvar}`);
  }

  //
  //* --> Set up JSON User Variables <--
  const JSONArray = {
    'version': '1.25',
    'Profile_picURI': 'https://example.com/lol.png'
  }

  ///* KeyAuth user variabl - change "JSON" to your user JSON Variable name
  await KeyAuth.SetJSON_var("JSON", JSONArray); 

  //
  //* --> Fetch JSON User Variable <--
  //* CHANGE "JSON" To your User JSON Variable Name ^^^^
  var result = await KeyAuth.getvar("JSON");
  var deserialized = KeyAuth.GetJSON_var(result, "all"); // (result ^^, and you can enter json value to get the json value out of req | or | put "all" to get full json array.)
  console.log(desrialized);

  //
  //* --> Send Message <--
  await KeyAuth.chatsend(message, channel)
  if(!KeyAuth.response.success) {
    KeyAuth.error("Status: " + KeyAuth.response.message);
  } else {
    console.log("Message has been sent");
  }

  //
  //* --> Get Channel Messages <--
  await KeyAuth.chatget(channel)
  if(!KeyAuth.response.success) {
    KeyAuth.error("Status: " + KeyAuth.response.message);
  } else {
    KeyAuth.response.messages.forEach(async (m) => {
      let timestampt = await formatTime(m.timestamp)
      console.log(`\nFrom: ${m.author}\nContent: ${m.message}\nAt: ${timestamp}\n`)
    })
  }

  //* Format unix timestampt to date & time using moment
  async function formatTime(unix_timestamp) {
    let newdate = moment.unix(unix_timestamp).format("HH:mm:ss - DD/MM/YYYY");
    return newdate;
  } 
*/
//#endregion
