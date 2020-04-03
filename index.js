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

// conversion est affichage des données
function filePicked(oEvent) {
// Get The File From The Input
var oFile = oEvent.target.files[0];
var sFilename = oFile.name;
// Create A File Reader HTML5
var reader = new FileReader();

// Ready The Event For When A File Gets Selected
reader.onload = function(e) {
    var data = e.target.result;
    var cfb = XLSX.read(data, {type: 'binary'}); // conversion 
	cfb.SheetNames.forEach(function conv(sheetName) {
        // Obtain The Current Row As CSV
        var csvData = XLS.utils.make_csv(cfb.Sheets[sheetName]); 
		var data=XLS.utils.make_csv(cfb.Sheets[sheetName]); //// conversion xls /xlsx / ods -> csv 
		var employee_data = data.split(/\r?\n|\r/);
		let table_data = '<table class="table table-bordered table-striped">'; // affichage
		for(var count = 0; count<employee_data.length; count++)
		{
			var cell_data = employee_data[count].split(",");
			table_data += '<tr>';
			for(var cell_count=0; cell_count<cell_data.length; cell_count++)  // affichage
			{
					if(count === 0)
					{
						table_data += '<th>'+cell_data[cell_count]+'</th>';
					}
					else
					{
						table_data += '<td>'+cell_data[cell_count]+'</td>';
					}
			}
			table_data += '</tr>';
		}
    table_data += '</table>'; // table_data : la conversion csv-> tableau html 
	//console.log(table_data); //// test html 
	document.getElementById('DataBlock').innerHTML +=table_data; // affichage 
	
		csvData = csvData.split('\n').map(row => row.trim());  //// conversion csv-> xml 
		let headings = csvData[0].split(',');
		let xml = ``;
		xml="<?xml version="+"1.0"+" encoding="+"ISO-8859-1"+" ?>\n"                           
		for(let i = 1; i < csvData.length; i++) {
		let details = csvData[i].split(';')
		xml += "<productData>\n"
		
		for(let j = 0; j < headings.length; j++) {
		xml += `<${headings[j]}>${details[j]}</${headings[j]}>`
		};								
		xml += "</productData>\n"; // xml : le fichier xml 
		};
}
);

	}

// Tell JS To Start Reading The File.. You could delay this if desired
reader.readAsBinaryString(oFile);}

let setupListeners = function(){
    let datafile = document.getElementById("file");
    datafile.addEventListener('change', filePicked, false);
}
window.onload = setupListeners;

// Affichage des mignatures
function handleFiles(files) {
	var imageType = /^image\//;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (!imageType.test(file.type)) {
			alert("veuillez sélectionner une image");
		}else{
			if(i == 0){
				preview.innerHTML = '';
			}
			var img = document.createElement("img");
			img.classList.add("obj");
			img.file = file;
			preview.appendChild(img);
			var reader = new FileReader();
			reader.onload = ( function(aImg) {
				return function(e) {
					aImg.src = e.target.result;
				};
			})(img);

			reader.readAsDataURL(file);
		}

	}
}






