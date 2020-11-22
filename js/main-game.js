const modal=document.querySelector(".modal");
const close=document.querySelector(".close");
close.addEventListener('click',toggleModal);

function toggleModal(){
    modal.classList.toggle("is-open");
}

const button_rating=document.querySelector(".rating");
button_rating.addEventListener('click',toggleModal);