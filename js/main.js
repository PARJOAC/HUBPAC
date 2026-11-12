// ==========================================================================
// Funcionalidad Principal de HUBPAC OS
// ==========================================================================

const FONDO_POR_DEFECTO =
  "img/fondos/7.jpg";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar reloj del sistema
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // Cargar fondo de pantalla guardado (si existe y es válido)
  let fondoGuardado = localStorage.getItem("hubpac-wallpaper");
  if (
    !fondoGuardado ||
    fondoGuardado === "undefined" ||
    fondoGuardado === "null" ||
    !fondoGuardado.startsWith("http")
  ) {
    fondoGuardado = FONDO_POR_DEFECTO;
  }
  changeWallpaper(fondoGuardado, null);

  // Marcar miniatura activa en configuración
  document.querySelectorAll(".wallpaper-thumb").forEach((miniatura) => {
    const attrOnclick = miniatura.getAttribute("onclick") || "";
    if (attrOnclick.includes(fondoGuardado)) {
      miniatura.classList.add("active");
    } else {
      miniatura.classList.remove("active");
    }
  });

  // Habilitar arrastre de ventanas
  configurarVentanasArrastrables();
});

// ==========================================================================
// Gestión de Capas y Profundidad (Z-Index)
// ==========================================================================
let mayorZ = 10;

function bringToFront(windowId) {
  mayorZ++;
  const ventana = document.getElementById(windowId);
  if (!ventana) return;
  ventana.style.zIndex = mayorZ;

  // Remover clase activa de todas las ventanas y activar la actual
  document
    .querySelectorAll(".os-window")
    .forEach((v) => v.classList.remove("active"));
  ventana.classList.add("active");
}

// ==========================================================================
// Control de Ventanas (Abrir, Cerrar, Maximizar, Minimizar)
// ==========================================================================
function openWindow(appId) {
  const ventana = document.getElementById(`window-${appId}`);
  if (ventana) {
    ventana.style.display = "flex";
    bringToFront(`window-${appId}`);

    // Actualizar indicador en el Dock
    const itemDock = document.getElementById(`dock-${appId}`);
    if (itemDock) {
      itemDock.classList.add("is-open");
    }

    // En pantallas móviles abrir directamente maximizada
    if (window.innerWidth <= 480) {
      ventana.classList.add("maximized");
    }

    // Reiniciar animación de apertura
    ventana.style.animation = "none";
    ventana.offsetHeight; /* Forzar reflujo */
    ventana.style.animation = "popIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
  }
}

function closeWindow(appId) {
  const ventana = document.getElementById(`window-${appId}`);
  if (ventana) {
    ventana.style.display = "none";
    ventana.classList.remove("maximized");

    // Remover indicador en el Dock
    const itemDock = document.getElementById(`dock-${appId}`);
    if (itemDock) {
      itemDock.classList.remove("is-open");
    }
  }
}

function toggleMaximize(appId) {
  const ventana = document.getElementById(`window-${appId}`);
  if (ventana) {
    ventana.classList.toggle("maximized");
    bringToFront(`window-${appId}`);
  }
}

function minimizeWindow(appId) {
  const ventana = document.getElementById(`window-${appId}`);
  if (ventana) {
    ventana.style.animation = "popOut 0.25s ease forwards";
    setTimeout(() => {
      ventana.style.display = "none";
      ventana.style.animation = "";
      const itemDock = document.getElementById(`dock-${appId}`);
      if (itemDock) {
        itemDock.classList.remove("is-open");
      }
    }, 250);
  }
}

// ==========================================================================
// Reloj del Sistema
// ==========================================================================
function actualizarReloj() {
  const ahora = new Date();
  const horaTexto = ahora.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const elementoReloj = document.getElementById("clock");
  if (elementoReloj) {
    elementoReloj.textContent = horaTexto;
  }
}

