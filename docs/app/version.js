window._BUILD_TIME = "2026-02-16-21:15";
window._VERSION = "1.1.0";
console.log("MedidaGeo App carregado:", window._BUILD_TIME);

// Force clear any old cache
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      if (name.includes('workbox') || name.includes('precache')) {
        caches.delete(name);
      }
    });
  });
}