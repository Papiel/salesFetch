# salesFetch
[![Build Status](https://travis-ci.org/AnyFetch/salesFetch.svg)](https://travis-ci.org/AnyFetch/salesFetch)
[![Coverage Status](https://coveralls.io/repos/AnyFetch/salesFetch/badge.png)](https://coveralls.io/r/AnyFetch/salesFetch)
[![Dependency Status](https://david-dm.org/AnyFetch/salesFetch.svg?theme=shields.io)](https://david-dm.org/AnyFetch/salesFetch)

AnyFetch API integration in SalesForce.

* Provides components integration in SalesForce
* 2 ways : timeline views and search views
* Dynamic request management

Check out the [wiki](https://github.com/AnyFetch/salesFetch/wiki/Installation-guide) to install SalesFetch into your SalesForce organization.


## First things first...

* Node.js - Download and Install [Node.js](http://www.nodejs.org/download/). You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm
* MongoDB - Download and Install [MongoDB](http://www.mongodb.org/downloads) - Make sure it's running on the default port (27017).

### Development tools

SalesFetch makes use of the following tools during development:

* [NPM](https://www.npmjs.org/) - Node.js package manager, it should be installed when you install node.js.
* [Bower](http://bower.io/) - A frontend package manager
* [Gulp](http://gulpjs.com/) - A build-system framework

Bower and Gulp are installed along with all the other dependencies (see following steps).

## Quick Install

To install all backend, frontend and dev dependencies, just run:

```
  $ npm install
```

You should then be able to launch the server with:
```
  $ gulp
```

The server is now available on `https://localhost:3000`. SSL is used to secure the connection between SalesFetch and SalesForce. When developping on `localhost`, self-signed certificates are used: be sure to access a page of the application from your browser of choice first and accept the self-signed certificates.

In dev mode, the `gulp` tasks will lint, compile and reload on each change. The tasks are described in the [gulpfile]() and can be run separately with `gulp <task>`.

## Apex code management

All the SalesForce-specific (Apex) code is **mirrored** in the following repository: [salesFetch-Apex](https://github.com/Papiel/salesFetch-Apex).
Be aware that code must be transferred to the SalesForce platform in order to be tested and deployed.

### With Eclipse (preferred)

You can use the [Force.com IDE](https://wiki.developerforce.com/page/Force.com_IDE), which directly integrates into the Eclipse IDE. This allows to manage the Apex code, sync it with the SalesForce server, and get test results into the IDE. You'll find more information on the [SalesForce developer wiki](https://wiki.developerforce.com/page/An_Introduction_to_Force_IDE).

### With Sublime Text 3

You can use [MavensMate](http://mavensmate.com/) and the integration into the SublimeText3 text editor to manage the Apex code. To connect an existing project to the plugin [use this link](http://mavensmate.com/Plugins/Sublime_Text/Existing_Projects).

### Directly on SalesForce
Log onto [SalesForce](http://salesforce.com), then hover over your name and select "Setup". On the left menu, package's content can be found in "Packages > salesFetch".

## Architecture

The following (magnificent) diagram explains the architecture of the SalesFetch app. It was designed with performance (leveraging cache) and maintainability (quick and easy updates) in mind.

![SalesFetch app architecture](images/architecture.png)
