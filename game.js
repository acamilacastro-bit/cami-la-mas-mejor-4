
const $ = (id) => document.getElementById(id);

const canvas = $("world");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "nexusWorldSaveV1";
const TOTAL_CRISTALES = 5;

let jugador = {
  x: 400,
  y: 250,
  velocidad: 3,
  nivel: 1,
  experiencia: 0,
  monedas: 0,
  cristales: 0
};

let cristales = [];
let teclas = {};
let jugando = false;
let misionCompletada = false;
let ultimoTiempo = 0;

function crearCristales() {
  cristales = [];

  for (let i = 0; i < TOTAL_CRISTALES; i++) {
    cristales.push({
      x: 60 + Math.random() * 680,
      y: 60 + Math.random() * 380,
      recogido: false
    });
  }
}

function actualizarInterfaz() {
  $("playerInfo").textContent =
    `Nivel ${jugador.nivel} · ${jugador.monedas} monedas`;

  $("stats").textContent = `Nivel ${jugador.nivel}`;
  $("xp").textContent = `Experiencia: ${jugador.experiencia}`;
  $("coins").textContent = `Monedas: ${jugador.monedas}`;

  $("missionProgress").textContent =
    `Cristales: ${jugador.cristales}/${TOTAL_CRISTALES}`;

  $("mission").textContent = misionCompletada
    ? "¡Misión completada! Buscá nuevas aventuras."
    : "Recolectá 5 cristales de energía.";
}

function guardarPartida() {
  const datos = {
    jugador,
    cristales,
    misionCompletada
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(datos));
    $("menuMessage").textContent = "¡Partida guardada!";
  } catch (error) {
    $("menuMessage").textContent =
      "No se pudo guardar la partida en este navegador.";
  }
}

function cargarPartida() {
  try {
    const texto = localStorage.getItem(SAVE_KEY);
    if (!texto) return false;

    const datos = JSON.parse(texto);

    if (
      !datos.jugador ||
      !Array.isArray(datos.cristales) ||
      datos.cristales.length !== TOTAL_CRISTALES
    ) {
      return false;
    }

    const j = datos.jugador;

    for (const campo of [
      "x", "y", "nivel", "experiencia",
      "monedas", "cristales"
    ]) {
      if (!Number.isFinite(j[campo])) return false;
    }

    jugador = { ...jugador, ...j };
    jugador.x = Math.max(15, Math.min(785, jugador.x));
    jugador.y = Math.max(15, Math.min(485, jugador.y));

    cristales = datos.cristales.map(c => ({
      x: Number(c.x),
      y: Number(c.y),
      recogido: c.recogido === true
    }));

    if (cristales.some(c =>
      !Number.isFinite(c.x) ||
      !Number.isFinite(c.y) ||
      c.x < 0 || c.x > 800 ||
      c.y < 0 || c.y > 500
    )) {
      return false;
    }

    misionCompletada = datos.misionCompletada === true;
    actualizarInterfaz();
    return true;
  } catch (error) {
    return false;
  }
}

function iniciarPartida(nueva = false) {
  if (nueva) {
    jugador = {
      x: 400,
      y: 250,
      velocidad: 3,
      nivel: 1,
      experiencia: 0,
      monedas: 0,
      cristales: 0
    };

    misionCompletada = false;
    crearCristales();
    guardarPartida();
  } else if (!cargarPartida()) {
    jugador = {
      x: 400,
      y: 250,
      velocidad: 3,
      nivel: 1,
      experiencia: 0,
      monedas: 0,
      cristales: 0
    };

    misionCompletada = false;
    crearCristales();
  }

  $("menu").hidden = true;
  $("game").hidden = false;
  jugando = true;
  actualizarInterfaz();
  dibujar();
}

