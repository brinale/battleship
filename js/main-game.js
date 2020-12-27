const exitButton=document.querySelector(".exit");

const button_rating=document.querySelector(".rating");
const modalRat=document.querySelector(".modal-rating");
const closeRat=document.querySelector(".close-rating");

const button_system=document.querySelector(".about-system");

const button_rules=document.querySelector(".rules");
const modalRules=document.querySelector(".modal__game-rules");
const closeRules=document.querySelector(".close__game-rules");

const modalDev=document.querySelector(".modal-dev");
const closeDev=document.getElementById("close-dev");
const button_dev=document.querySelector(".developers");
const place=document.querySelector(".place");

const button_NewGame=document.querySelectorAll(".new-game");


function toggleModal(m){
    m.classList.toggle("is-open");
}

function openMain(){
    window.close();
    window.open("index.html");
}

function openGame(){
    
    let selectEnemy = document.getElementById("select-enemy");
    let selectPos = document.getElementById("select-pos");
    let selectStrategy = document.getElementById("select-strategy");
    let valueEnemy = selectEnemy.value;
    let valuePos = selectPos.value;
    let valueStrategy = selectStrategy.value;
    if (valueEnemy=="Компьютер" && valuePos=="Ручная"){
        window.close();
        window.open("game.html");
    }
    else{
        window.close();
        window.open("game1.html");
    }
}

function openSys(){
    window.close();
    window.open("info.html");
}

button_NewGame.forEach(button => button.addEventListener('click', openGame));
exitButton.addEventListener('click', openMain);
button_rules.addEventListener('click',()=>toggleModal(modalRules));
closeRules.addEventListener('click', () => toggleModal(modalRules));
button_dev.addEventListener('click',()=>toggleModal(modalDev));
closeDev.addEventListener('click', () => toggleModal(modalDev));
button_system.addEventListener('click',openSys);
button_rating.addEventListener('click', ()=>toggleModal(modalRat));
closeRat.addEventListener('click',()=>toggleModal(modalRat));