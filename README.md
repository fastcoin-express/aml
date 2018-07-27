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

Inside the ```public``` folder there's a ```env.js``` config file. You will have to fill in ```AUTH_TOKEN``` and ```SUBSCRIPTION_ID``` fields with the data you received from Acuant.

If you want to start the project on a different port, you can always add environment variables.
Example: ```PORT=80 npm start``` will start the Application on the port ```:80```.

### Building for deployment ###

In general, React apps are static and built by running ```npm run build```. This will create the ```build``` directory inside the project's folder.
You can upload the ```build``` folder via FTP, SSH or even sync it with any S3 Bucket.
Remember to change the PUBLIC_URL env variable accordingly in .env file.

### Extra ###

I recommend having a ```deploy``` script inside the ```package.json``` file that will do the job for you.
Example:

```javascript
"deploy": "npm run build; scp -r ./build root@server:/var/www/"
```

The above script will build the project and sync it with a server on your choice using the [scp](https://linux.die.net/man/1/scp) command.