// ==========================================================================
// Arrastre de Ventanas
// ==========================================================================
function configurarVentanasArrastrables() {
  const ventanas = document.querySelectorAll(".os-window");

  ventanas.forEach((ventana) => {
    const cabecera = ventana.querySelector(".window-header");
    if (!cabecera) return;

    // Traer al frente al hacer clic en cualquier parte de la ventana
    ventana.addEventListener("mousedown", () => {
      bringToFront(ventana.id);
    });

    let arrastrando = false;
    let compensacionX, compensacionY;

    cabecera.addEventListener("mousedown", (e) => {
      arrastrando = true;
      compensacionX = e.clientX - ventana.offsetLeft;
      compensacionY = e.clientY - ventana.offsetTop;
      ventana.style.transition = "none"; // Desactivar transición durante el arrastre
    });

    document.addEventListener("mousemove", (e) => {
      if (arrastrando) {
        const nuevaX = e.clientX - compensacionX;
        const nuevaY = e.clientY - compensacionY;

        ventana.style.left = `${nuevaX}px`;
        ventana.style.top = `${nuevaY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (arrastrando) {
        arrastrando = false;
        ventana.style.transition = ""; // Restaurar transición
      }
    });
  });
}

// ==========================================================================
// Selector de Fondos de Pantalla
// ==========================================================================
function setWallpaper(url) {
  changeWallpaper(url, null);
}

function changeWallpaper(url, miniaturaClickeada) {
  if (!url) return;

  // Aplicar variable CSS y elemento de fondo directo
  document.documentElement.style.setProperty("--bg-wallpaper", `url('${url}')`);
  const elementoFondo = document.querySelector(".wallpaper");
  if (elementoFondo) {
    elementoFondo.style.backgroundImage = `url('${url}')`;
  }

  // Guardar preferencia en localStorage
  try {
    localStorage.setItem("hubpac-wallpaper", url);
  } catch (_) {}

  // Actualizar indicador visual en las miniaturas
  document.querySelectorAll(".wallpaper-thumb").forEach((miniatura) => {
    miniatura.classList.remove("active");
  });
  if (miniaturaClickeada) {
    miniaturaClickeada.classList.add("active");
  }
}

// ==========================================================================
// Ayudantes de Copia al Portapapeles
// ==========================================================================
function copyText(texto, boton) {
  const notificarExito = () => {
    const htmlOriginal = boton.innerHTML;
    boton.innerHTML =
      '<i class="fa-solid fa-check text-success me-1"></i> ¡Copiado!';
    boton.classList.add("btn-success-subtle");

    setTimeout(() => {
      boton.innerHTML = htmlOriginal;
      boton.classList.remove("btn-success-subtle");
    }, 2200);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(texto)
      .then(notificarExito)
      .catch(() => {
        copiarMetodoAntiguo(texto);
        notificarExito();
      });
  } else {
    copiarMetodoAntiguo(texto);
    notificarExito();
  }
}

// Alias para compatibilidad con el botón de IP de Minecraft
function copyIp(ip, boton) {
  copyText(ip, boton);
}

function copiarMetodoAntiguo(texto) {
  const inputTemporal = document.createElement("textarea");
  inputTemporal.value = texto;
  inputTemporal.style.position = "fixed";
  inputTemporal.style.left = "-9999px";
  document.body.appendChild(inputTemporal);
  inputTemporal.focus();
  inputTemporal.select();
  try {
    document.execCommand("copy");
  } catch (_) {}
  document.body.removeChild(inputTemporal);
}

// ==========================================================================
// Selector de Asunto Rápido
// ==========================================================================
function setAsunto(valor) {
  const inputAsunto = document.getElementById("contact-asunto");
  const inputSubject = document.getElementById("contact-subject");
  if (inputAsunto) inputAsunto.value = valor;
  if (inputSubject) inputSubject.value = valor;
}

// ==========================================================================
// Selector de Asunto Rápido
// ==========================================================================
function setAsunto(valor) {
  const inputSubject = document.getElementById("contact-subject");
  if (inputSubject) inputSubject.value = valor;
}

// ==========================================================================
// Controlador del Formulario de Contacto
// ==========================================================================
const formularioContacto =
  document.getElementById("contact-form") ||
  document.querySelector("#window-contact form");
const alertaContacto = document.getElementById("contact-alert");

function mostrarAlertaContacto(mensaje, tipo = "success") {
  if (!alertaContacto) return;
  alertaContacto.className = `alert alert-${tipo} mb-3 py-2 px-3 small rounded-3`;
  alertaContacto.innerHTML = mensaje;
  alertaContacto.classList.remove("d-none");
}

function ocultarAlertaContacto() {
  if (alertaContacto) {
    alertaContacto.classList.add("d-none");
  }
}

if (formularioContacto) {
  formularioContacto.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarAlertaContacto();

    const boton =
      document.getElementById("contact-submit-btn") ||
      formularioContacto.querySelector('button[type="submit"]');
    const textoBoton = document.getElementById("contact-btn-text");
    const htmlOriginalBoton = boton.innerHTML;

    // Estado visual de carga
    boton.disabled = true;
    if (textoBoton) {
      textoBoton.innerText = "Enviando mensaje...";
    } else {
      boton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin me-2"></i> Enviando...';
    }

    const datosFormulario = new FormData(formularioContacto);

    // Obtener el valor del Asunto según la documentación oficial de Formspree (name="subject") y la plantilla
    const campoAsunto =
      document.getElementById("contact-asunto") ||
      formularioContacto.querySelector('[name="asunto"]') ||
      formularioContacto.querySelector('[name="subject"]');

    const valorAsunto = campoAsunto?.value?.trim() || "Consulta General";

    // Enviar 'subject' (oficial Formspree) y 'asunto' / 'Asunto' (para plantillas y webhooks en español)
    datosFormulario.set("subject", valorAsunto);
    datosFormulario.set("Subject", valorAsunto);
    datosFormulario.set("asunto", valorAsunto);
    datosFormulario.set("Asunto", valorAsunto);

    // Eliminar _subject legacy para evitar conflictos con la directiva oficial de Formspree
    datosFormulario.delete("_subject");

    try {
      const respuesta = await fetch(formularioContacto.action, {
        method: "POST",
        body: datosFormulario,
        headers: {
          Accept: "application/json",
        },
      });

      if (respuesta.ok) {
        // Envío exitoso por AJAX
        if (textoBoton) textoBoton.innerText = "¡Mensaje Enviado!";
        boton.classList.replace("btn-primary", "btn-success");
        mostrarAlertaContacto(
          '<i class="fa-solid fa-circle-check me-2"></i>¡Mensaje enviado con éxito! Te responderé lo antes posible.',
          "success",
        );
        formularioContacto.reset();

        setTimeout(() => {
          boton.innerHTML = htmlOriginalBoton;
          boton.classList.replace("btn-success", "btn-primary");
          boton.disabled = false;
          ocultarAlertaContacto();
          closeWindow("contact");
        }, 3000);
      } else {
        let datosError = {};
        try {
          datosError = await respuesta.json();
        } catch (_) {}

        const mensajeError = (datosError.error || "").toLowerCase();

        // Si Formspree bloquea el envío AJAX por verificación reCAPTCHA
        if (
          respuesta.status === 403 ||
          mensajeError.includes("recaptcha") ||
          mensajeError.includes("custom key")
        ) {
          mostrarAlertaContacto(
            '<i class="fa-solid fa-shield-halved me-2"></i>Formspree requiere verificación anti-spam. Redirigiendo para confirmar el envío...',
            "warning",
          );

          // Envío nativo automático para resolver el captcha en Formspree sin perder los datos
          setTimeout(() => {
            formularioContacto.submit();
          }, 1400);
          return;
        }

        throw new Error(datosError.error || `Error ${respuesta.status}`);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      mostrarAlertaContacto(
        '<i class="fa-solid fa-triangle-exclamation me-2"></i>No se pudo enviar el mensaje directamente. Puedes intentarlo de nuevo.',
        "danger",
      );

      if (textoBoton) textoBoton.innerText = "Error al enviar";
      boton.classList.replace("btn-primary", "btn-danger");

      setTimeout(() => {
        boton.innerHTML = htmlOriginalBoton;
        boton.classList.replace("btn-danger", "btn-primary");
        boton.disabled = false;
      }, 3000);
    }
  });
}
