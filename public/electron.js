const electron = require('electron');
const { app, BrowserWindow, desktopCapturer} = electron;
const path = require('path');
const activeWin = require('active-win');
const applescript = require('applescript');
const fetch = require('electron-fetch').default;
let url = require('url');

if (process.platform !== 'darwin') {
    const { autoUpdater } = require("electron-updater");

    const log = require("electron-log")
    log.transports.file.level = "debug"
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify();
} else {
  require('update-electron-app')({
    repo: 'Ali925/wteam-app',
    updateInterval: '5 minutes',
    logger: require('electron-log')
  });
}






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

const appIconsMap = {
  'adobe animate': 'adobe-animate',
  'adobe illustrator': 'adobe-illustrator-cc',
  'adobe xd': 'adobe-xd-1',
  'airtable': 'airtable',
  'asana': 'asana-logo',
  'atom': 'atom-4',
  'aws': 'aws-2',
  'basecamp': 'basecamp',
  'bitbucket': 'bitbucket',
  'blender': 'blender-2',
  'buffer': 'buffer',
  'digitalocean': 'digitalocean-icon-1',
  'dropbox' : 'dropbox-1',
  'dropbox paper': 'dropbox-paper',
  'edge animate': 'edge-animate-app-cc',
  'electron': 'electron',
  'figma' : 'figma-1',
  'front': 'front',
  'github': 'github-1',
  'gitlab': 'gitlab',
  'google slide': 'google-slide',
  'google calendar': 'google-calendar',
  'google docs': 'google-docs-icon',
  'google meet': 'google-meet-2',
  'google sheets': 'google-sheets',
  'hubspot': 'hubspot-1',
  'ibooks': 'ibooks',
  'indesign': 'indesign-cc',
  'intercom': 'intercom',
  'invision': 'invision',
  'jira': 'jira',
  'linkedin': 'linkedin-icon-2',
  'microsoft excel': 'microsoft-excel-2013',
  'microsoft powerpoint': 'microsoft-powerpoint-2013',
  'microsoft word': 'microsoft-word-2013-logo',
  'notion': 'notion-2',
  'numbers': 'numbers',
  'onedrive': 'onedrive-1',
  'pages ios': 'pages-ios',
  'photoshop': 'photoshop-cc',
  'premiere': 'premiere-cc',
  'salesforce': 'salesforce-2',
  'sketch': 'sketch-2',
  'skype': 'skype-1',
  'slack': 'slack',
  'stack overflow': 'stackoverflow',
  'teamwork': 'teamwork-2',
  'telegram': 'telegram-1',
  'terminal': 'terminal',
  'trello': 'trello',
  'unity': 'unity-69',
  'visual studio 2013': 'visual-studio-2013',
  'visual studio code': 'visual-studio-code',
  'zendesk': 'zendesk-1',
  'zeplin': 'zeplin',
  'zoom': 'zoom-communications-logo'
};

const appUrlIconsMap = {
  'airtable.com': 'airtable',
  'asana.com': 'asana-logo',
  'aws.amazon.com': 'aws-2',
  'basecamp.com': 'basecamp',
  'bitbucket.com': 'bitbucket',
  'digitalocean.com': 'digitalocean-icon-1',
  'dropbox.com' : 'dropbox-1',
  'paper.dropbox.com': 'dropbox-paper',
  'figma.com' : 'figma-1',
  'github.com': 'github-1',
  'gitlab.com': 'gitlab',
  'docs.google.com/presentation': 'google-slide',
  'calendar.google.com': 'google-calendar',
  'docs.google.com/document': 'google-docs-icon',
  'meet.google.com': 'google-meet-2',
  'docs.google.com/spreadsheets': 'google-sheets',
  'hubspot.com': 'hubspot-1',
  'intercom.com': 'intercom',
  'invisionapp.com': 'invision',
  'jira.atlassian.com': 'jira',
  'linkedin.com': 'linkedin-icon-2',
  'office.com/launch/excel': 'microsoft-excel-2013',
  'onedrive.live.com,xlsx,xls,xml,csv': 'microsoft-excel-2013',
  'office.com/launch/powerpoint': 'microsoft-powerpoint-2013',
  'onedrive.live.com,pptx,pptm,ppt': 'microsoft-powerpoint-2013',
  'office.com/launch/word': 'microsoft-word-2013-logo',
  'onedrive.live.com,doc,docx': 'microsoft-word-2013-logo',
  'notion.so': 'notion-2',
  'onedrive.live.com': 'onedrive-1',
  'salesforce.com': 'salesforce-2',
  'web.skype.com': 'skype-1',
  'app.slack.com': 'slack',
  'stackoverflow.com': 'stackoverflow',
  'teamwork.com': 'teamwork-2',
  'web.telegram.org': 'telegram-1',
  'trello.com': 'trello',
  'zendesk.com': 'zendesk-1',
  'app.zeplin.io': 'zeplin',
  'web.zoom.us': 'zoom-communications-logo'
};


