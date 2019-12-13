# providersearch
Provider Hub Connect - Provider Search

### Install
```
yarn install && cd client && yarn install

```

### Run Loopback
```
yarn start
```
The server run on **localhost:3003** and **server/boot/init.js** will create three users _(admin, editor and user)_

You can reach the Api Explorer via **localhost:3003/explorer**

### Run Client (React)
```
cd client && yarn start
```
The client run on **localhost:3000** and talking with api on **localhost:3003**


### Run for Development
```
yarn watch
```
The watch command is running loopback at background. If you need to kill both services running on 3000 and 3003, you can use
```
yarn kill
```


##### Add a React Component
```
cd client/
npx crcf src/components/NewComponent
```

#### Build and Serve the Client
```
cd client/
yarn build
```
After the build to serve the client you should edit the **server/middleware.json** like below
```
  "files": {
    "loopback#static": [
      {
        "paths": ["/"],
        "params": "$!../client/build"
      },
      {
        "paths": ["*"],
        "params": "$!../client/build"
      }
    ]
  }
```
to more info https://loopback.io/doc/en/lb3/Defining-middleware.html

## Routes
```
 /
 /feature
 /signin
 /signup
 /signout
 /reset
 /newpassword/:token
 /tos
 /privacy
 - /home
   /profile
   /settings/:page? (default /settings/account)
   /users/:page?/:id? (default /users/list)
   /user/:id
   /user/:id/edit
   /:username (run as /profile)
```
in client/src/routes/index.js
