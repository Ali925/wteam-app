const electron = require('electron');
const { app, BrowserWindow, desktopCapturer} = electron;
const path = require('path');
const activeWin = require('active-win');
const applescript = require('applescript');
const fetch = require('electron-fetch').default;
let url = require('url');
require('update-electron-app')();


const appleScripts = {
  'itunes': `tell application "iTunes" to get {name, artist, album} of current track`,
  'spotify': `tell application "Spotify" to get {name, artist, album} of current track`,
  'chrome': `tell application "Google Chrome" to get URL of active tab of front window as string`,
  'vivaldi': `tell application "Vivaldi" to return URL of active tab of front window`,
  'safari': `tell application "Safari" to return URL of front document as string`,
  'firefox': `tell application "Firefox" to activate
        tell application "System Events"
          keystroke "l" using command down
          keystroke "c" using command down
        end tell
        delay 0.5
        return the clipboard`,
  'window': `global frontApp, frontAppName, windowTitle

        set windowTitle to ""
        tell application "System Events"
            set frontApp to first application process whose frontmost is true
            set frontAppName to name of frontApp
            tell process frontAppName
                tell (1st window whose value of attribute "AXMain" is true)
                    set windowTitle to value of attribute "AXTitle"
                end tell
            end tell
        end tell

        return {frontAppName, windowTitle}`
};


let mainWindow = null;
app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
function createWindow() {
  //console.log("app path: ", app.getAppPath());
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 1024,
    minWidth: 768,
    minHeight: 485,
    title: "Wteam",
    webPreferences : { 
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }

  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  });
}

global.sharedPath = `file:///${__dirname}/`;
global.filePath = `${__dirname}/`;


let currentAppInfo = '';

setInterval(() => {
  
  if(mainWindow){
    mainWindow.webContents
    .executeJavaScript('localStorage.getItem("userInfo");', true)
    .then(result => {
      //console.log(result);
      if(result && result.length && result != 'null'){
        let user = JSON.parse(result), notification;
        user.uType = user.type;

        if(process.platform == 'darwin'){
          applescript.execString(appleScripts.window, (err, rtn) => {
            if (err) {
              // Something went wrong!
              return ;
            }
            let appName = rtn && rtn[0] ? rtn[0] : '', appTitle = rtn && rtn[1] ? rtn[1] : '', browser = appName && appName.toLowerCase().includes('chrome') ? 'chrome' : (appName && appName.toLowerCase().includes('safari') ? 'safari' : (appName && appName.toLowerCase().includes('firefox') ? 'firefox' : ''));
            console.log('get app name: ', appName, appTitle);
            if(appName && appName.toLowerCase().includes('chrome') || appName.toLowerCase().includes('safari') || appName.toLowerCase().includes('firefox')){
              applescript.execString(appleScripts[browser], (err, rtn) => {
                if (err) {
                  // Something went wrong!
                  return ;
                }
                let appInfo = JSON.stringify({appName: appName, appTitle: appTitle, url: rtn});
                notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle, url: rtn}};
                console.log('get app url: ', rtn);
                if(currentAppInfo != appInfo){
                  currentAppInfo = appInfo;
                  fetch('https://api.wteam.chat/messaging-service/notification', {
                    headers: { 'x-auth-token': user.token, 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify(notification)
                  });
                }
                
              });
            } else {
              let appInfo = '';
              if(appName){
                appInfo = JSON.stringify({appName: appName, appTitle: appTitle});
                notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle}};
              } else {
                appInfo = '';
                notification = {code: 'user.app-window-data', isNotification: false, actingUser: user};
              }

              if(currentAppInfo != appInfo){
                  currentAppInfo = appInfo;
                  fetch('https://api.wteam.chat/messaging-service/notification', {
                    headers: { 'x-auth-token': user.token, 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify(notification)
                  });
              }
            }
            
          });
        } else {
          activeWin().then(res => {
            //console.log('active win: ', res);
            let appName = res.owner && res.owner.name ? res.owner.name : undefined, appTitle = res.title ? res.title : '', appInfo = '';
            if(appName){
              appInfo = JSON.stringify({appName: appName, appTitle: appTitle});
              notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle}};
            } else {
              appInfo = '';
              notification = {code: 'user.app-window-data', isNotification: false, actingUser: user};
            }

            if(currentAppInfo != appInfo){
                currentAppInfo = appInfo;
                fetch('https://api.wteam.chat/messaging-service/notification', {
                  headers: { 'x-auth-token': user.token, 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                  method: 'POST',
                  body: JSON.stringify(notification)
                });
            }
          }).catch(err => console.log('err ', err));
        }

        
      }
      
    });
  }
  
}, 5000);