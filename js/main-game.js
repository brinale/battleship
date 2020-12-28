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
    let valueEnemy = document.querySelector('input[name="choice"]:checked').value;
    if (valueEnemy=="computer"){
        window.close();
        window.open("game.html");
    }
}

function getRating(){
    let ratingList;
    let xhr=new XMLHttpRequest();
    let link="http://localhost:3000/users";
    xhr.open("GET", link);
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.readyState!=4) return;
        if (xhr.status!=200) {
            alert("Не удалось получить рейтинг от сервера!");
        }
        else {
            try{
                ratingList=JSON.parse(xhr.responseText);
                setRating(ratingList);
            }
            catch(err){
                alert(err.message);
                alert("Не удалось получить рейтинг!");
            }
        }
    };
}

function setRating(ratingList){
    for (let i=1;i<ratingList.length+1;i++){
        let user=ratingList[i-1];
        let rate=user.rating;
        let rateName=document.getElementById("name"+i);
        let rateNum=document.getElementById("rate"+i);
        rateName.textContent=i+". "+user.login;
        rateNum.textContent=rate.score;
    }
    if(ratingList.length!=10){
        for (let i=ratingList.length+1;i<11;i++){
            let rateName=document.getElementById("name"+i);
            let rateNum=document.getElementById("rate"+i);
            rateName.textContent=i+". ";
            rateNum.textContent=" ";
        }
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
button_rating.addEventListener('click', ()=>{
    toggleModal(modalRat);
    getRating();
});
closeRat.addEventListener('click',()=>toggleModal(modalRat));