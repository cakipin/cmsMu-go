import Alpine from "alpinejs";
import cmsStore from "./blocks/cms.store"; // Import logic yang tadi

// 1. Definisikan Token Global (jika dikirim dari server side render)
// window.authToken = '...';

// 2. Event Listener: Tunggu Alpine Siap
document.addEventListener("alpine:init", () => {
  // REGISTER COMPONENT: Kunci agar 'x-data="cms()"' dikenali
  Alpine.data("cms", cmsStore);

  console.log("Alpine CMS Component Registered!");
});

// 3. Start Alpine
Alpine.start();
