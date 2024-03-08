document.addEventListener("DOMContentLoaded", function() {
    let streams = [];
    let imageCaptures = [];
    let imageCounts = [];

    function requestCameraPermission(containerId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Solicitar permisos y acceder a la cámara
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streams[containerId] = stream;

                // Obtener una instancia de ImageCapture desde la transmisión de la cámara
                const track = stream.getVideoTracks()[0];
                imageCaptures[containerId] = new ImageCapture(track);

                // Mostrar el botón de captura
                document.querySelector(`.open-camera-button[data-id="${containerId}"]`).style.display = "none";
                document.querySelector(`.take-photo-button[data-id="${containerId}"]`).style.display = "block";
                document.querySelector(`.photo-container[data-id="${containerId}"]`).style.display = "block";

                resolve();
            } catch (error) {
                console.error(`Error al abrir la cámara en container ${containerId}:`, error);
                reject(error);
            }
        });
    }

    function takePhoto(containerId) {
        // Capturar una foto y agregarla a la lista
        const imageCapture = imageCaptures[containerId];
        const imageCount = imageCounts[containerId];

        if (imageCapture && imageCount !== undefined) {
            imageCapture.takePhoto()
                .then(blob => {
                    const url = URL.createObjectURL(blob);

                    // Crear un elemento de imagen y agregarlo a la lista
                    const img = document.createElement("img");
                    img.src = url;
                    img.alt = `Captured Image ${imageCount + 1}`;

                    // Crear una casilla de verificación y marcarla automáticamente
                    const checkbox = document.querySelector(`#check${containerId}`);
                    checkbox.checked = true; // Marcar automáticamente
                    checkbox.disabled = false; // Permitir que el usuario desmarque

                    // Agregar la imagen al contenedor
                    const container = document.querySelector(`.image-list-container[data-id="${containerId}"]`);
                    container.appendChild(img);

                    // Incrementar el contador de imágenes
                    imageCounts[containerId]++;
                })
                .catch(error => console.error(`Error al tomar la foto en container ${containerId}:`, error));
        }
    }

    function initializeContainer(containerId) {
        imageCounts[containerId] = 0;

        const openCameraButton = document.querySelector(`.open-camera-button[data-id="${containerId}"]`);
        const takePhotoButton = document.querySelector(`.take-photo-button[data-id="${containerId}"]`);
        const photoContainer = document.querySelector(`.photo-container[data-id="${containerId}"]`);

        openCameraButton.addEventListener("click", () => {
            requestCameraPermission(containerId).catch(error => console.error(error));
        });

        takePhotoButton.addEventListener("click", () => {
            takePhoto(containerId);
        });
    }

    // Inicializar los contenedores
    for (let i = 1; i <= 5; i++) {
        initializeContainer(i);
    }

    // Limpiar recursos al cerrar la página
    window.addEventListener("beforeunload", () => {
        for (const stream of streams) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    });
});


