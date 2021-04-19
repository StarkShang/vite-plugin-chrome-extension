import { createApp, DefineComponent } from "vue";
import Popup from "./Popup.vue";

const MOUNT_EL_ID = "attonex_clipper";

let mountEl = document.getElementById(MOUNT_EL_ID);
if (mountEl) {
    mountEl.innerHTML = "";
}
mountEl = document.createElement("div");
mountEl.setAttribute("id", MOUNT_EL_ID);
document.body.appendChild(mountEl);
const vm = createApp(Popup).mount(mountEl);

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisible) {
        (vm as any).visible = !(vm as any).visible;
    }
})
