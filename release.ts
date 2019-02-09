import * as Octokit from "@octokit/rest";
import { ReposCreateReleaseResponse } from "@octokit/rest";
import Logger from "./src/logger";
import * as fs from "fs-extra";
const prompt = require("prompt-async");

prompt.start();
const _logger = new Logger("release");
let _octokit: Octokit;


let getVersion = async () => {
  let json = await fs.readFile("src/spotify/manifest.json", "utf-8");
  let manifest = JSON.parse(json);
  return manifest.version;
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
}

let renameAssets = async (version: string) => {
  _logger.info("renaming assets");
  await fs.rename("./uploads/AmazonMusicControls.latest.zip", `./uploads/AmazonMusicControls.${version}.zip`);
  await fs.rename("./uploads/SpotifyControls.latest.zip", `./uploads/SpotifyControls.${version}.zip`);
};

let uploadAssets = async (file: string, url: string) => {
  let path = `./uploads/${file}`;
  let buffer = await fs.readFile(path);

  _logger.info("stats", { byteLength: buffer.buffer.byteLength });

  var result = await _octokit.repos.uploadReleaseAsset({
    file: buffer.buffer,
    headers: {
      "content-type": "application/zip",
      "content-length": buffer.buffer.byteLength
    },
    name: file,
    url: url
  });

  _logger.info("Uploaded", { file, ...result.data })
}


(async () => {
  const { token } = await prompt.get(["token"]);
  _octokit = new Octokit({
    auth: `token ${token}`
  });

  let version = await getVersion();
  _logger.info(version);
  let release = await createRelease(version);
  await renameAssets(version);
  await uploadAssets(`AmazonMusicControls.${version}.zip`, release.upload_url);
  await uploadAssets(`SpotifyControls.${version}.zip`, release.upload_url);
})();