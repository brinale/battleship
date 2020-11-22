const modal=document.querySelector(".modal");
const close=document.querySelector(".close");
close.addEventListener('click',toggleModal);

function toggleModal(){
    modal.classList.toggle("is-open");
}

const button_dev=document.querySelector(".developers");
button_dev.addEventListener('click',toggleModal);