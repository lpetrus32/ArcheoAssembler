


function show_hideAction(){
    let DataBlock = document.getElementById("DataBlock");
    let BasketBlock = document.getElementById("BasketBlock");
    let ScreenHeight = document.getElementById("screen").clientHeight;
    let ButtonText = document.getElementById("show_hideButton");

    let ParametersBlock = document.getElementById("ParametersBlock");
    console.log(ScreenHeight);
    if(ParametersBlock.clientHeight == 0){
        ButtonText.textContent = "HIDE FILTERS";
        ParametersBlock.style.display = "block";
        BasketBlock.style.height = (ScreenHeight*0.8)+'px';
        DataBlock.style.height = (ScreenHeight*0.8)+'px';
    }else{
        ButtonText.textContent = "SHOW FILTERS";
        ParametersBlock.style.display = "none";
        BasketBlock.style.height = ScreenHeight*0.99+'px';
        DataBlock.style.height = ScreenHeight*0.99+'px';
    }
}

let setupListeners = function(){

}

window.onload = setupListeners;