<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Juego - Cargando</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; -webkit-tap-highlight-color: transparent; }
        
        body { overflow: hidden; font-family: 'Courier New', monospace; }
        
        /* Pantalla de carga */
        #pantallaCarga {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a2a, #1a1a3a);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            transition: opacity 0.8s;
        }
        
        .contenedor-carga {
            text-align: center;
            width: 80%;
            max-width: 500px;
            padding: 30px;
            background: rgba(0,0,0,0.6);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        h1 { color: #fff; margin-bottom: 20px; font-size: 24px; }
        
        .barra-exterior {
            width: 100%;
            height: 30px;
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .barra-interior {
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00ccff);
            border-radius: 15px;
            transition: width 0.1s linear;
            box-shadow: 0 0 10px cyan;
        }
        
        .texto-carga {
            color: white;
            font-size: 18px;
            letter-spacing: 2px;
            text-shadow: 0 0 5px cyan;
        }
        
        .porcentaje {
            color: #00ff88;
            font-weight: bold;
            font-size: 24px;
        }
        
        /* UI del juego (tus divs originales) */
        #gameOver, #menu, .ui-element {
            position: fixed;
            z-index: 100;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 10px;
            font-family: monospace;
        }
        
        #gameOver { 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            display: none; 
            font-size: 48px;
            background: rgba(0,0,0,0.9);
            padding: 30px;
        }
        
        #lifesNum { position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 10px 20px; border-radius: 10px; z-index: 100; color: #ff4444; font-weight: bold; }
        #powerState { position: fixed; top: 20px; left: 120px; background: rgba(0,0,0,0.7); padding: 10px 20px; border-radius: 10px; z-index: 100; }
        #jump { position: fixed; bottom: 30px; right: 30px; width: 80px; height: 80px; background: rgba(255,255,255,0.3); border-radius: 50%; z-index: 100; cursor: pointer; border: 2px solid white; }
        #shoot { position: fixed; bottom: 30px; right: 130px; width: 80px; height: 80px; background: rgba(255,0,0,0.3); border-radius: 50%; z-index: 100; cursor: pointer; border: 2px solid white; }
        #menu { position: fixed; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(0,0,0,0.7); border-radius: 10px; z-index: 100; cursor: pointer; }
        
        .joystick-area {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 150px;
            height: 150px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            z-index: 100;
        }
    </style>
