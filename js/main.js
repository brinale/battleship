const modal=document.querySelector(".modal");
const close=document.querySelector(".close");
close.addEventListener('click',toggleModal);

function toggleModal(){
    modal.classList.toggle("is-open");
}

const button_reg=document.querySelector(".reg-open");
button_reg.addEventListener('click',toggleModal)