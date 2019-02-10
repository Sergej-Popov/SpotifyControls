import * as fs from "fs-extra";

export interface IConfig {
  googleApi: {
    refreshToken: string;
    clientSecret: string;
    clientId: string;
    spotifyAppIs: string;
    amazonMusicAppId: string;
  },
  github: {
    token: string;
  }
}


export const getConfig = async () => {
  const json = await fs.readFile("./secrets.json", "utf-8");
  return JSON.parse(json) as IConfig;
};

export const getVersion = async (): Promise<string> => {
  const json = await fs.readFile("src/spotify/manifest.json", "utf-8");
  const manifest = JSON.parse(json);
  return manifest.version;
};