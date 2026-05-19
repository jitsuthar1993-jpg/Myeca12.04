import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.myeca.app",
  appName: "MyeCA",
  webDir: "dist/public",
  android: {
    path: "android-capacitor",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
