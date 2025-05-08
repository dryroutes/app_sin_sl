let mapa = L.map('map').setView([39.5, -0.4], 12);  // ajusta coordenadas según tus nodos
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

const map = L.map('map').setView([39.5, -0.4], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);


let nodos = {};
let aristas = [];
let seleccion = [];
let marcadores = [];
let rutaLayer = null;

// Cargar múltiples archivos nodos y aristas
const cargarJSON = async () => {
  for (let i = 1; i <= 4; i++) {
    const r = await fetch(`nodos_${i}.json`);
    const datos = await r.json();
    datos.forEach(n => {
      nodos[n.id] = n;
    });
  }
  for (let i = 1; i <= 14; i++) {
    const r = await fetch(`aristas_${i}.json`);
    const datos = await r.json();
    aristas.push(...datos);
  }
  mostrarNodos();
};

const mostrarNodos = () => {
  Object.values(nodos).forEach(n => {
    if (!n.x || !n.y) return;
    const marker = L.circleMarker([n.y, n.x], { radius: 3 }).addTo(mapa);
    marker.on('click', () => seleccionarNodo(n.id));
  });
};

const seleccionarNodo = (id) => {
  if (seleccion.length >= 2) {
    seleccion = [];
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];
    if (rutaLayer) mapa.removeLayer(rutaLayer);
  }
  seleccion.push(id);
  const nodo = nodos[id];
  const m = L.marker([nodo.y, nodo.x]).addTo(mapa);
  marcadores.push(m);
};

const calcularRuta = () => {
  if (seleccion.length < 2) {
    alert("Selecciona origen y destino.");
    return;
  }

  const grafo = construirGrafo();
  const ruta = dijkstra(grafo, seleccion[0], seleccion[1]);

  if (!ruta) {
    alert("No hay ruta.");
    return;
  }

  const puntos = ruta.map(id => [nodos[id].y, nodos[id].x]);
  if (rutaLayer) mapa.removeLayer(rutaLayer);
  rutaLayer = L.polyline(puntos, { color: 'blue', weight: 4 }).addTo(mapa);
};

const construirGrafo = () => {
  const grafo = {};
  aristas.forEach(a => {
    if (!(a.origen in grafo)) grafo[a.origen] = [];
    grafo[a.origen].push({ id: a.destino, peso: a.costo_total ?? 1 });
  });
  return grafo;
};

const dijkstra = (grafo, inicio, fin) => {
  const dist = {};
  const prev = {};
  const Q = new Set(Object.keys(grafo));
  Q.forEach(n => dist[n] = Infinity);
  dist[inicio] = 0;

  while (Q.size) {
    const u = [...Q].reduce((a, b) => dist[a] < dist[b] ? a : b);
    Q.delete(u);
    if (u === fin) break;
    if (!grafo[u]) continue;

    grafo[u].forEach(({ id: v, peso }) => {
      const alt = dist[u] + peso;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    });
  }

  const ruta = [];
  let u = fin;
  while (u) {
    ruta.unshift(u);
    u = prev[u];
  }
  return ruta.length > 1 ? ruta : null;
};

cargarJSON();
