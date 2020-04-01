//Cache ou affiche le block des filtres
function show_hideAction(){
    let DataBlock = document.getElementById("DataBlock");
    let BasketBlock = document.getElementById("BasketBlock");
    let PicsBlock = document.getElementById("PicsBlock");
    let mainBlockHeight = document.getElementById("mainBlock").clientHeight;
    let ButtonText = document.getElementById("show_hideButton");

    let FiltersBlock = document.getElementById("FiltersBlock");
    if(FiltersBlock.clientHeight == 0){
        ButtonText.textContent = "HIDE FILTERS";
        FiltersBlock.style.display = "block";
        BasketBlock.style.height = (mainBlockHeight*0.8)+'px';
        DataBlock.style.height = (mainBlockHeight*0.8)+'px';
        PicsBlock.style.height = (mainBlockHeight*0.8)+'px';
    }else{
        ButtonText.textContent = "SHOW FILTERS";
        FiltersBlock.style.display = "none";
        BasketBlock.style.height = (mainBlockHeight-6)+'px'; //largeur bordures = 6px
        DataBlock.style.height = (mainBlockHeight-6)+'px';
        PicsBlock.style.height = (mainBlockHeight-6)+'px';
    }
}

//Affiche le tableau de métadonnées ou les images les fragments 
function switchAction(){
    let DataBlock = document.getElementById("DataBlock");
    let PicsBlock = document.getElementById("PicsBlock");
    
    if(DataBlock.clientHeight != 0){
        DataBlock.style.display="none";
        PicsBlock.style.display="block";
    }else{
        DataBlock.style.display="block";
        PicsBlock.style.display="none";
    }

}

function convertToXML() { // Help : https://github.com/sheetjs/sheetjs#common-spreadsheet-format

}

function handleFile(event) {
    let file = event.target.files.files[0];
    let reader = new FileReader();
    reader.onload = function(event) { // Call-back function.
      let data = new Uint8Array(event.target.result);
      let workbook = XLSX.read(data, {type: 'array'});
      // convertToXML();
    };
    reader.readAsArrayBuffer(file); // Load the file then fire the call-back.
  }

let setupListeners = function(){
    let datafile = document.getElementById("datafile");
    datafile.addEventListener('change', handleFile, false);
  
}

window.onload = setupListeners;
