import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('threedee');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, 0.5, 1, 1000 );
const loader = new GLTFLoader();

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({antialias: true, canvas, alpha: true,});

const controls = new OrbitControls( camera, renderer.domElement );

let isUserInteracting = false;

let originalBackground = "";
let lastSelectedItem = null; // Track the last selected item

function spinTheCard(object, index, blocks, contentBoxes) {
    // Store the original background on the element itself, if it isn't already stored
    if (!object.dataset.originalBackground) {
        object.dataset.originalBackground = object.style.backgroundImage;
    }
    
    let flipped = object.style.transform.includes("rotateY(180deg)");

    // Adjust the blocks positioning based on the flipped state
    blocks.style.transform = flipped
        ? "rotateY(0deg) translateX(0vw) translateY(-1.4vw)"
        : "rotateY(180deg) translateX(6.6vw) translateY(-1.4vw)";

    object.style.transition = "transform 0.7s ease-in-out";
    object.style.transform = flipped ? "rotateY(0deg)" : "rotateY(180deg)";

    // Wait half a second to switch the background when the card is mid-rotation
    setTimeout(() => {
        object.style.backgroundImage = flipped 
            ? object.dataset.originalBackground  // flipped state: show model background
            : "url(assets/pictures/model-background.jpg)";             // not flipped: revert to stored original
    }, 350);

    // Manage content box activation
    contentBoxes.forEach(box => box.classList.remove("active"));
    let contentToShow = document.getElementById(`content-${index + 1}`);
    if (contentToShow) contentToShow.classList.add("active");

    lastSelectedItem = flipped ? null : object;
}



document.addEventListener("DOMContentLoaded", () => {
    const contentBoxes = document.querySelectorAll(".content-box");
    document.querySelectorAll(".item").forEach((item, index) => {
        let blocks = item.querySelector(".blocks");

        item.addEventListener("click", function() {

            // If there's a previously selected item and it's different, flip both simultaneously
            if (lastSelectedItem && lastSelectedItem !== this) {
                let lastBlocks = lastSelectedItem.querySelector(".blocks");

                // Flip the previous card back
                spinTheCard(lastSelectedItem, Array.from(document.querySelectorAll(".item")).indexOf(lastSelectedItem), lastBlocks, contentBoxes, "0deg");
            }

            // Flip the newly clicked card at the same time
            spinTheCard(this, index, blocks, contentBoxes, "180deg");
        });
    });
});


controls.addEventListener('start', () => {
    isUserInteracting = true;
});

controls.addEventListener('end', () => {
    isUserInteracting = false;
    camera.position.z = 5;
    camera.position.y = 2.3;
    camera.position.x = 0;
});


function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
  
    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      controls.update();
  
      // update any render target sizes here
    }
  }

document.body.appendChild( renderer.domElement );

let guy; // Declare guy variable outside the callback

loader.load( 'assets/models/guy.glb', function ( gltf ) {
    guy = gltf.scene; // Assign guy inside the callback
    guy.scale.set(2.5, 2.5, 2.5); // Scale the model
    scene.add( guy );
}, undefined, function ( error ) {
    console.error( error );
} );



const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);

const directionalLight = new THREE.DirectionalLight(color, intensity);
directionalLight.position.set(-1, 2, 4);
scene.add(directionalLight);

scene.add(light);


camera.position.z = 5;
camera.position.y = 2.3;
controls.target.set(0, 2.3, 0); // Set the target to the center of the scene
controls.update();

function animate() {
    resizeCanvasToDisplaySize();
    if (guy && !isUserInteracting) { // Check if guy is loaded before applying rotation
        guy.rotation.y += 0.01;
    }

    controls.update(); // Update the controls

    renderer.render( scene, camera );
    
}

container.appendChild(renderer.domElement);
renderer.setAnimationLoop( animate );

