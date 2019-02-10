export interface IConfig {
  environment: "spotify" | "amazon",
  tabUrlRegEx: RegExp,
  showVolumeBar: boolean,
  openPlayerUrl: string,
  reviewsUrl: string
}