/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
*/

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
//boutons show_hideSelection
function showSelection(){
	let selectionBlock = document.getElementById("BasketBlock");
	let button = document.getElementById("show_hideSelection");
	let Width = selectionBlock.clientWidth+6;
	button.textContent = ">";
	selectionBlock.style.transform = `translateX(-${Width}px)`;
	selectionBlock.style.transitionDuration = "1s";
	button.onclick = hideSelection;
}

function hideSelection(){
	let selectionBlock = document.getElementById("BasketBlock");
	let button = document.getElementById("show_hideSelection");
	let Width = selectionBlock.clientWidth+6;
	button.textContent = "<";
	selectionBlock.style.transform = `translateX(0px)`;
	selectionBlock.style.transitionDuration = "1s";
	button.onclick = showSelection;
}

//Cache ou affiche le block des filtres
function show_hideAction(){
    let DataBlock = document.getElementById("DataBlock");
    let PicsBlock = document.getElementById("PicsBlock");
    let mainBlockHeight = document.getElementById("mainBlock").clientHeight;
    let ButtonText = document.getElementById("show_hideButton");

    let FiltersBlock = document.getElementById("FiltersBlock");
    if(FiltersBlock.clientHeight == 0){
        ButtonText.textContent = "HIDE FILTERS";
        FiltersBlock.style.display = "block";
        DataBlock.style.height = (mainBlockHeight*0.8)+'px';
        PicsBlock.style.height = (mainBlockHeight*0.8)+'px';
    }else{
        ButtonText.textContent = "SHOW FILTERS";
        FiltersBlock.style.display = "none";
        DataBlock.style.height = (mainBlockHeight-6)+'px';
        PicsBlock.style.height = (mainBlockHeight-6)+'px';
    }
}

//bouton reset des filtres
function reset(){
	filtrage = lignes;
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parametre").innerHTML="";
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
    } else{
		var reader = new FileReader();

	
	// Ready The Event For When A File Gets Selected
	reader.onload = function(e) {
		var data = e.target.result;
		var cfb = XLSX.read(data, {type: 'binary'}); // conversion 
		// Obtain The Current Row As CSV
		var csvData = XLS.utils.make_csv(cfb.Sheets[cfb.SheetNames[0]]); // conversion xls /xlsx / ods -> csv 

			//Conversion CSV -> XML
			csvData = csvData.split('\n').map(row => row.trim());  
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
		let xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xmlDoc += "<Artefacts>\n";
		for(let i = 2; i < csvData.length; i++) {
                    let details = csvData[i].split(',').map(row => row.trim());
                    xmlDoc += "<productData>\n";
                    for(let j = 0; j < headings.length; j++) {
                        if (headings[j] !== ""){    // condition pour regler le probleme de dimension du tableau 
                            xmlDoc += `<${headings[j]}>${details[j]}</${headings[j]}>`;
                        }
                    }
                    xmlDoc += "</productData>\n"; // xml : le fichier xml 
		}
		xmlDoc += "</Artefacts>\n";
		//console.log(xmlDoc);
		getMD(new DOMParser().parseFromString(xmlDoc,"text/xml"));
				
	}
	
// Tell JS To Start Reading The File.. You could delay this if desired
reader.readAsBinaryString(oFile);
	}
}



let loadXML = function loadXML(input) { 
	
    let reader = new FileReader();
    let content = function(e) { // attend l'ouverture du fichier XML avant de s'executer 
        let parser = new DOMParser();
		let xmlDoc = parser.parseFromString(reader.result,"text/xml");
		//console.log(reader.result);
		getMD(xmlDoc);
    }
    reader.onload = content;
    reader.readAsText(input);
}
// Stocke le nom des attributs et les valeurs prisent par chaque ostracon dans les arrays correspondant
let attributs = [], lignes=[], filtrage = [];

let getMD = function(xdoc) {
	attributs = [];
	lignes=[];
	filtrage = [];
    let ostracaList = xdoc.documentElement.childNodes;
    for (let i = 1; i < ostracaList.length - 1; i++) {
        if (ostracaList[i].nodeType === 1) { // verifie qu'il s'agit d'un noeud correspondant a un ostracon
			let mdList = ostracaList[i].childNodes; // liste des noeuds attributs
			
            let valuesList = [];
            for (let j = 1; j < mdList.length - 1; j++) {
                if (i === 1) {
					attributs.push(mdList[j].nodeName);
				}
                valuesList.push(mdList[j].textContent);
            }
            lignes.push(valuesList);
			filtrage.push(valuesList); 
		}
		
	}

	showData(attributs, filtrage);//affichage du tableau

	//Affichage du menu des attributs
	for (let a = 0; a < attributs.length; a++) {
		document.getElementById("attributsMenu").innerHTML+=`<option id="${attributs[a]}" value="${attributs[a]}">${attributs[a]}<br>`;
	}
	displayPossibleValues();
}


