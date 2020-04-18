
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

//Switch entre le tableau de métadonnées ou les images les fragments 
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


let xmlDoc;

let loadXML = function loadXML(input) { 
    let reader = new FileReader();
    let content = function(e) { // attend l'ouverture du fichier XML avant de s'executer 
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(reader.result,"text/xml");
	getMD(xmlDoc);
    }
    reader.onload = content;
    reader.readAsText(input);
}


//FONCTIONS POUR RECUPERER LES VALEURS DE CHAQUE ATTRIBUT DE CHAQUE FRAGMENT///// 
/*
var attributs = [], lignes=[], Objects=[];

function readXml(xml){
	let i=0;
	let lines = [];
	let newline = "";

	while(i<xml.length){
		newline="";
		do{
		newline=xml.substring(xml.lastIndexOf(""));
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
*/

// conversion est affichage des donner 
function filePicked(oEvent) {
	// Get The File From The Input
	var oFile = oEvent.target.files[0];
	var sFilename = oFile.name;
    console.log(sFilename);
	if(!oFile) {
		alert("Failed to load file");
    } else if(/.xml$/.test(sFilename)) { // vérifie que le nom du fichier se termine par .xml
		loadXML(oFile);
    } else if(/.ods$/.test(sFilename)) {
		var reader = new FileReader();

	
	// Ready The Event For When A File Gets Selected
	reader.onload = function(e) {
		var data = e.target.result;
		var cfb = XLSX.read(data, {type: 'binary'}); // conversion 
		// Obtain The Current Row As CSV
		var csvData = XLS.utils.make_csv(cfb.Sheets[cfb.SheetNames[0]]); // conversion xls /xlsx / ods -> csv 
		/*AFFICHAGE DU TABLEAU DEPUIS LE CSV (A RETIRER POUR APPLIQUER SUR LE XML)
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
			document.getElementById('DataBlock').innerHTML +=table_data; // affichage */

			//Conversion CSV -> XML
			csvData = csvData.split('\n').map(row => row.trim());  
			let headings = csvData[0].split(',').map(row => row.trim());
			for (z=0 ;z<headings.length;z++){ // pour eliminer les espace et les caractere specieux des balise 
					for (h=0;h<headings[z].length;h++){
					headings[z]=headings[z].replace(' ','');// pour les balise ou il y a faute de frappe avec deux espace 
					headings[z]=headings[z].replace('/','');
					headings[z]=headings[z].replace("'","");
					headings[z]=headings[z].replace('°','');
					headings[z]=headings[z].replace('.','');
					}
			}
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
                xml += "<Artefacts>\n";
		for(let i = 2; i < csvData.length; i++) {
                    let details = csvData[i].split(',').map(row => row.trim());
                    xml += "<Ostracon>\n";
                    for(let j = 0; j < headings.length; j++) {
                        if (headings[j] !== ""){    // condition pour regler le probleme de dimension du tableau 
                            xml += `<${headings[j]}>${details[j]}</${headings[j]}>`;
                        }
                    }
                    xml += "\n</Ostracon>\n"; // xml : le fichier xml 
		}
		xml += "</Artefacts>\n";

				/*//Fonction pour télécharger le .xml
				var hiddenElement = document.createElement('a');

				hiddenElement.href = 'data:attachment/text,' + encodeURI(xml);
				hiddenElement.target = '../Data/';
				hiddenElement.download = 'data.xml';
				hiddenElement.click();*/


	//creation de la liste de fragments :
	/*lignes = readXml(xml);

	attributs = getXmlAttributes(lignes[0]);
	createObjects(attributs,lignes,Objects); //liste de la liste des valeurs de chaque fragment
											
	console.log(Objects[0][1]);*/

	}
// Tell JS To Start Reading The File.. You could delay this if desired
reader.readAsBinaryString(oFile);
    }
}

let attributs = [], lignes=[], Objects=[];
// - Ajoute des divs html contentant les references aux attributs (leur nom)
// - Stocke le nom des attributs et les valeurs prisent par chaque ostracon dans les arrays correspondant
let getMD = function(xdoc) {
    let ostracaList = xdoc.documentElement.childNodes;
    let block = document.getElementById("insideFiltersBlock"); // contiendra les divs crees
    for (let i = 1; i < ostracaList.length - 1; i++) {
        if (ostracaList[i].nodeType === 1) { // verifie qu'il s'agit d'un noeud correspondant a un ostracon
            let mdList = ostracaList[i].childNodes; // liste des noeuds attributs
            let valuesList = [];
            for (let j = 1; j < mdList.length - 1; j++) {
                if (i === 1) { // genere les divs
                    attributs.push(mdList[j].nodeName);
                    let elem = document.createElement("div");
                    elem.setAttribute("id", mdList[j].nodeName);
                    let txt = document.createTextNode(mdList[j].nodeName);
                    elem.appendChild(txt);
                    elem.style.display = "none";
                    block.appendChild(elem);
                }
                valuesList.push(mdList[j].textContent);
            }
            lignes.push(valuesList);
        }
    }
}

let setupListeners = function(){
    let datafile = document.getElementById("file");
    datafile.addEventListener('change', filePicked, false);
}
window.onload = setupListeners;