function recogerCristales() {
  for (const cristal of cristales) {
    if (cristal.recogido) continue;

    const dx = jugador.x - cristal.x;
    const dy = jugador.y - cristal.y;

    if (Math.hypot(dx, dy) < 23) {
      cristal.recogido = true;
      jugador.cristales++;
      jugador.monedas += 20;
      jugador.experiencia += 25;

      if (
        jugador.cristales >= TOTAL_CRISTALES &&
        !misionCompletada
      ) {
        misionCompletada = true;
        jugador.monedas += 100;
        jugador.experiencia += 50;
        agregarMensaje(
          "Nexus",
          "¡Excelente! Completaste la misión y ganaste 100 monedas extra."
        );
      } else {
        agregarMensaje(
          "Nexus",
          "¡Cristal encontrado! Ganaste 20 monedas."
        );
      }

      while (jugador.experiencia >= jugador.nivel * 100) {
        jugador.experiencia -= jugador.nivel * 100;
        jugador.nivel++;
        agregarMensaje(
          "Nexus",
          `¡Subiste al nivel ${jugador.nivel}!`
        );
      }

      actualizarInterfaz();
      guardarPartida();
    }
  }
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Suelo de la ciudad futurista.
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, 800, 500);

  // Calles.
  ctx.fillStyle = "#151d35";
  for (let x = 20; x < 800; x += 120) {
    ctx.fillRect(x, 0, 55, 500);
  }
  for (let y = 25; y < 500; y += 115) {
    ctx.fillRect(0, y, 800, 42);
  }

  // Luces del suelo.
  ctx.strokeStyle = "#273e6a";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 500);
    ctx.stroke();
  }
  for (let y = 0; y <= 500; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Edificios decorativos.
  for (let x = 35; x < 800; x += 120) {
    for (let y = 40; y < 500; y += 115) {
      ctx.fillStyle = "#20294a";
      ctx.fillRect(x, y, 32, 32);

      ctx.fillStyle = "#39d5ff";
      ctx.fillRect(x + 6, y + 6, 5, 5);
      ctx.fillRect(x + 20, y + 6, 5, 5);

      ctx.fillStyle = "#8055db";
      ctx.fillRect(x + 6, y + 18, 5, 5);
      ctx.fillRect(x + 20, y + 18, 5, 5);
    }
  }

  // Cristales recolectables.
  for (const cristal of cristales) {
    if (cristal.recogido) continue;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#b56cff";
    ctx.fillStyle = "#b56cff";
    ctx.beginPath();
    ctx.moveTo(cristal.x, cristal.y - 10);
    ctx.lineTo(cristal.x + 9, cristal.y);
    ctx.lineTo(cristal.x, cristal.y + 10);
    ctx.lineTo(cristal.x - 9, cristal.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Personaje.
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#39d5ff";
  ctx.fillStyle = "#39d5ff";
  ctx.beginPath();
  ctx.arc(jugador.x, jugador.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("JUGADOR", jugador.x, jugador.y - 20);
}

function actualizar(tiempo = 0) {
  if (!jugando) return;

  const delta = ultimoTiempo
    ? Math.min((tiempo - ultimoTiempo) / 16.67, 2)
    : 1;

  ultimoTiempo = tiempo;

  let dx = 0;
  let dy = 0;

  if (teclas.ArrowLeft || teclas.a) dx--;
  if (teclas.ArrowRight || teclas.d) dx++;
  if (teclas.ArrowUp || teclas.w) dy--;
  if (teclas.ArrowDown || teclas.s) dy++;

  // Evita que el movimiento diagonal sea más rápido.
  const longitud = Math.hypot(dx, dy);
  if (longitud > 0) {
    dx /= longitud;
    dy /= longitud;
  }

  jugador.x = Math.max(
    15,
    Math.min(785, jugador.x + dx * jugador.velocidad * delta)
  );

  jugador.y = Math.max(
    15,
    Math.min(485, jugador.y + dy * jugador.velocidad * delta)
  );

  recogerCristales();
  dibujar();
  requestAnimationFrame(actualizar);
}

function agregarMensaje(autor, mensaje) {
  const parrafo = document.createElement("p");
  const nombre = document.createElement("strong");

  nombre.textContent = autor + ": ";
  parrafo.append(nombre, document.createTextNode(mensaje));

  $("chatLog").appendChild(parrafo);
  $("chatLog").scrollTop = $("chatLog").scrollHeight;
}

function responderNexus(pregunta) {
  const texto = pregunta.toLowerCase();

  if (texto.includes("mision")) {
    return misionCompletada
      ? "Ya completaste tu primera misión. ¡Seguí explorando!"
      : "Buscá los cristales violetas que brillan por toda Neo City. Necesitás cinco.";
  }

  if (texto.includes("nivel") || texto.includes("experiencia")) {
    return "Cada cristal te da 25 puntos de experiencia. ¡Reuní cristales para subir de nivel!";
  }

  if (texto.includes("moneda")) {
    return "Cada cristal te da 20 monedas y completar la misión otorga 100 adicionales.";
  }

  if (texto.includes("mover") || texto.includes("control")) {
    return "Usá WASD o las flechas del teclado para recorrer la ciudad.";
  }

  if (texto.includes("cristal") || texto.includes("objeto")) {
    return "Los cristales violetas son objetos coleccionables. Acercate a ellos para recogerlos.";
  }

  return "Soy Nexus AI, tu asistente de Neo City. Preguntame sobre misiones, niveles, monedas, cristales o controles.";
}

$("startBtn").addEventListener("click", () => iniciarPartida(true));

$("continueBtn").addEventListener("click", () => iniciarPartida(false));

$("profileBtn").addEventListener("click", () => {
  if (!cargarPartida()) {
    $("menuMessage").textContent =
      "Todavía no hay una partida guardada.";
    return;
  }

  $("menuMessage").textContent =
    `Nivel ${jugador.nivel} · ${jugador.monedas} monedas · ` +
    `${jugador.cristales} cristales encontrados.`;
});

$("saveBtn").addEventListener("click", guardarPartida);

$("homeBtn").addEventListener("click", () => {
  guardarPartida();
  jugando = false;
  ultimoTiempo = 0;
  $("game").hidden = true;
  $("menu").hidden = false;
});

$("chatForm").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const entrada = $("question");
  const pregunta = entrada.value.trim();

  if (!pregunta) return;

  agregarMensaje("Vos", pregunta);
  agregarMensaje("Nexus", responderNexus(pregunta));
  entrada.value = "";
});

window.addEventListener("keydown", (evento) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evento.key)
  ) {
    evento.preventDefault();
  }

  teclas[evento.key] = true;
  teclas[evento.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (evento) => {
  teclas[evento.key] = false;
  teclas[evento.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  teclas = {};
});

crearCristales();
actualizarInterfaz();
