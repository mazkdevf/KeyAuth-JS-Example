## KeyAuth JavaScript Example

##### Thanks for Automized, For Creating 1.0 Endpoint Example 💯❤️

##### Example is using Encryption so Request will be encrypted, and it needs to be decrypted before using.


-----------
### **Example Codes**



##### **Filling KeyAuth Class Constructor**
```js
const KeyAuthApp = new KeyAuth(
    '',      // Application Name
    '',     // Application OwnerId
    '',    // Application Secret
    '1.0' // Application Version
);
```

##### **Initializing Application**
```js
await KeyAuthApp.Initialize();
```
---

##### **General Features**
###### **Login**
```js
await KeyAuthApp.login("<USERNAME>", "<PASSWORD>");
```

###### **Register**
```js
await KeyAuthApp.register("<USERNAME>", "<PASSWORD>", "<LICENSE/KEY>")
```

###### **License Login**
```js
await KeyAuthApp.license("<LICENSE/KEY>");
```

###### **Upgrade an Account**
```js
await KeyAuthApp.upgrade("<USERNAME>", "<LICENSE/KEY>");
```
---

##### **Variables**
###### **Get Public Variable**
```js
await KeyAuthApp.var("<VarId>");
```

###### **Get User Variable**
```js
await KeyAuthApp.GetVar("<VarId>");
```

###### **Set User Variable**
```js
await KeyAuthApp.SetVar("<VarId>", "<VarData>");
```
---
##### **Banning Logged in User**
```js
await KeyAuthApp.ban();
```
---

##### **File Downloads**
```js
await KeyAuthApp.file("<FileId>");
```
---
##### **Webhooks**

###### Normal Request with Params
```js
await KeyAuthApp.webhook("<WebId>", "<Params>")
```

###### Webhook Request with Body & Content Type
```js
await KeyAuthApp.webhook("<WebId>", "<Params>", "<Body>", "<Content Type>");
```

###### Discord Webhook Example
```js
await KeyAuthApp.webhook("<WebId>", "", "{\"content\": \"webhook message here\",\"embeds\": null}", "application/json");
```
---
##### **Checks**
###### Check Session Status
```js
await KeyAuthApp.check();
```

##### **Check Blacklist Status**
```js
await KeyAuthApp.checkBlack();
```

##### **Check / Fetch Online Users**
```js
await KeyAuthApp.fetchOnline();
```
---


##### **Chats**
###### Get 20 Latest Chat Messages

```js
await KeyAuthApp.ChatGet();
```

###### Send Chat Message
```js
await KeyAuthApp.ChatSend("<ChannelName>", "<Message>");
```
---

##### **Logs**
```js
await KeyAuthApp.log("<Message>");
```
---

### **Additional / Extra Functions**

##### **Set/Change Console Title**
```js
await KeyAuthApp.setTitle("<NewTitle>");
```

##### **Sleep is ms(s)**
```js
await KeyAuthApp.sleep("<1 sec = 1000ms>")
```