</head>
<body>
    <!-- Pantalla de carga -->
    <div id="pantallaCarga">
        <div class="contenedor-carga">
            <h1>🎮 CARGANDO JUEGO 🎮</h1>
            <div class="barra-exterior">
                <div class="barra-interior" id="barraCarga"></div>
            </div>
            <div class="texto-carga" id="textoCarga">📦 módulos principales al (<span id="porcentajeNum">0</span>%)</div>
        </div>
    </div>
    
    <!-- Tus elementos UI originales -->
    <div id="gameOver">GAME OVER</div>
    <div id="lifesNum">❤️ 100</div>
    <div id="powerState">🛡️ Escudo Desactivado</div>
    <div id="jump"></div>
    <div id="shoot"></div>
    <div id="menu"></div>
    
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.128.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.128.0/examples/jsm/"
            }
        }
    </script>
    
    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { getJoydeltaX, getJoydeltaY, getRotationDelta } from './input.js';
        
        // ========== BARRA DE CARGA ==========
        const pantallaCarga = document.getElementById('pantallaCarga');
        const barraCarga = document.getElementById('barraCarga');
        const porcentajeNum = document.getElementById('porcentajeNum');
        
        function actualizarProgreso(porcentaje) {
            const p = Math.min(100, Math.max(0, porcentaje));
            barraCarga.style.width = p + '%';
            porcentajeNum.innerText = Math.floor(p);
        }
        
        // Contador de recursos
        let recursosCargados = 0;
        const recursosTotales = 3; // avatar_completo, Jackson, Xbot
        
        function recursoCargado() {
            recursosCargados++;
            const progreso = (recursosCargados / recursosTotales) * 100;
            actualizarProgreso(progreso);
            if (recursosCargados === recursosTotales) {
                setTimeout(() => {
                    pantallaCarga.style.opacity = '0';
                    setTimeout(() => {
                        pantallaCarga.style.display = 'none';
                    }, 800);
                }, 500);
            }
        }
        
        // ========== TU CÓDIGO ORIGINAL (MODIFICADO) ==========
        
        // Escena
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        const canvas = renderer.domElement;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let gameRunning = true;
        let Xbot;
        let Person;
        let Shield = false;
        let animations;
        let mixer = null;
        let walkAction = null;
        let clock = new THREE.Clock();
        
        // Elementos UI
        const gameOverDiv = document.getElementById('gameOver');
        const LifesDiv = document.getElementById('lifesNum');
        const PowerUpsDiv = document.getElementById('powerState');
        const JumpDiv = document.getElementById('jump');
        const ShootDiv = document.getElementById('shoot');
        const menuDiv = document.getElementById('menu');
        
        // Variables globales
        let posCubo = -5;
        let Cubos = 0;
        let cubo1 = null;
        let Posiciones;
        let count = 0;
        let vidas = 100;
        let state_G = true;
        let stateFall = false;
        let isJumping = false;
        let verticalVelocity = 2;
        let cameraRotationY = 0;
        let cameraRotationX = 0;
        let puedeVer = true;
        
        // Funciones
        function shoot() {
            const cuboGeo1 = new THREE.BoxGeometry(2, 2, 2);
            const cuboMat1 = new THREE.MeshStandardMaterial({ color: 0xff6600 });
            cubo1 = new THREE.Mesh(cuboGeo1, cuboMat1);
            cubo1.position.set(camera.position.x, camera.position.y + 3, camera.position.z);
            Posiciones = cubo1.position;
            scene.add(cubo1);
            Cubos++;
        }
        
        // ========== CARGA DE MODELOS CON PROGRESO ==========
        
        async function cargarModelos() {
            const loader = new GLTFLoader();
            const loader1 = new GLTFLoader();
            const loader_2 = new GLTFLoader();
            
            // Cargar avatar_completo
            loader1.load("../assets/modelos/avatar_completo_1000.glb",
                (gltf1) => {
                    gltf1.scene.position.set(1, -0.7, 1);
                    scene.add(gltf1.scene);
                    recursoCargado();
                },
                (error) => {
                    console.log("Error cargando avatar:", error);
                    recursoCargado(); // Aún así contamos como cargado para no trabar
                }
            );
            
            // Cargar Jackson (Person)
            loader_2.load("../assets/modelos/Jackson/scene.gltf",
                (gltf_2) => {
                    gltf_2.scene.position.set(2, 0.4, 1);
                    gltf_2.scene.scale.set(4, 4, 4);
                    gltf_2.scene.rotation.x -= 0.6;
                    scene.add(gltf_2.scene);
                    Person = gltf_2.scene;
                    recursoCargado();
                },
                (error) => {
                    console.log("Error cargando Jackson:", error);
                    recursoCargado();
                }
            );
            
            // Cargar Xbot
            loader.load('../assets/modelos/Xbot.glb',
                (gltf) => {
                    gltf.scene.position.set(0, -0.7, 0);
                    scene.add(gltf.scene);
                    Xbot = gltf.scene;
                    animations = gltf.animations;
                    mixer = new THREE.AnimationMixer(gltf.scene);
                    walkAction = mixer.clipAction(animations.find(anim => anim.name === "run"));
                    if (walkAction) walkAction.play();
                    recursoCargado();
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% del Xbot cargado');
                },
                (error) => {
                    console.error("❌ Error cargando Xbot:", error);
                    // Crear modelo de respaldo
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
                    Xbot = new THREE.Mesh(geometry, material);
                    scene.add(Xbot);
                    recursoCargado();
                }
            );
        }
        
        // ========== CONFIGURACIÓN DE LA ESCENA ==========
        
        const texturaPared = new THREE.TextureLoader().load('../assets/Texturas/Pared.jpg');
        const radio = 0.8;
        const area = 40;
        const limite = area / 2;
        let posXPared = (Math.random() - 0.5) * area;
        let posZPared = (Math.random() - 0.5) * area;
        let puntosPatrulla = [];
        let PuntoActual = 0;
        let angulo = Date.now();
        
        // Vectores
        let forward = new THREE.Vector3();
        let right = new THREE.Vector3();
        const velocidadMov = 0.2;
        
        // Fondo y luz
        scene.background = new THREE.Color(0x6666ff);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);
        scene.add(new THREE.AmbientLight(0x404040));
        
        // Suelo
        const sueloGeo = new THREE.BoxGeometry(area, 0.2, area);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x44aa44 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.position.set(0, -1, 0);
        scene.add(suelo);
        
        // Pared
        const paredGeo = new THREE.BoxGeometry(20, 6, 0.5);
        const paredMat = new THREE.MeshStandardMaterial({ map: texturaPared });
        const pared = new THREE.Mesh(paredGeo, paredMat);
        pared.position.set(posXPared, 0.5, posZPared);
        scene.add(pared);
        
        // Cubo (powerup)
        const cuboGeo = new THREE.BoxGeometry(2, 2, 2);
        const cuboMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const cubo = new THREE.Mesh(cuboGeo, cuboMat);
        cubo.position.set(posCubo, 0.5, posCubo);
        scene.add(cubo);
        
        // Puntos de patrulla
        const cantidadPuntos = 10;
        for (let i = 0; i < cantidadPuntos; i++) {
            let x = (Math.sin(angulo) * radio) * area;
            let z = (Math.sin(angulo) * radio) * area;
            puntosPatrulla.push({ x, z });
        }
        
        // Cámara
        scene.add(camera);
        camera.position.set(0, 5, 5);
        camera.rotation.order = 'YXZ';
        
        // Eventos
        JumpDiv.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isJumping = true;
        });
        
        ShootDiv.addEventListener('touchstart', (e) => {
            e.preventDefault();
            shoot();
        });
        
        menuDiv.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Tu lógica de menú aquí
        });
        
        // Spawn de powerups
        setInterval(() => {
            posCubo = (Math.random() - 0.5) * area;
            cubo.position.set(posCubo, -1, posCubo);
        }, 4000);
        
        // ========== UPDATE LOOP (TU LÓGICA ORIGINAL) ==========
        
        function update() {
            if (!gameRunning) return;
            
            // Verificar vidas
            if (count > vidas) {
                gameOverDiv.style.display = "block";
                gameRunning = false;
            }
            
            LifesDiv.innerHTML = "❤️ " + Math.floor(vidas - count);
            
            const distanceToCubeX = camera.position.x - cubo.position.x;
            const distanceToCubeZ = camera.position.z - cubo.position.z;
            const distanceToCube = Math.hypot(distanceToCubeZ, distanceToCubeX);
            
            if (distanceToCube < 1) {
                posCubo = (Math.random() - 0.5) * area;
                cubo.position.set(posCubo, -1, posCubo);
                Shield = true;
                PowerUpsDiv.innerHTML = "🛡️ Escudo Activado";
                setTimeout(() => {
                    Shield = false;
                    PowerUpsDiv.innerHTML = "🛡️ Escudo Desactivado";
                }, 3000);
            }
            
            // Proyectil
            if (cubo1 && Xbot) {
                const distanceXC = Xbot.position.x - cubo1.position.x;
                const distanceZC = Xbot.position.z - cubo1.position.z;
                cubo1.position.x += distanceXC * 0.005;
                cubo1.position.z += distanceZC * 0.005;
            }
            
            // Salto
            if (isJumping) {
                camera.position.y += verticalVelocity;
                verticalVelocity -= 0.1;
                if (camera.position.y < 1) {
                    isJumping = false;
                    verticalVelocity = 2;
                }
            }
            
            // Gravedad
            if (camera.position.y > 1) {
                camera.position.y -= 0.05;
            }
            
            if (camera.position.y < -30) {
                gameOverDiv.style.display = "block";
                gameRunning = false;
            }
            
            // Límites
            if (camera.position.x > limite || camera.position.z > limite || camera.position.x < -limite || camera.position.z < -limite) {
                camera.position.y -= 0.1;
            }
            
            // Mover Person (Jackson)
            if (Person && Xbot) {
                const distanceXP = Person.position.x - Xbot.position.x;
                const distanceZP = Person.position.z - Xbot.position.z;
                Person.position.x -= distanceXP * 0.005;
                Person.position.z -= distanceZP * 0.005;
                Person.lookAt(Xbot.position.x, 1, Xbot.position.z);
            }
            
            // Persecución Xbot
            if (Xbot) {
                const distanceX = camera.position.x - Xbot.position.x;
                const distanceZ = camera.position.z - Xbot.position.z;
                const distanceY = camera.position.y - Xbot.position.y;
                const distanciaTotal = Math.hypot(distanceX, distanceZ, distanceY);
                
                // Raycasting para visión
                const obstaculos = [pared, cubo];
                if (cubo1) obstaculos.push(cubo1);
                
                const direccionVision = new THREE.Vector3().subVectors(camera.position, Xbot.position).normalize();
                const raycasterVision = new THREE.Raycaster(Xbot.position, direccionVision);
                const impactos = raycasterVision.intersectObjects(obstaculos);
                
                if (impactos.length > 0) {
                    const distanciaImpacto = impactos[0].distance;
                    const distanciaCamara = Math.hypot(camera.position.x - Xbot.position.x, camera.position.z - Xbot.position.z);
                    puedeVer = distanciaImpacto >= distanciaCamara;
                } else {
                    puedeVer = true;
                }
                
                if (puedeVer) {
                    Xbot.lookAt(camera.position);
                    if (distanciaTotal < 3 && !Shield) {
                        count += 0.04;
                    }
                    Xbot.position.x += distanceX * 0.01;
                    Xbot.position.z += distanceZ * 0.01;
                } else {
                    const distPatrolX = puntosPatrulla[PuntoActual].x - Xbot.position.x;
                    const distPatrolZ = puntosPatrulla[PuntoActual].z - Xbot.position.z;
                    Xbot.position.x += distPatrolX * 0.02;
                    Xbot.position.z += distPatrolZ * 0.02;
                    Xbot.lookAt(puntosPatrulla[PuntoActual].x, 0, puntosPatrulla[PuntoActual].z);
                    
                    if (Math.abs(distPatrolX) < 2 && Math.abs(distPatrolZ) < 2) {
                        PuntoActual = (PuntoActual + 1) % cantidadPuntos;
                        if (PuntoActual === 0) {
                            for (let i = 0; i < cantidadPuntos; i++) {
                                puntosPatrulla[i] = {
                                    x: (Math.sin(angulo) * radio) * area,
                                    z: (Math.sin(angulo) * radio) * area
                                };
                            }
                        }
                    }
                }
                
                if (mixer) mixer.update(clock.getDelta());
                angulo = Date.now() * 0.002;
            }
            
            camera.getWorldDirection(forward);
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        }
        
        function animate() {
            if (!gameRunning) {
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
                return;
            }
            
            update();
            
            // Inputs
            const joyX = getJoydeltaX();
            const joyY = getJoydeltaY();
            const { dx, dy } = getRotationDelta();
            
            cameraRotationY += dx;
            cameraRotationX += dy;
            cameraRotationX = Math.min(Math.max(cameraRotationX, -1.5), 1.5);
            
            const moveX = (forward.x * joyY) + (right.x * -joyX);
            const moveZ = (forward.z * joyY) + (right.z * -joyX);
            
            camera.position.x += moveX * velocidadMov;
            camera.position.z += moveZ * velocidadMov;
            
            camera.rotation.y = -cameraRotationY;
            camera.rotation.x = -cameraRotationX;
            
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        
        // ========== INICIAR TODO ==========
        actualizarProgreso(0);
        cargarModelos();
        
        // Iniciar animación (sin esperar modelos, pero los modelos aparecerán cuando se carguen)
        animate();
        
        // Opcional: Redimensionar
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('🎮 Sistema de carga activo - esperando 3 modelos...');
    </script>
</body>
</html>
