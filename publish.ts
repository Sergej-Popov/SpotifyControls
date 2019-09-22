import axios from "axios";
import * as fs from "fs-extra";
import { getConfig, getVersion, IConfig } from "./ci";
import Logger from "./src/logger";

const _logger = new Logger("publish");

const run = async () => {
  const config = await getConfig();
  const version = await getVersion();
  const token = await refreshToken(config);

  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.headers.common["x-goog-api-version"] = "2";

// await uploadPackage(token, config.googleApi.amazonMusicAppId, `AmazonMusicControls.${version}.zip`);
  // await publish(token, config.googleApi.amazonMusicAppId);

  await uploadPackage(token, config.googleApi.spotifyAppId, `SpotifyControls.${version}.zip`);
  await publish(token, config.googleApi.spotifyAppId);

};

const refreshToken = async (config: IConfig) => {
  _logger.info("refreshToken");

  const url = `https://www.googleapis.com/oauth2/v4/token?client_id=${config.googleApi.clientId}&client_secret=${config.googleApi.clientSecret}&refresh_token=${config.googleApi.refreshToken}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;

  const result = await axios.post(url, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  _logger.info({ status: result.status, data: result.data });

  return result.data.access_token;
};

const uploadPackage = async (token: string, appId: string, file: string) => {
  _logger.info("uploadPackage", { token, appId, file });
  const path = `./uploads/${file}`;
  const buffer = await fs.readFile(path);
  const url = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${appId}`;
  const result = await axios.put(url, buffer);

  _logger.info({ status: result.status, data: result.data });

  if (result.data.uploadState !== "SUCCESS") {
    _logger.info({ data: JSON.stringify(result.data) });
    throw new Error(`Failed to upload a package`);
  }
};

const publish = async (token: string, appId: string) => {
  _logger.info("publish");
  const url = `https://www.googleapis.com/chromewebstore/v1.1/items/${appId}/publish`;
  const result = await axios.post(url, {
  });

  _logger.info({ status: result.status, data: result.data });
};

(async () => await run())();
