import './style.css';

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Timer } from 'three';


// ============================================================
// CONFIGURACIÓN DEL DISPOSITIVO
// ============================================================

function getDeviceType() {

    const width = window.innerWidth;

    if (width <= 480) {
        return 'mobile';
    }

    if (width <= 768) {
        return 'tablet';
    }

    return 'desktop';
}


let deviceType = getDeviceType();


// ============================================================
// LOADING MANAGER
// ============================================================

const loadingManager =
    new THREE.LoadingManager();


// Elementos del Loading Manager
const loaderScreen =
    document.getElementById('loader');

const loaderProgress =
    document.getElementById('loader-progress');

const loaderText =
    document.getElementById('loader-text');


// ============================================================
// INICIO DE CARGA
// ============================================================

loadingManager.onStart =
    function (url, itemsLoaded, itemsTotal) {

        console.log(
            `Iniciando carga: ${url}`
        );

        if (loaderScreen) {
            loaderScreen.classList.remove(
                'loader-hidden'
            );
        }
    };


// ============================================================
// PROGRESO
// ============================================================

loadingManager.onProgress =
    function (
        url,
        itemsLoaded,
        itemsTotal
    ) {

        const progress =
            Math.round(
                (itemsLoaded /
                    itemsTotal) *
                100
            );


        //console.log(`Cargando: ${progress}%`);


        // Barra de progreso
        if (loaderProgress) {

            loaderProgress.style.width =
                `${progress}%`;
        }


        // Texto
        if (loaderText) {

            loaderText.textContent =
                `Cargando experiencia 3D... ${progress}%`;
        }
    };


// ============================================================
// CARGA COMPLETADA
// ============================================================

loadingManager.onLoad =
    function () {

        console.log(
            'Todos los recursos han sido cargados.'
        );


        if (loaderText) {

            loaderText.textContent =
                'Experiencia 3D lista';
        }


        if (loaderProgress) {

            loaderProgress.style.width =
                '100%';
        }


        // Pequeña pausa para que
        // el usuario vea el 100%
        setTimeout(() => {

            if (loaderScreen) {

                loaderScreen.classList.add(
                    'loader-hidden'
                );
            }

        }, 500);
    };


// ============================================================
// ERROR DE CARGA
// ============================================================

loadingManager.onError =
    function (url) {

        console.error(
            `Error cargando: ${url}`
        );


        if (loaderText) {

            loaderText.textContent =
                'No se pudo cargar uno de los recursos.';
        }
    };


// ============================================================
// ESCENA
// ============================================================

const scene =
    new THREE.Scene();


// Niebla
scene.fog =
    new THREE.FogExp2(
        0x050b14,
        0.05
    );


// ============================================================
// CONTENEDOR
// ============================================================

const canvasContainer =
    document.querySelector(
        '.canvas-container'
    );


// ============================================================
// DIMENSIONES INICIALES
// ============================================================

const initialWidth =
    canvasContainer
        ? canvasContainer.clientWidth
        : window.innerWidth;


const initialHeight =
    canvasContainer
        ? canvasContainer.clientHeight
        : window.innerHeight;


// ============================================================
// CÁMARA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        deviceType === 'mobile'
            ? 50
            : 45,

        initialWidth /
            initialHeight,

        0.1,

        100
    );


// ============================================================
// POSICIÓN DE CÁMARA
// ============================================================

function setCameraPosition() {

    if (deviceType === 'mobile') {

        camera.position.set(
            0,
            1.55,
            5.2
        );

    } else if (deviceType === 'tablet') {

        camera.position.set(
            0,
            1.5,
            4.8
        );

    } else {

        camera.position.set(
            0,
            1.5,
            4.5
        );
    }
}


setCameraPosition();


// ============================================================
// RENDERER
// ============================================================

const canvas =
    document.getElementById(
        'avatar-canvas'
    );


// Si no existe #avatar-canvas,
// creamos uno automáticamente
const rendererCanvas =
    canvas ||
    document.createElement('canvas');


