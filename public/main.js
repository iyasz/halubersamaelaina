import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

// setup 
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
scene.background = new THREE.Color(0xF5EFE6);

renderer.render(scene, camera)


// Carpet Object 
const carpetObjt = new THREE.CircleGeometry( 10, 32 ); 
const carpetMaterial = new THREE.MeshBasicMaterial( { color: 0xE29B2E } ); 
const carpet = new THREE.Mesh(carpetObjt, carpetMaterial);
carpet.position.z = -20;
carpet.position.x = 0;
carpet.position.y = -3;
carpet.rotation.x = -1.57;
scene.add(carpet);

// Carpet Object - Lingkaran kecil di atas carpet
const smallCircleObjt = new THREE.CircleGeometry( 9, 32 );
const smallCircleMaterial = new THREE.MeshBasicMaterial( { color: 0xEED988 } ); 
const smallCircle = new THREE.Mesh(smallCircleObjt, smallCircleMaterial);
smallCircle.position.z = -19.9;  
smallCircle.position.x = 0;
smallCircle.position.y = -3;
smallCircle.rotation.x = -1.57;
scene.add(smallCircle);



// Chair Object 
const modernChair = new GLTFLoader()
let chair1;

modernChair.load('/models/huge-chair/scene.gltf', (gltf) => {
  chair1 = gltf.scene;
  chair1.position.z = -32;
  chair1.position.y = -3.4;
  chair1.position.x = -15;
  chair1.rotation.y = 1.2;
  chair1.rotation.x = 0.1;
  chair1.scale.set(0.1, 0.1, 0.1); 
  scene.add(chair1);

});


const roundedBoxGeometry = new RoundedBoxGeometry(25, 12, 1, 2.8, 1); // width, height, depth, radius
const roundedBoxMaterial = new THREE.MeshStandardMaterial({
  color: 0xE3D4B4,
});
const roundedBox = new THREE.Mesh(roundedBoxGeometry, roundedBoxMaterial);
roundedBox.position.z = -48;  
roundedBox.position.x = 0;
roundedBox.position.y = 20;
scene.add(roundedBox);

// Small Board Object 
const smallRoundedBoxGeometry = new RoundedBoxGeometry(23, 10.5, 1, 1, 0.1); // width, height, depth, radius
const smallRoundedBoxMaterial = new THREE.MeshStandardMaterial({
  color: 0xB09A8C,
});
const smallRoundedBox = new THREE.Mesh(smallRoundedBoxGeometry, smallRoundedBoxMaterial);
smallRoundedBox.position.z = -48;  
smallRoundedBox.position.x = 0;
smallRoundedBox.position.y = 20;
scene.add(smallRoundedBox);


// Clock for animations
const clock = new THREE.Clock();


// Raycaster and mouse for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// Character 
const loader = new GLTFLoader();
let character;
let mixer;
let moveSpeed = 0.01; 
let rotateSpeed = 0.01;

let targetX = 0.5;  
let startX = 5;

let targetRotateY = 0
let startRotateY = 4

loader.load('/models/elaina/scene.gltf', (gltf) => {
  character = gltf.scene;
  character.position.z = -1.2;
  character.position.y = -2;
  character.position.x = startX;
  character.rotation.y = startRotateY;
  scene.add(character);

  mixer = new THREE.AnimationMixer(character);

  // Add animations to mixer
  gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
  });
});


// Lighting 
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Warna putih, intensitas 1
scene.add(ambientLight);

// Directional light memberikan pencahayaan dari arah tertentu
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Warna putih, intensitas 1
directionalLight.position.set(1, 1, 1); // Posisi dari mana cahaya datang
scene.add(directionalLight);



//  <----- EVENT SKIBIDI ----->

let isDragging = false; 
let previousMouseX = 0; 

window.addEventListener('mousedown', (event) => {
  isDragging = true;
  previousMouseX = event.clientX; 
});

window.addEventListener('touchstart', (event) => {
  isDragging = true;
  previousMouseX = event.touches[0].clientX; 
});



window.addEventListener('mousemove', (event) => {
  if (!isDragging) return;

  const deltaX = event.clientX - previousMouseX; 

  if (character) {
    character.rotation.y += deltaX * 0.005; 
  }
  previousMouseX = event.clientX; 
});

window.addEventListener('touchmove', (event) => {
  if (!isDragging) return;
  const deltaX = event.touches[0].clientX - previousMouseX;
  if (character) {
    character.rotation.y += deltaX * 0.005; 
  }
  previousMouseX = event.touches[0].clientX; 
});



window.addEventListener('mouseup', () => {
  isDragging = false; 
});
window.addEventListener('touchend', () => {
  isDragging = false; 
});


// MAKE ANIMATION CHARACTER

let isAnimating = false;
let zoomAmount = 0.05; // Kecepatan zoom
let targetCameraPos = new THREE.Vector3(); // Posisi target kamera
let targetCameraRotation = new THREE.Euler();
let numberConv = 10; 
const contentWrapper = document.querySelector('.command-wrapper');
let isClickCharacter = true;

// Fungsi untuk handle klik
function onClickCharacter(event) {
    if (isClickCharacter) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(character, true); 

        if (intersects.length > 0) {
            // Set target posisi kamera (lebih dekat ke karakter)
            targetCameraPos.set(
                character.position.x + 0.2,
                character.position.y + 2, // Sedikit di atas karakter
                character.position.z + 1.5   // Zoom ke arah karakter
            );

            targetCameraRotation.set(
                camera.rotation.x,  // Bisa sesuaikan rotasi ini sesuai kebutuhan
                camera.rotation.y,   // Berputar ke kanan sekitar 45 derajat
                camera.rotation.z
            );

            isAnimating = true; 
            contentWrapper.classList.remove("hidden");
            btn.click();

            isClickCharacter = false;

            window.removeEventListener('click', onClickCharacter);
        }
    }
}

