const notarize = require('electron-notarize');

async function packageTask () {
  // Package your app here, and code sign with hardened runtime
  await notarize({
    appBundleId: "com.wteam.chat",
    appPath: "./dist/wteam-0.0.35.dmg",
    appleId: "comb@mail.ru",
    appleIdPassword: "hjjh-vsvt-izzm-zout"
  });
}
