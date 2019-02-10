import { LitElement, html, property, customElement, css } from "lit-element";
import { Storage } from "storage";
// import "./setting.scss";
// import '/components/setting.scss';
// import * as Style from "./setting.scss";
// import Style from "components/setting.scss";

@customElement('x-setting')
export class Setting extends LitElement {
  @property() title = "";
  @property() key = "";
  disabled: boolean;

  async change(evt: any) {
    this.disabled = !this.disabled;
    console.info(`change: notifications play enabled: ${this.disabled}`, evt);
    Storage.Set("notifications-play-disabled", this.disabled);
    evt.preventDefault();
  }

  // static get styles() {
  //   return [Style];
  // }

  render() {
    (async () => {
      this.disabled = !!(await Storage.Get<boolean>("notifications-play-disabled"));
    })();

    // <link rel="stylesheet" href="./styles/settings.css">
    // <style include="settings">  
    // <style include="settings"></style>
    return html`
    <link rel="stylesheet" href="./component.setting.css">

    <label class="switch" title="${this.title}">
      <input type="checkbox" id="settings-${this.key}" ?checked="${!this.disabled}" @change="${this.change}" />
      <span class="slider"></span>
    </label>`;
  }
}
