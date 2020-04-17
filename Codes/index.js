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

// Ouvre un fichier XML fournit en input et recupere son DOM dans une variable globale

let xmlDoc;

let loadXML = function loadXML(input) { 
    let reader = new FileReader();
    let content = function(e) { // attend l'ouverture du fichier XML avant de s'executer 
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(reader.result,"text/xml");
    }
    reader.onload = content;
    reader.readAsText(input);
}

//FONCTIONS POUR RECUPERER LES VALEURS DE CHAQUE ATTRIBUT DE CHAQUE FRAGMENT///// 
function readXml(xml){
	let i=0;
	let lines = [];
	let newline = "";

	while(i<xml.length){
		newline="";
		do{
		newline+=xml[i];
		i++;
		}while(xml.substring(i+1,i+3)[i] != "\n");

		if(!(newline in ["<?xml version=1.0 encoding=ISO-8859-1 ?>","<productData>","</productData>"])){
			lines.push(newline);
		}
		i++;
	}
	return lines;
}

function getXmlAttributes(str) {
	let i = 2;
	var attribut = "";

	while(i<str.length){
		if((str.substring(i-2,i)) == "</"){           
			while(str[i] != ">"){
				attribut+=str[i];
				i++;
			}
			attributs.push(attribut);
			attribut = "";
		}
		i++;   
	}
	return attributs;
}

function getXmlValue(str, key) {
  return str.substring(
	str.lastIndexOf('<' + key + '>') + ('<' + key + '>').length,
	str.lastIndexOf('</' + key + '>')
  );
}


function createObjects(attributs, lignes, list){

	for(let i=0;i<lignes.length;i++){

		let objectValues = [];
		for(let j=0;j<attributs.length;j++){
			objectValues.push(getXmlValue(lignes[i], attribut[j]));
		}
		list.push(objectValues);
	}
}

// conversion est affichage des donner 
function filePicked(oEvent) {
	// Get The File From The Input
	var oFile = oEvent.target.files[0];
	var sFilename = oFile.name;
	if(!oFile) {
		alert("Failed to load file");
    	} else if(/.xml$/.test(sFilename)) { // vérifie que le nom du fichier se termine par .xml
		loadXML(oFile);
    	} else if(/.ods$/.test(sFilename)) {
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
				let headings = csvData[1].split(',').map(row => row.trim());
				for (z=0 ;z<headings.length;z++){ // pour eliminer les espace et les caractere specieux des balise 
						for (h=0;h<headings[z].length;h++){
						headings[z]=headings[z].replace(' ','');// pour les balise ou il y a faute de frappe avec deux espace 
						headings[z]=headings[z].replace('/','');
						headings[z]=headings[z].replace("'","");
						headings[z]=headings[z].replace('°','');
						headings[z]=headings[z].replace('.','');
					}
				}

				var xml = ``;
				xml="<?xml version="+"1.0"+" encoding="+"ISO-8859-1"+" ?>\n";                           
				for(let i = 2; i < csvData.length; i++) {
				let details = csvData[i].split(',').map(row => row.trim());
				xml += "<productData>\n";

				for(let j = 0; j < headings.length; j++) {
					if (headings[j] !== ""){    // condition pour regler le probleme de dimension du tableau 
				xml += `<${headings[j]}>${details[j]}</${headings[j]}>`;
					}
				};								
				xml += "\n</productData>\n"; // xml : le fichier xml 

				};

				/*
				//Function to download data to a file
				function download(data, filename, type) {
					var file = new Blob([data], {type: type});
					if (window.navigator.msSaveOrOpenBlob) // IE10+
						window.navigator.msSaveOrOpenBlob(file, filename);
					else { // Others
						var a = document.createElement("a"),
								url = URL.createObjectURL(file);
						a.href = url;
						a.download = filename;
						document.body.appendChild(a);
						a.click();
						setTimeout(function() {
							document.body.removeChild(a);
							window.URL.revokeObjectURL(url);  
						}, 0); 
					}
				}*/

			}
			);



		/*//creation de la liste de fragments :
		lignes = readXml(xml);

		attributs = getXmlAttributes(lignes[0]);
		createObjects(attributs,lignes,Objects); //liste de la liste des valeurs de chaque fragment

		console.log(Objects[0][1]);	*/
		}
	// Tell JS To Start Reading The File.. You could delay this if desired
	reader.readAsBinaryString(oFile);
	}
}
var attributs = [], lignes=[], Objects=[];



let setupListeners = function(){
    let datafile = document.getElementById("file");
    datafile.addEventListener('change', filePicked, false);
}
window.onload = setupListeners;
