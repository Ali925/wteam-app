const notarize = require('electron-notarize');

async function packageTask () {
  // Package your app here, and code sign with hardened runtime
  await notarize({
    appBundleId: "com.wteam.chat",
    appPath: "./dist/mac/wteam.app",
    appleId: "comb@mail.ru",
    appleIdPassword: "hjjh-vsvt-izzm-zout"
  });
}
