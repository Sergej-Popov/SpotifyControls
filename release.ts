import * as Octokit from "@octokit/rest";
import { ReposCreateReleaseResponse } from "@octokit/rest";
import * as fs from "fs-extra";
import { getConfig, getVersion } from "./ci";
import Logger from "./src/logger";

const _logger = new Logger("release");
let _octokit: Octokit;

const run = async () => {
  const config = await getConfig();
  _octokit = new Octokit({
    auth: `token ${config.github.token}`
  });

  let version = await getVersion();
  _logger.info(version);
  let release = await createRelease(version);
  await renameAssets(version);
  await uploadAssets(`AmazonMusicControls.${version}.zip`, release.upload_url);
  await uploadAssets(`SpotifyControls.${version}.zip`, release.upload_url);
};

let createRelease = async (version: string): Promise<ReposCreateReleaseResponse> => {
  let result = await _octokit.repos.createRelease({
    repo: "SpotifyControls",
    owner: "Sergej-Popov",
    name: `Release ${version}`,
    draft: false,
    prerelease: false,
    tag_name: `v${version}`,
  });

  _logger.info("Release created", result.data);
  return result.data;
};

let renameAssets = async (version: string) => {
  _logger.info("renaming assets");
  await fs.rename("./uploads/AmazonMusicControls.latest.zip", `./uploads/AmazonMusicControls.${version}.zip`);
  await fs.rename("./uploads/SpotifyControls.latest.zip", `./uploads/SpotifyControls.${version}.zip`);
};

let uploadAssets = async (file: string, url: string) => {
  let path = `./uploads/${file}`;
  let buffer = await fs.readFile(path);

  _logger.info("stats", { byteLength: buffer.buffer.byteLength });

  let result = await _octokit.repos.uploadReleaseAsset({
    file: buffer.buffer,
    headers: {
      "content-type": "application/zip",
      "content-length": buffer.buffer.byteLength
    },
    name: file,
    url: url
  });

  _logger.info("Uploaded", { file, ...result.data });
};

(async () => await run())();
