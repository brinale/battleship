const changeButton=document.querySelector(".button_change");
const updLog=document.querySelector(".update-log-in");
const updPas=document.querySelector(".update-password");
const updSW=document.querySelector(".update-secret-word");

function update(){
    let user={
        login: updLog.value,
        password: updPas.value,
        secretWord: updSW.value
    };
    let json=JSON.stringify(user);
    let xhr=new XMLHttpRequest();
    let link="http://localhost:3000/update";
    xhr.open("PUT", link);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(json);
    xhr.onreadystatechange = function(){
        if (xhr.readyState!=4) return;
        if (xhr.status!=200) {
            var res = JSON.parse(xhr.responseText);
            console.log(res);
            alert("Не удалось обновить пароль");
        }
        else {
            alert("Обновление пароля прошло успешно!");
            window.close();
            window.open("index.html");
        }
    };
}

changeButton.addEventListener('click', update);