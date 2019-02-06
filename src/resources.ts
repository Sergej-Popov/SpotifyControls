import { IConfig } from "config";

declare const __CONFIG__: IConfig;

export class Resources {
  public static urlOss = "https://github.com/Sergej-Popov/SpotifyControls";
  public static urlPayPal = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TRUHY87YGGRLY";
  public static urlChromeCommands = "chrome://extensions/configureCommands";

  public static msgDontHack = `No need to hack around.. This app is open source: ${Resources.urlOss}`;
  public static msgBuyBeer = `"Learned a thing or two? Buy me a beer: ${Resources.urlPayPal} (PayPal donation)"`;
  public static msgRate = `And don't forget to rate! ${__CONFIG__.reviewsUrl}`;
}
