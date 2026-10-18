import cmsStore from "./cms.store";

// Event Listener: Tunggu Alpine Siap
if (typeof document !== "undefined") {
  document.addEventListener("alpine:init", () => {
    const Alpine = (window as any).Alpine;
    if (Alpine) {
      Alpine.data("cms", cmsStore);
      console.log("Alpine CMS Component Registered!");
    }
  });
}
