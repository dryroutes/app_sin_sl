let map = L.map('map').setView([39.5, -0.3], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let nodos = [], origen = null, destino = null, rutaLine;

fetch("/nodos").then(r => r.json()).then(data => {
  nodos = data;
  data.forEach(n => {
    let marker = L.circleMarker([n.y, n.x], { radius: 4 }).addTo(map);
    marker.on('click', () => seleccionarNodo(n.id, [n.y, n.x]));
  });
});

function seleccionarNodo(id, coords) {
  if (!origen) {
    origen = id;
    alert("Origen seleccionado: " + id);
  } else if (!destino) {
    destino = id;
    alert("Destino seleccionado: " + id);
  }
}

function calcularRuta() {
  if (!origen || !destino) {
    alert("Selecciona origen y destino");
    return;
  }
  fetch("/ruta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origen, destino, criterio: "costo_total" })
  })
  .then(r => r.json())
  .then(data => {
    if (rutaLine) map.removeLayer(rutaLine);
    let puntos = data.ruta.map(p => [p.lat, p.lon]);
    rutaLine = L.polyline(puntos, { color: "blue" }).addTo(map);
    document.getElementById("info").textContent =
      `Ruta de ${data.nodos.length} nodos. Costo total: ${data.peso.toFixed(2)}`;
  })
  .catch(() => alert("No se pudo calcular la ruta."));
}
