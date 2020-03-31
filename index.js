//Cache ou affiche le block des filtres
function show_hideAction(){
    let DataBlock = document.getElementById("DataBlock");
    let BasketBlock = document.getElementById("BasketBlock");
    let mainBlockHeight = document.getElementById("mainBlock").clientHeight;
    let ButtonText = document.getElementById("show_hideButton");

    let FiltersBlock = document.getElementById("FiltersBlock");
    if(FiltersBlock.clientHeight == 0){
        ButtonText.textContent = "HIDE FILTERS";
        FiltersBlock.style.display = "block";
        BasketBlock.style.height = (mainBlockHeight*0.8)+'px';
        DataBlock.style.height = (mainBlockHeight*0.8)+'px';
    }else{
        ButtonText.textContent = "SHOW FILTERS";
        FiltersBlock.style.display = "none";
        BasketBlock.style.height = (mainBlockHeight-6)+'px'; //largeur bordures = 6px
        DataBlock.style.height = (mainBlockHeight-6)+'px';
    }
}


let setupListeners = function(){

}

window.onload = setupListeners;
