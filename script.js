let map = L.map("map").setView([39.5, -0.4], 10); // Centrado en Valencia

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let nodos = {};
let aristas = [];
let origen = null;
let destino = null;

// Cargar nodos desde múltiples archivos
const nodosArchivos = ["nodos_1.json", "nodos_2.json", "nodos_3.json", "nodos_4.json"];
const aristasArchivos = [
  "aristas_1.json", "aristas_2.json", "aristas_3.json", "aristas_4.json", "aristas_5.json",
  "aristas_6.json", "aristas_7.json", "aristas_8.json", "aristas_9.json", "aristas_10.json",
  "aristas_11.json", "aristas_12.json", "aristas_13.json", "aristas_14.json"
];

Promise.all(nodosArchivos.map(f => fetch(f).then(r => r.json())))
  .then(data => {
    data.flat().forEach(n => {
      nodos[n.id] = n;
      const marker = L.circleMarker([n.y, n.x], { radius: 4 }).addTo(map);
      marker.on("click", () => seleccionarNodo(n.id, marker));
    });
    return Promise.all(aristasArchivos.map(f => fetch(f).then(r => r.json())));
  })
  .then(data => {
    aristas = data.flat();
    console.log(`Cargados ${Object.keys(nodos).length} nodos y ${aristas.length} aristas`);
  });

function seleccionarNodo(id, marker) {
  if (!origen) {
    origen = id;
    marker.setStyle({ color: "green" });
  } else if (!destino) {
    destino = id;
    marker.setStyle({ color: "red" });
  } else {
    alert("Ya se han seleccionado dos nodos");
  }
}

function calcularRuta() {
  if (!origen || !destino) {
    alert("Selecciona origen y destino");
    return;
  }

  // Construir grafo como diccionario
  let G = {};
  for (let arista of aristas) {
    if (!G[arista.origen]) G[arista.origen] = [];
    G[arista.origen].push({ destino: arista.destino, peso: arista.costo_total });
  }

  let ruta = dijkstra(G, origen, destino);
  if (!ruta) {
    alert("No hay ruta disponible");
    return;
  }

  let puntos = ruta.map(n => [nodos[n].y, nodos[n].x]);
  L.polyline(puntos, { color: "blue", weight: 4 }).addTo(map);
}

// Algoritmo de Dijkstra sencillo
function dijkstra(grafo, inicio, fin) {
  let dist = {};
  let prev = {};
  let Q = new Set(Object.keys(grafo));

  for (let nodo of Q) {
    dist[nodo] = Infinity;
    prev[nodo] = null;
  }
  dist[inicio] = 0;

  while (Q.size > 0) {
    let u = [...Q].reduce((a, b) => (dist[a] < dist[b] ? a : b));
    Q.delete(u);

    if (u === fin) break;
    if (!grafo[u]) continue;

    for (let v of grafo[u]) {
      let alt = dist[u] + v.peso;
      if (alt < dist[v.destino]) {
        dist[v.destino] = alt;
        prev[v.destino] = u;
      }
    }
  }

  let S = [];
  let u = fin;
  while (u) {
    S.unshift(u);
    u = prev[u];
  }
  return S[0] === inicio ? S : null;
}
