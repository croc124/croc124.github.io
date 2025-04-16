import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('threedee');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, 0.5, 1, 1000 );
const loader = new GLTFLoader();

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({antialias: true, canvas, alpha: true,});

let lastSelectedItem = null; // Track the last selected item

function spinTheCard(object, index, blocks, contentBoxes){
    
    let transformValue = window.getComputedStyle(object).getPropertyValue("transform");
    let flipped = object.style.transform.includes("rotateY(180deg)");


    blocks.style.transform = flipped ? "rotateY(0deg) translateX(0vw) translateY(-1.4vw)" : "rotateY(180deg) translateX(6.6vw) translateY(-1.4vw)"; // Keeps blocks in place

    object.style.transition = "transform 0.7s ease-in-out";
    object.style.transform = flipped ? "rotateY(0deg)" : "rotateY(180deg)";

    setTimeout(() => {object.style.backgroundImage = flipped ? "url(assets/pictures/jubilee.jpg)" : "url(assets/pictures/model-background.jpg)";}, 350); // Switch midway through rotation when the card is facing away

    // Hide all content boxes
    contentBoxes.forEach(box => box.classList.remove("active"));

    // Show the corresponding content box
        let contentToShow = document.getElementById(`content-${index + 1}`);
        if (contentToShow) contentToShow.classList.add("active");

    lastSelectedItem = flipped ? null : object; // Update last selected item only if not flipped

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

function animate() {
    resizeCanvasToDisplaySize();
    if (guy) { // Check if guy is loaded before applying rotation
        guy.rotation.y += 0.01;
    }

    renderer.render( scene, camera );
    
}

container.appendChild(renderer.domElement);
renderer.setAnimationLoop( animate );

