const KeyAuth = require('./KeyAuth');
const readline = require("readline");
const moment = require("moment");
const CRL = readline.createInterface({ input: process.stdin, output: process.stdout });

const KeyAuthApp = new KeyAuth(
    "", // Application Name
    "", // OwnerID
    "", // Application Secret
    "1.0" // Application Version
);

(async () => {
    await KeyAuthApp.Initialize();

    console.log("\n Application Data:");
    console.log(` Number of users: ${KeyAuthApp.app_data.numUsers}`);
    console.log(` Number of online users: ${KeyAuthApp.app_data.numOnlineUsers}`);
    console.log(` Number of keys: ${KeyAuthApp.app_data.numKeys}`);
    console.log(` Application Version: ${KeyAuthApp.app_data.version}`);
    console.log(` Customer panel link: ${KeyAuthApp.app_data.customerPanelLink}\n`);

    var username, password, license, email = "";

    await CRL.question("\n [1] Login\n [2] Register\n [3] Upgrade\n [4] License key only\n [5] Forgot password\n\n Choose option: ", async (option) => {
        option = await parseInt(option);

        switch (option) {
            case 1:
                await CRL.question("\n Whats your Username: ", async (user) => {
                    username = user;
                    await CRL.question(" Whats your Password: ", async (pass) => {
                        password = pass;
                        await KeyAuthApp.login(username, password);
                        Dashboard();
                        CRL.close();
                    });
                });
                break;
            case 2:
                await CRL.question("\n Whats your Username: ", async (user) => {
                    username = user;
                    await CRL.question(" Whats your Password: ", async (pass) => {
                        password = pass;
                        await CRL.question(" Whats your License: ", async (lic) => {
                            license = lic;
                            await CRL.question(" Whats your email (leave empty if none will be set) ", async (email_) => {
                                email = email_;
                                await KeyAuthApp.register(username, password, license, email);
                                Dashboard();
                                CRL.close();
                            });
                        });
                    });
                });
                break;
            case 3:
                await CRL.question("\n Whats your Username: ", async (user) => {
                    username = user;
                    await CRL.question(" Whats your License: ", async (key) => {
                        license = key;
                        await KeyAuthApp.upgrade(username, license);
                        console.log("You have Successfully upgraded your account!");
                        process.exit(0);

                    });
                });
                break;
            case 4:
                await CRL.question("\n Whats your License: ", async (lic) => {
                    license = lic;
                    await KeyAuthApp.license(license);
                    Dashboard();
                    CRL.close();
                }
                );
                break;
            case 5:
                await CRL.question("\n Whats your username: ", async (username_) => {
                    username = username_;
                    await CRL.question("\n Whats your email: ", async (email_) => {
                        email = email_;
                        await KeyAuthApp.forgot(username, email);
                        console.log(KeyAuthApp.response.message);
                        process.exit(0);
                    });
                });
                break;
            default:
                console.log("Invalid option");
                CRL.close();
                break;
        }

    });

    async function Dashboard() {
        console.log("\n Logged In!");

        //User Data
        console.log(` Username: ${KeyAuthApp.user_data.username}`);
        console.log(` IP address: ${KeyAuthApp.user_data.ip}`);
        console.log(` Hardware-Id: ${KeyAuthApp.user_data.hwid}`);
        console.log(
            ` Created at: ${moment
                .unix(KeyAuthApp.user_data.createdate)
                .format("DD-MM-YYYY - HH:mm:ss")}`
        );
        console.log(
            ` Last Login: ${moment
                .unix(KeyAuthApp.user_data.lastlogin)
                .format("DD-MM-YYYY - HH:mm:ss")}`
        );

        for (var i = 0; i < KeyAuthApp.user_data.subscriptions.length; i++) {
            console.log(
                ` [${i}] Subscription name: ${KeyAuthApp.user_data.subscriptions[i].subscription
                } | Expires at: ${moment
                    .unix(KeyAuthApp.user_data.subscriptions[i].expiry)
                    .format("DD-MM-YYYY - HH:mm:ss")} | Time left in seconds ${KeyAuthApp.user_data.subscriptions[i].timeleft
                }`
            );
        }

        console.log("\n\n Closing in 5 seconds...");
        await KeyAuthApp.sleep(5000);
        process.exit(0);

    }
})();