if (!canvas) {

    rendererCanvas.id =
        'avatar-canvas';

    if (canvasContainer) {

        canvasContainer.appendChild(
            rendererCanvas
        );

    } else {

        document.body.appendChild(
            rendererCanvas
        );
    }
}


const renderer =
    new THREE.WebGLRenderer({

        canvas:
            rendererCanvas,

        antialias:
            true,

        powerPreference:
            'high-performance'
    });


// ============================================================
// PIXEL RATIO
// ============================================================

function updatePixelRatio() {

    const maxPixelRatio =
        deviceType === 'mobile'
            ? 1.5
            : 2;


    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            maxPixelRatio
        )
    );
}


updatePixelRatio();


// ============================================================
// TAMAÑO DEL RENDERER
// ============================================================

function updateRendererSize() {

    const container =
        document.querySelector(
            '.canvas-container'
        );


    const width =
        container
            ? container.clientWidth
            : window.innerWidth;


    const height =
        container
            ? container.clientHeight
            : window.innerHeight;


    renderer.setSize(
        width,
        height,
        false
    );


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();
}


updateRendererSize();


// ============================================================
// SOMBRAS
// ============================================================

renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


// En móviles podemos reducir
// ligeramente el coste de sombras
if (deviceType === 'mobile') {

    renderer.shadowMap.autoUpdate =
        true;
}


// ============================================================
// ORBIT CONTROLS
// ============================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );


// Suavidad
controls.enableDamping =
    true;


controls.dampingFactor =
    0.05;


// No desplazar la escena
controls.enablePan =
    false;


// Objetivo
controls.target.set(
    0,
    1,
    0
);


// Zoom
controls.enableZoom =
    true;


controls.minDistance =
    deviceType === 'mobile'
        ? 3.2
        : 2.8;


controls.maxDistance =
    deviceType === 'mobile'
        ? 7
        : 6;


// Velocidad de rotación
controls.rotateSpeed =
    deviceType === 'mobile'
        ? 0.45
        : 0.7;


// Velocidad del zoom
controls.zoomSpeed =
    deviceType === 'mobile'
        ? 0.5
        : 0.8;


// Evitar mirar demasiado
// hacia arriba/abajo
controls.minPolarAngle =
    THREE.MathUtils.degToRad(
        55
    );


controls.maxPolarAngle =
    THREE.MathUtils.degToRad(
        100
    );


controls.update();


// ============================================================
// ILUMINACIÓN
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.8
    );

scene.add(
    ambientLight
);


// Luz principal
const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


mainLight.position.set(
    3,
    5,
    3
);


mainLight.castShadow =
    true;


// Configuración de sombra
mainLight.shadow.mapSize.width =
    deviceType === 'mobile'
        ? 1024
        : 2048;


mainLight.shadow.mapSize.height =
    deviceType === 'mobile'
        ? 1024
        : 2048;


mainLight.shadow.camera.near =
    0.1;


mainLight.shadow.camera.far =
    20;


scene.add(
    mainLight
);


// ============================================================
// RIM LIGHT
// ============================================================

const rimLight =
    new THREE.PointLight(
        0x00d2ff,
        3,
        10
    );


rimLight.position.set(
    0,
    0.2,
    0
);


scene.add(
    rimLight
);


// ============================================================
// PLATAFORMA
// ============================================================

const platformGeo =
    new THREE.CylinderGeometry(
        2,
        2.2,
        0.2,
        deviceType === 'mobile'
            ? 32
            : 64
    );


const platformMat =
    new THREE.MeshStandardMaterial({

        color:
            0x101b2b,

        roughness:
            0.3,

        metalness:
            0.8
    });


const platform =
    new THREE.Mesh(
        platformGeo,
        platformMat
    );


platform.position.y =
    -0.1;


platform.receiveShadow =
    true;


scene.add(
    platform
);


// ============================================================
// ANIMACIONES
// ============================================================

let mixer;

const actions = {};

let activeAction;


// ============================================================
// CAMBIAR ANIMACIÓN
// ============================================================