// Tambahkan event listener
setTimeout(() => {
  window.addEventListener('click', onClickCharacter);
}, 14000);




// Renderer 
function animate() {
  requestAnimationFrame(animate);

  // Update animations
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  // Move 
  if (character && Math.abs(character.position.x - targetX) > 0.01) {
      if (character.position.x > targetX) {
          character.position.x -= moveSpeed;  // Move left
      } else {
          character.position.x += moveSpeed;  // Move right (if needed in other cases)
      }
  }

  // Rotate 
    if (character && Math.abs(character.rotation.y - targetRotateY) > 0.01) {
      if (character.rotation.y > targetRotateY) {
        character.rotation.y -= rotateSpeed;  // Rotate left
      } else {
        character.rotation.y += rotateSpeed;  // Rotate right
      }
    }



    if (isAnimating) {
      camera.position.lerp(targetCameraPos, zoomAmount); // Zoom ke target posisi
      camera.rotation.set(
        THREE.MathUtils.lerp(camera.rotation.x, targetCameraRotation.x, zoomAmount), 
        THREE.MathUtils.lerp(camera.rotation.y, targetCameraRotation.y, zoomAmount), 
        THREE.MathUtils.lerp(camera.rotation.z, targetCameraRotation.z, zoomAmount)
      );
  
      // Hentikan animasi ketika kamera sudah dekat ke posisi target
      if (camera.position.distanceTo(targetCameraPos) < 0.1) {
        isAnimating = false;
      }

    }



  renderer.render(scene, camera);
}

animate();






import gsap from 'gsap';

const convText1 = "Hi. Nama ku Elaina, aku suka berkeliling dunia untuk petualanganku dan menuliskannya dalam buku!";
const convText2 = "Aku suka banget baca buku tentang sihir karena aku syirik .."; 
const convText3 = "Ngomong ngomong nama kamu siapa?"; 

const btn = document.querySelector('.command-wrapper .next button');
const textElement = document.getElementById('animated-text');

function animateText(text) {
  textElement.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');
  
  return gsap.fromTo("#animated-text span",
    { visibility: 'hidden', y: 20 }, 
    { 
      visibility: 'visible', 
      y: 0, 
      stagger: 0.03,  
      duration: 1 
    }
  );
}

// FUNGSI TEXT 

let animation = animateText(convText1);

btn.addEventListener('click', function() {

  if (animation.isActive()) {
    // Jika animasi sedang aktif, langsung selesaikan
    animation.progress(1); 
    return false
  }

  let newText = convText1;

    if(numberConv == 10){
      numberConv = 1
      newText = convText1
    }else if(numberConv == 1){
      numberConv = 2
      newText = convText2
    }else if(numberConv == 2){
      numberConv = 3
      newText = convText3
      addNameUser()
    }else if(numberConv == 4){
      handleChooseQuestion();
      numberConv = 5
    }else if(numberConv == 5){
      
      numberConv = 10
      newText = "Sepertinya kita pernah bertemu ?"
      targetCameraPos.set(0, 0, 0); 
      targetCameraRotation.set(0, 0, 0);
      
      isClickCharacter = true
      isAnimating = true
      
      setTimeout(() => {
        window.addEventListener('click', onClickCharacter);
      }, 2000)

      contentWrapper.classList.add("hidden")
      
    }

    animation.kill(); 
    animation = animateText(newText); 

});



// HANDLE POST NAME 

const formWrapper = document.querySelector('.command-wrapper .form-wrapper');
const btnWrapper = document.querySelector('.command-wrapper .next');
function addNameUser(){
  btnWrapper.classList.add("hidden")
  formWrapper.classList.remove("hidden")
}

// SUBMIT FORM NAME 


document.getElementById('formGetName').addEventListener('submit', function(event) {
  event.preventDefault(); 
  const inputName = document.querySelector('.form-wrapper .form input');

  let profileHalu = {
      "name": inputName.value
  };

  inputName.value = ""

  localStorage.setItem("profileHalu", JSON.stringify(profileHalu));

  let convText4 = "Senang bertemu denganmu :)"
  
  let storedProfile = localStorage.getItem("profileHalu");
  if (storedProfile) {
      let profileObject = JSON.parse(storedProfile);
      convText4 = `Senang bertemu denganmu ${profileObject.name} :)`; 
  }



  if(numberConv == 3){
    numberConv = 4
    formWrapper.classList.add("hidden")
    btnWrapper.classList.remove("hidden")

    animation.kill(); 
    animation = animateText(convText4); 
  }

});


// HANDLE CHOOSE QUESTION 

const mainWrapper = document.querySelector('.command-wrapper .text-content-wrapper');
const chooseWrapper = document.querySelector('.command-wrapper .choose-wrapper');
const answerBtn1 = document.getElementById('answer-1');

function handleChooseQuestion () {
  chooseWrapper.classList.remove("hidden")
  btnWrapper.classList.add('hidden')
  mainWrapper.classList.add("hidden")
}

// HANDLE CHOOSE 1
answerBtn1.addEventListener('click', function() {
    chooseWrapper.classList.add('hidden')
    mainWrapper.classList.remove("hidden")
    btnWrapper.classList.remove('hidden')

    const convText5 = "Maaf aku udah punya suami (｡>﹏<｡)"

    animation.kill(); 
    animation = animateText(convText5); 

})


