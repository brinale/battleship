const modalReg=document.querySelector(".modal-reg");
const closeReg=document.querySelector(".close-reg");
const button_reg=document.querySelector(".reg-open");
const cancel=document.querySelector(".button-cancel");
const newReg=document.querySelector(".button_sign-up");
const loginVal=document.querySelector(".login");
const secretVal=document.querySelector(".secret-word");
const pasword=document.querySelector(".pass-word");
const logIn=document.querySelector(".button_log-in");
const logInField=document.querySelector(".log-in");
const pasField=document.querySelector(".auth-password");

function toggleModal(m){
    m.classList.toggle("is-open");
}

function register(){
    let user={
        login: loginVal.value,
        password: pasword.value,
        secretWord: secretVal.value
    };
    let json=JSON.stringify(user);
    console.log(json);
    let xhr=new XMLHttpRequest();
    let link="http://localhost:3000/register";
    xhr.open("POST", link);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(json);
    xhr.onreadystatechange = function(){
        if (xhr.readyState!=4) return;
        if (xhr.status!=200) {
            alert("Регистрация не удалась");
        }
        else alert("Регистрация прошла успешно");
    };

    toggleModal(modalReg);
}

function auth(){
    let user={
        login: logInField.value,
        password: pasField.value
    };
    let json=JSON.stringify(user);
    let xhr=new XMLHttpRequest();
    let link="http://localhost:3000/auth";
    xhr.open("POST", link);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(json);
    xhr.onreadystatechange = function(){
        if (xhr.readyState!=4) return;
        if (xhr.status!=200) {
            alert("Авторизация не удалась");
        }
        else {
            window.close();
            window.open("main.html");
        }
    };
}

newReg.addEventListener('click', register);
logIn.addEventListener('click', auth);
closeReg.addEventListener('click', () => toggleModal(modalReg));
button_reg.addEventListener('click', ()=>toggleModal(modalReg));