let mainWindow = null;
app.on('ready', () => setTimeout(createWindow, 1000));
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    setTimeout(createWindow, 1000);
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
      let user = result && result.length && result != 'null' && result != 'undefined' ? JSON.parse(result) : undefined;
      mainWindow.webContents
      .executeJavaScript('localStorage.getItem("userPref");', true)
      .then(prefs => {
      let pref = prefs && prefs.length && prefs != 'null' && prefs != 'undefined' ? JSON.parse(prefs) : undefined;
      if(user && user.id && user.appStatus != 'Focus mode' && (!pref || pref.shareActiveApp)){
        let notification;
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
                let appIcon = '';

                for(let i in appUrlIconsMap){
                  let titles = i.split(",");
                  if(titles.length > 1){
                    if(titles.every(t => rtn.includes(t))){
                      appIcon = appUrlIconsMap[i];
                      break;
                    }
                  } else {
                    if(rtn.includes(i)){
                      appIcon = appUrlIconsMap[i];
                      break;
                    }
                  }
                }

                if(!appIcon){
                  for(let i in appIconsMap){
                    if(appName.trim().toLowerCase().includes(i)){
                      appIcon = appIconsMap[i];
                      break;
                    }
                  }
                }

                if((!pref || pref.shareActiveAppUrl)){
                  notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle, url: rtn, appIcon: appIcon}};
                } else {
                  notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle, appIcon: appIcon}};
                }
                
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
              let appInfo = '', appIcon = '';
              if(appName){
                appInfo = JSON.stringify({appName: appName, appTitle: appTitle});

                if(!appIcon){
                  for(let i in appIconsMap){
                    if(appName.trim().toLowerCase().includes(i)){
                      appIcon = appIconsMap[i];
                      break;
                    }
                  }
                }

                notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle, appIcon: appIcon}};
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
          console.log("it is not darwin!!");
          (async () => {
            let res = await activeWin();
            let appName = res.owner && res.owner.name ? res.owner.name : undefined, appTitle = res.title ? res.title : '', appInfo = '', appIcon = '';
            if(appName){
              appInfo = JSON.stringify({appName: appName, appTitle: appTitle});
              if(!appIcon){
                  for(let i in appIconsMap){
                    if(appName.trim().toLowerCase().includes(i)){
                      appIcon = appIconsMap[i];
                      break;
                    }
                  }
                }
              notification = {code: 'user.app-window-data', isNotification: false, actingUser: user, activeWindow: {appName: appName, appTitle: appTitle, appIcon: appIcon}};
            } else {
              appInfo = '';
              notification = {code: 'user.app-window-data', isNotification: false, actingUser: user};
            }
            console.log("active window: ", appInfo);
            if(currentAppInfo != appInfo){
                currentAppInfo = appInfo;
                fetch('https://api.wteam.chat/messaging-service/notification', {
                  headers: { 'x-auth-token': user.token, 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                  method: 'POST',
                  body: JSON.stringify(notification)
                });
            }
          })();
        }

        
      }
      });
    });
  }
  
}, 5000);