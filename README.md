# Acuant idScanGo - Web #

### Setup ###

Supported OS Platforms:
* Windows
* OSX
* Linux

This project works well with **Node JS 6.10** and above. Please ensure that you have it installed.
If you don't, please follow up [this link](https://nodejs.org/en/).

### Installation and Running ###
* **Step 1** - Start by downloading or cloning this repository
* **Step 2** - Open up the terminal and proceed to the project's directory
* **Step 3** - run ```npm install```. This command will install all the required dependencies.
* **Step 4** - run ```npm run start```. The project will start running on ```http://localhost:3000``` (default address).

For setting up the app you have to explicitly set Environment variables in .env file that you can find in this folder.

These are the available env vars that you'll find in the file. Please do not modify ```REACT_APP_ID_SCAN_GO_API``` and
```REACT_APP_FACE_API``` unless you're told to do so.

```
PUBLIC_URL=https://acuantwebapps.com/idscangoweb/
REACT_APP_BASENAME=/idscangoweb
REACT_APP_ID_SCAN_GO_API=https://services.assureid.net
REACT_APP_FACE_API=https://frm.acuant.net
REACT_APP_AUTH_METHOD=Basic
REACT_APP_USER_NAME=
REACT_APP_USER_PASSWORD=
REACT_APP_SUBSCRIPTION_ID=
REACT_APP_SENTRY_SUBSCRIPTION_ID=
```

```REACT_APP_SENTRY_SUBSCRIPTION_ID``` is optional.

### \*IMPORTANT\* ###

If you're deploying the App to a subfolder on the server, you need to explicitly set ```REACT_APP_BASENAME``` env var.
Otherwise the app won't work. This applications uses virtual routes that are set by React Router. React Router assumes
that the App will be available at the root of the domain.

If you want to start the project on a different port, you can always add environment variables.
Example: ```PORT=80 npm start``` will start the Application on the port ```:80```.

### Building for deployment ###

In general, React apps are static and built by running ```npm run build```. This will create the ```build``` directory inside the project's folder.
You can upload the ```build``` folder via FTP, SSH or even sync it with any S3 Bucket.
Remember to change the ```PUBLIC_URL``` and ```REACT_APP_BASENAME``` env variables accordingly in the .env file.


### Extra ###

I recommend having a ```deploy``` script inside the ```package.json``` file that will do the job for you.
Example:

```javascript
"deploy": "npm run build; scp -r ./build root@server:/var/www/"
```

The above script will build the project and sync it with a server on your choice using the [scp](https://linux.die.net/man/1/scp) command.