//affichage listes déroulante
function displayPossibleValues(){
	let currentAttribut = document.getElementById("attributsMenu").value;
	console.log(currentAttribut);
	let champPossibleValues = document.getElementById("valuesMenu");
	let listPossibleValues = [];
	let index = attributs.indexOf(currentAttribut);
	let contain = false;

	for (let i=0; i<lignes.length;i++){ //fabrication de la liste des valeurs possibles pour l'attribut donné
		let currentValue = lignes[i][index];
		for(let j=0;j<listPossibleValues.length;j++){ //test la présence de la valeur dans la liste 
			if(currentValue == listPossibleValues[j]){
				contain = true;
			}
		}
		if(contain==false && currentValue != ""){
			listPossibleValues.push(currentValue);
		}
		contain=false;
	}

	champPossibleValues.innerHTML=`<form><br><option value="None"></option><br>`;
	for (let n = 0; n < listPossibleValues.length; n++){
		champPossibleValues.innerHTML+=`<option id="${listPossibleValues[n]}" value="${listPossibleValues[n]}">${listPossibleValues[n]}<br>`;
	}
	champPossibleValues.innerHTML+="</form>";

}

// Interprete la string correspondte a un filtre comme un test logique
let testFilter = function(s,attribut) {
	if (s.search("==") !== -1) {
		tStr = s.split(/\s*==\s*/);
		return attribut == tStr[1];
	}
	else if (s.search("!=") !== -1) {
		tStr = s.split(/\s*!=\s*/);
		return attribut != tStr[1];
	}
	else if (s.search("<=") !== -1) {
		tStr = s.split(/\s*<=\s*/);
		return attribut <= tStr[1];
	}
	else if (s.search("<") !== -1) {
		tStr = s.split(/\s*<\s*/);
		return attribut < tStr[1];
	}
	else if (s.search(">=") !== -1) {
		tStr = s.split(/\s*>=\s*/);
		return attribut >= tStr[1];
	}
	else if (s.search(">") !== -1) {
		tStr = s.split(/\s*>\s*/);
		return attribut > tStr[1];
	}
};
// Filtre les donnees (arrays 1D) contenuent dans un array 2D et le met a jour.
function getFilter(){
	let attribut = document.getElementById("attributsMenu").value;
	let parametre = document.getElementById("parametre").value;
	let value = document.getElementById("valuesMenu").value;
	let filtragePlus = [];
	let elemSup ="";
	
	if(attribut == "" || (value=="None" && parametre == "")){ //Données manquantes
		alert("Données manquantes");

	}else if(value!="None" && parametre != ""){		//Valeur ET paramètre entrés
		alert("Veuillez entrer au choix une valeur OU un paramètre");

	}else if(value=="None" && parametre != ""){		//Paramètre entré
		console.log("1");

		let index = attributs.indexOf(attribut);
		for(let j=0;j<filtrage.length;j++){
			if(testFilter(parametre,filtrage[j][index])){
				filtragePlus.push(filtrage[j]);
			}
		}
		elemSup = parametre;
		console.log(filtragePlus);	

	}else{	//Valeur entrée
		console.log("valeur");
		let index = attributs.indexOf(attribut);
		for(let j=0;j<filtrage.length;j++){
			if(filtrage[j][index]==value){
				filtragePlus.push(filtrage[j]);
			}
		}
		elemSup = value;
		console.log(filtragePlus);	
	}

	if (filtragePlus.length != 0) {
		console.log("fitragePlus !=0");
		filtrage = filtragePlus; // mise a jour de l'array a l'exterieur
		console.log(filtrage);
		// affiche le filtre dans la zone de la page web ou s'affichent les filtres actifs
		let insideFiltersBlock = document.getElementById("insideFiltersBlock");
		let elem = document.createElement("div");
		elem.setAttribute("id", attribut);
		let txt = document.createTextNode(elemSup);
		elem.appendChild(txt);
		insideFiltersBlock.appendChild(elem);

		document.getElementById("tableSize").innerHTML=`Table size = ${filtrage.length}`;

		showData(attributs, filtrage);//affichage du tableau
	}else{
		alert("0 entrées trouvées");
	}
	
};

// Show MD after filtering

function showData(Attr, filteredOstr){ // Attr = attributs list, filteredOStr = remaining ostraca after filtering process
	let Table = document.getElementById("table");
	let TableBody = document.getElementById("tbody");
	let Attributs = document.getElementById("attributs");
	let Ostracon;
	for (let i = 0; i < Attr.length; i++) {
		Attributs.innerHTML+=`<th scope="col">${Attr[i]}</th>`; // colnames
	}
	for (let i = 0; i < filteredOstr.length; i++) {
		TableBody.innerHTML+=`<tr id="ostraca${i}"></tr>`; // row creation for each ostracon
		Ostracon = document.getElementById(`ostraca${i}`); // keep the row
		for (let j = 0; j < filteredOstr[i].length; j++) {
			Ostracon.innerHTML+=`<td>${filteredOstr[i][j]}</td>`; // cell creation with for each value
		}
	}
}

let setupListeners = function(){
    let datafile = document.getElementById("file");
	datafile.addEventListener('change', filePicked, false);

	let attributMenu = document.getElementById("attributsMenu");
	attributMenu.addEventListener('change', displayPossibleValues, false);
}
window.onload = setupListeners;