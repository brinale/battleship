const button=document.querySelector(".exit");

function openMain(){
    window.close();
    window.open("main.html");
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0; 
} 

button.addEventListener('click', openMain);