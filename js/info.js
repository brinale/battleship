const button=document.querySelector(".exit");

function openMain(){
    window.close();
    window.open("main.html");
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 

button.addEventListener('click', openMain);