function fadeToAction(
    name,
    duration = 0.5
) {

    const previousAction =
        activeAction;


    activeAction =
        actions[name];


    if (
        previousAction &&
        previousAction !==
        activeAction
    ) {

        previousAction.fadeOut(
            duration
        );
    }


    if (activeAction) {

        activeAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
    }
}


// ============================================================
// GLTF LOADER
// ============================================================

// IMPORTANTE:
// El LoadingManager se conecta
// al GLTFLoader.
const loader =
    new GLTFLoader(
        loadingManager
    );


// ============================================================
// CARGA DE MODELOS
// ============================================================

Promise.all([

    loader.loadAsync(
        '/models/avatar.glb'
    ),

    loader.loadAsync(
        '/models/reposo.glb'
    ),

    loader.loadAsync(
        '/models/platicar.glb'
    ),

    loader.loadAsync(
        '/models/correr.glb'
    )

])
.then(
    (
        [
            avatarGltf,
            reposoGltf,
            platicarGltf,
            correrGltf
        ]
    ) => {


        // ==================================================
        // AVATAR
        // ==================================================

        const model =
            avatarGltf.scene;


        model.traverse(
            (node) => {

                if (node.isMesh) {

                    node.castShadow =
                        true;

                    node.receiveShadow =
                        true;
                }
            }
        );


        scene.add(
            model
        );


        // ==================================================
        // MIXER
        // ==================================================

        mixer =
            new THREE.AnimationMixer(
                model
            );


        // ==================================================
        // REPOSO
        // ==================================================

        if (
            reposoGltf.animations.length >
            0
        ) {

            actions['reposo'] =
                mixer.clipAction(
                    reposoGltf.animations[0]
                );
        }


        // ==================================================
        // PLATICAR
        // ==================================================

        if (
            platicarGltf.animations.length >
            0
        ) {

            actions['platicar'] =
                mixer.clipAction(
                    platicarGltf.animations[0]
                );
        }


        // ==================================================
        // CORRER
        // ==================================================

        if (
            correrGltf.animations.length >
            0
        ) {

            actions['correr'] =
                mixer.clipAction(
                    correrGltf.animations[0]
                );
        }


        // ==================================================
        // ANIMACIÓN INICIAL
        // ==================================================

        if (
            actions['reposo']
        ) {

            fadeToAction(
                'reposo',
                0
            );
        }

    }
)
.catch(
    (error) => {

        console.error(
            'Error al cargar los archivos GLB:',
            error
        );


        if (loaderText) {

            loaderText.textContent =
                'Error al cargar la experiencia 3D.';
        }
    }
);


// ============================================================
// BOTONES
// ============================================================

const btnReposo =
    document.getElementById(
        'btn-reposo'
    );


const btnPlaticar =
    document.getElementById(
        'btn-platicar'
    );


const btnCorrer =
    document.getElementById(
        'btn-correr'
    );


if (btnReposo) {

    btnReposo.addEventListener(
        'click',
        () => {

            fadeToAction(
                'reposo'
            );
        }
    );
}


if (btnPlaticar) {

    btnPlaticar.addEventListener(
        'click',
        () => {

            fadeToAction(
                'platicar'
            );
        }
    );
}


if (btnCorrer) {

    btnCorrer.addEventListener(
        'click',
        () => {

            fadeToAction(
                'correr'
            );
        }
    );
}


// ============================================================
// RESPONSIVE
// ============================================================

window.addEventListener(
    'resize',
    () => {

        const newDeviceType =
            getDeviceType();


        if (
            newDeviceType !==
            deviceType
        ) {

            deviceType =
                newDeviceType;


            setCameraPosition();


            updatePixelRatio();
        }


        updateRendererSize();
    }
);


// ============================================================
// TIMER
// ============================================================

const timer =
    new Timer();


// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // Actualizar Timer
    timer.update();


    const delta =
        timer.getDelta();


    // Actualizar animación
    if (mixer) {

        mixer.update(
            delta
        );
    }


    // Actualizar controles
    controls.update();


    // Render
    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// INICIAR LOOP
// ============================================================

animate();
