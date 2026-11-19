"use strict";
const frame = document.getElementById("site");
const review = document.getElementById("review");
const query = new URLSearchParams(location.search);
let mode = query.get("mode") === "baseline" ? "baseline" : "proposed";
window.O4K9_DEMO = {
  extras: {},
  date: "2026-11-19",
  time: "8:00 am",
  service: "daycare",
  checkout: "2026-11-20",
  dogs: 1,
  owner: {},
  enquiry: {},
  cart: [],
  decision: "Needs changes",
  feedback: "",
};
function route() {
  let value = location.hash.slice(1) || "/";
  if (!value.startsWith("/")) value = "/";
  let [pathname, search = ""] = value.split("?");
  if (mode === "proposed" && pathname === "/services") {
    pathname = "/training";
    history.replaceState(
      null,
      "",
      location.pathname +
        location.search +
        "#/training" +
        (search ? "?" + search : ""),
    );
  }
  let page = window.O4K9_ROUTES[pathname] || "home";
  const device = innerWidth < 768 ? "mobile" : "desktop";
  frame.style.visibility = "hidden";
  frame.src = `/o4k9/pages/${page}-${device}.html?mode=${mode}&${search}`;
  frame.dataset.device = device;
  resize();
  document
    .getElementById("mode-proposed")
    .setAttribute("aria-pressed", String(mode === "proposed"));
  document
    .getElementById("mode-baseline")
    .setAttribute("aria-pressed", String(mode === "baseline"));
}
function resize() {
  const mobile = frame.dataset.device === "mobile";
  const scale = mobile ? innerWidth / 320 : 1;
  frame.style.width = mobile ? "320px" : "100%";
  frame.style.height = innerHeight / scale + "px";
  frame.style.transform = `scale(${scale})`;
}
window.addEventListener("hashchange", route);
let wasMobile = innerWidth < 768;
window.addEventListener("resize", () => {
  if (wasMobile !== innerWidth < 768) {
    wasMobile = innerWidth < 768;
    route();
  } else resize();
});
window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow)
    return;
  const msg = event.data;
  if (msg?.type === "o4k9:ready" && msg.url === frame.src)
    frame.style.visibility = "visible";
  if (
    msg?.type === "o4k9:navigate" &&
    typeof msg.path === "string" &&
    msg.path.startsWith("/")
  ) {
    frame.style.visibility = "hidden";
    const next = "#" + msg.path;
    if (location.hash === next) route();
    else location.hash = next;
  }
  if (msg?.type === "o4k9:review") review.showModal();
  if (msg?.type === "o4k9:title")
    document.title =
      msg.title + (mode === "proposed" ? " · Proposed" : " · Original");
});
document.getElementById("review-toggle").onclick = () => review.showModal();
document.getElementById("review-close").onclick = () => review.close();
document.getElementById("mode-proposed").onclick = () => {
  mode = "proposed";
  review.close();
  route();
};
document.getElementById("mode-baseline").onclick = () => {
  mode = "baseline";
  review.close();
  route();
};
document.getElementById("download-feedback").onclick = () => {
  const text = `O4K9 original-site improvement review\nDate: ${new Date().toLocaleDateString("en-US")}\nDecision: ${document.getElementById("decision").value}\n\n${document.getElementById("feedback").value}\n\nDesign review only. No live changes or publication.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "O4K9-specific-changes-review.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
if (query.has("capture"))
  document.getElementById("review-toggle").hidden = true;
route();
