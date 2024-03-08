document.querySelectorAll(".canvas").forEach($canvas => {
    const field = $canvas.dataset.field;
    const $btnDescargar = document.querySelector(`.btnDescargar[data-field="${field}"]`);
    const $btnLimpiar = document.querySelector(`.btnLimpiar[data-field="${field}"]`);
    const $btnGenerarDocumento = document.querySelector(`.btnGenerarDocumento[data-field="${field}"]`);
    const contexto = $canvas.getContext("2d");
    const COLOR_PINCEL = "black";
    const COLOR_FONDO = "white";
    const GROSOR = 2;
    let xAnterior = 0, yAnterior = 0, xActual = 0, yActual = 0;
    const obtenerXReal = (clientX) => clientX - $canvas.getBoundingClientRect().left;
    const obtenerYReal = (clientY) => clientY - $canvas.getBoundingClientRect().top;
    let haComenzadoDibujo = false; // Bandera que indica si el usuario está presionando el botón del mouse sin soltarlo


    const limpiarCanvas = () => {
        // Colocar color blanco en fondo de canvas
        contexto.fillStyle = COLOR_FONDO;
        contexto.fillRect(0, 0, $canvas.width, $canvas.height);
    };
    limpiarCanvas();
    $btnLimpiar.onclick = limpiarCanvas;
    // Escuchar clic del botón para descargar el canvas
    $btnDescargar.onclick = () => {
        const enlace = document.createElement('a');
        // El título
        enlace.download = "Firma.png";
        // Convertir la imagen a Base64 y ponerlo en el enlace
        enlace.href = $canvas.toDataURL();
        // Hacer click en él
        enlace.click();
    };

    window.obtenerImagen = () => {
        return $canvas.toDataURL();
    };

    $btnGenerarDocumento.onclick = () => {
        window.open("documento.html");
    };
    const onClicOToqueIniciado = evento => {
        // En este evento solo se ha iniciado el clic, así que dibujamos un punto
        xAnterior = xActual;
        yAnterior = yActual;
        xActual = obtenerXReal(evento.clientX);
        yActual = obtenerYReal(evento.clientY);
        contexto.beginPath();
        contexto.fillStyle = COLOR_PINCEL;
        contexto.fillRect(xActual, yActual, GROSOR, GROSOR);
        contexto.closePath();
        // Y establecemos la bandera
        haComenzadoDibujo = true;
    }

    const onMouseODedoMovido = evento => {
        evento.preventDefault(); // Prevenir scroll en móviles
        if (!haComenzadoDibujo) {
            return;
        }
        // El mouse se está moviendo y el usuario está presionando el botón, así que dibujamos todo
        let target = evento;
        if (evento.type.includes("touch")) {
            target = evento.touches[0];
        }
        xAnterior = xActual;
        yAnterior = yActual;
        xActual = obtenerXReal(target.clientX);
        yActual = obtenerYReal(target.clientY);
        contexto.beginPath();
        contexto.moveTo(xAnterior, yAnterior);
        contexto.lineTo(xActual, yActual);
        contexto.strokeStyle = COLOR_PINCEL;
        contexto.lineWidth = GROSOR;
        contexto.stroke();
        contexto.closePath();
    }
    const onMouseODedoLevantado = () => {
        haComenzadoDibujo = false;
    };

    // Lo demás tiene que ver con pintar sobre el canvas en los eventos del mouse
    ["mousedown", "touchstart"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onClicOToqueIniciado);
    });

    ["mousemove", "touchmove"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onMouseODedoMovido);
    });
    ["mouseup", "touchend"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onMouseODedoLevantado);
    });
});

  document.addEventListener("DOMContentLoaded", function() {
    const openCameraButton = document.getElementById("openCamera");
    const takePhotoButton = document.getElementById("takePhoto");
    const photoContainer = document.getElementById("photoContainer");
    const imageListContainer = document.getElementById("imageList");
    let stream, imageCapture;
    let imageCount = 0;

    openCameraButton.addEventListener("click", async () => {
        try {
            // Solicitar permisos y acceder a la cámara
            stream = await navigator.mediaDevices.getUserMedia({ video: true });

            // Obtener una instancia de ImageCapture desde la transmisión de la cámara
            const track = stream.getVideoTracks()[0];
            imageCapture = new ImageCapture(track);

            // Mostrar el botón de captura
            openCameraButton.style.display = "none";
            takePhotoButton.style.display = "block";
            photoContainer.style.display = "block";
        } catch (error) {
            console.error("Error al abrir la cámara:", error);
        }
    });

    takePhotoButton.addEventListener("click", () => {
        // Capturar una foto y agregarla a la lista
        if (imageCapture) {
            imageCapture.takePhoto()
                .then(blob => {
                    const url = URL.createObjectURL(blob);

                    // Crear un elemento de imagen y agregarlo a la lista
                    const img = document.createElement("img");
                    img.src = url;
                    img.alt = "Captured Image " + (imageCount + 1);
                    imageListContainer.appendChild(img);

                    // Incrementar el contador de imágenes
                    imageCount++;
                })
                .catch(error => console.error("Error al tomar la foto:", error));
        }
    });

    // Limpiar recursos al cerrar la página
    window.addEventListener("beforeunload", () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
});