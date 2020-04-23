/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
*/

//--------------------------------------- BUTTONS ---------------------------------------//

// Button show_hideSelection
function showSelection(){
	let selectionBlock = document.getElementById("selectionBlock");
	let button = document.getElementById("show_hideSelectionButton");
	let Width = selectionBlock.clientWidth+6;
	button.textContent = ">";
	selectionBlock.style.transform = `translateX(-${Width}px)`;
	selectionBlock.style.transitionDuration = "1s";
	button.onclick = hideSelection;
}

function hideSelection(){
	let selectionBlock = document.getElementById("selectionBlock");
	let button = document.getElementById("show_hideSelectionButton");
	button.textContent = "<";
	selectionBlock.style.transform = `translateX(0px)`;
	selectionBlock.style.transitionDuration = "1s";
	button.onclick = showSelection;
}

// Button show_hideFiltersButton
function show_hideAction(){
    let DataBlock = document.getElementById("DataBlock");
    let PicsBlock = document.getElementById("PicsBlock");
    let mainBlockHeight = document.getElementById("mainBlock").clientHeight;
    let ButtonText = document.getElementById("show_hideFiltersButton");

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

// Reset button
function reset(){
	updatedList = originalValues;
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";
	showData(attributs,updatedList);
}

// Switch button between Data and pictures
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

//--------------------------------------- CONVERSION FILE -> XML ---------------------------------------//

// Conversion Function
function filePicked(oEvent) {

	//Reset possible previous parameters
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";


	// Downloading...
	document.getElementById("loading").style.visibility = "visible";
	
	// Get The File From The Input
	var oFile = oEvent.target.files[0];
	var sFilename = oFile.name;
    console.log(sFilename);
	if(!oFile) {
		alert("Failed to load file");
	} else if(/.xml$/.test(sFilename)) { // Check the end of the filename (.xml)
		document.getElementById("file").style.visibility="hidden";
		loadXML(oFile);

    } else{
		document.getElementById("file").style.visibility="hidden";

		var reader = new FileReader();
	
		// Read The Event For When A File Gets Selected
		reader.onload = function(e) {
		var data = e.target.result;
		var cfb = XLSX.read(data, {type: 'binary'}); // Conversion
		
		// Obtain The Current Row As CSV
		var csvData = XLS.utils.make_csv(cfb.Sheets[cfb.SheetNames[0]]); // Conversion xls /xlsx / ods to csv 
		
		// Conversion CSV -> XML
		csvData = csvData.split('\n').map(row => row.trim());  
		let headings = csvData[1].split(',').map(row => row.trim());
		for (z=0 ;z<headings.length;z++){ // Clean tags
			for (h=0;h<headings[z].length;h++){
			headings[z]=headings[z].replace(' ','');
			headings[z]=headings[z].replace('/','');
			headings[z]=headings[z].replace("'","");
			headings[z]=headings[z].replace('°','');
			headings[z]=headings[z].replace('.','');
			}
		}
		let xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n'; // Xml content as a string
		xmlDoc += "<Artefacts>\n";
		for(let i = 2; i < csvData.length; i++) {
			let details = csvData[i].split(',').map(row => row.trim());
			xmlDoc += "<productData>\n";
			for(let j = 0; j < headings.length; j++) {
				if (headings[j] !== ""){    // Condition to solve the table size
					xmlDoc += `<${headings[j]}>${details[j]}</${headings[j]}>`;
				}
			}
			xmlDoc += "</productData>\n"; // xml : le fichier xml 
			}
			xmlDoc += "</Artefacts>\n";
			getMD(new DOMParser().parseFromString(xmlDoc,"text/xml"));			
		}
		
		// Tell JS To Start Reading The File
		reader.readAsBinaryString(oFile);
	}
}

//XML File to Object
let loadXML = function loadXML(input) { 
    let reader = new FileReader();
    let content = function(e) { // Waiting for the opening file XML
        let parser = new DOMParser();
		let xmlDoc = parser.parseFromString(reader.result,"text/xml");
		getMD(xmlDoc);
    }
    reader.onload = content;
    reader.readAsText(input);
}

// Store attributes and values for each fragment in an array
let attributs = [], originalValues=[], updatedList = [];

//XML String to Array
let getMD = function(xdoc) {
	attributs = [];
	originalValues=[];
	updatedList = [];
	let objectsList = xdoc.documentElement.childNodes;
	
    for (let i = 1; i < objectsList.length - 1; i++) {
        if (objectsList[i].nodeType === 1) { // Check if the node match a fragment 
			let mdList = objectsList[i].childNodes; // Attributes nodes
			
            let valuesList = [];
            for (let j = 1; j < mdList.length - 1; j++) {
                if (i === 1) {
					attributs.push(mdList[j].nodeName);
				}
                valuesList.push(mdList[j].textContent);
            }
            originalValues.push(valuesList);
			updatedList.push(valuesList); 
		}
	}

	document.getElementById("loading").style.visibility = "visible"; // Downloading...
	showData(attributs, updatedList);

	// Create the attributes dropdown list
	let AttrLen = attributs.length;
	for (let a = 0; a < AttrLen; a++) {
		document.getElementById("attributesMenu").innerHTML+=`<option id="${attributs[a]}" value="${attributs[a]}">${attributs[a]}<br>`;
	}

	displayPossibleValues();

}


//--------------------------------------- DISPLAYS ---------------------------------------//

/*
// Display Table
function showData(Attr, filteredOstr){ // Attr = attributs list, filteredOStr = remaining ostraca after filtering process
	let TableBody = document.getElementById("tbody");
	let Attributes = document.getElementById("attributes");
	let Ostracon;
	let FiltLen = filteredOstr.length;
	let AttrLen = Attr.length;
	document.getElementById("tableSize").innerHTML=`Table size = ${updatedList.length}`;

	TableBody.innerHTML="";
	for (let i = 0; i < AttrLen; i++) {
		Attributes.innerHTML+=`<th scope="col">${Attr[i]}</th>`; // colnames
	}
	for (let i = 0; i < FiltLen; i++) {
		TableBody.innerHTML+=`<tr id="ostraca${i}"></tr>`; // row creation for each ostracon
		Ostracon = document.getElementById(`ostraca${i}`); // keep the row
		let FiltLen_i = filteredOstr[i].length;
		for (let j = 0; j < FiltLen_i; j++) {
			Ostracon.innerHTML+=`<td>${filteredOstr[i][j]}</td>`; // cell creation for each value
		}
	}

	document.getElementById("loading").style.visibility = "hidden";
}*/

// Display Table
function showData(Attr, filteredOstr){ // Attr = attributs list, filteredOStr = remaining ostraca after filtering process
	document.getElementById("tableSize").textContent=`Table size = ${filteredOstr.length}`;
	
	let TableBody = document.getElementById("tbody");
	let Attributs = document.getElementById("attributes");
	let att='';
	let tableau='';   // chaine de caractere du tableau 
	for (let i = 0; i < Attr.length; i++) {
		att+=`<th scope="col">${Attr[i]}</th>`; // colnames
	}
	Attributs.innerHTML+=att;
	for (let i = 0; i < filteredOstr.length; i++) {
		tableau+=`<tr id="ostraca${i}">`; // row creation for each ostracon
		for (let j = 0; j < filteredOstr[i].length; j++) {
			if (j === 1 )
			{
				tableau+=`<td onclick="selectionner( this)" class ="selectionnee"><input type="hidden"  value="${filteredOstr[i][j]}">${filteredOstr[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}
			else 
			{	
				tableau+=`<td>${filteredOstr[i][j]}</td>`; // cell creation with for each value
			}
		}
		tableau+=`</tr>`;
	}
	TableBody.innerHTML+=tableau;
	document.getElementById("loading").style.visibility = "hidden";
}

function selectionner(obj)
{
	// récup. de tous les INPUT de la TD passée en paramètre
  var oInput = obj.getElementsByTagName('input');
  // recuperer la value == ndefouille == imagename 
  imagename = oInput[0].value;
  afficherselection(imagename);
}
var panier =[]; // variable global des photo choisis qu on va utiliser pour lancer le python 
function afficherselection(imagename)
{
	var maDiv = document.getElementById("insideBasketBlock");
	var listeimage=["17-36-4_213 Ostrakon klein.jpg","17-36-4_214 Ostrakon Senet (1).jpg","17-36-4_220 Ostrakon.JPG","17-36-4_242 Ostrakon.JPG","17-36-4_266 Ostrakon.JPG","17-36-4_301 Ostrakon (2).JPG","17-36-4_379 Ostrakon (2).JPG","17-36-4_388 Ostrakon.JPG","17-36-4_410 Ostrakon (1).JPG","17-36-4_423 Ostrakon.JPG","17-36-4_447 Ostrakon Falke (2).JPG","17-36-4_459 Ostrakon (3) Kartusche.JPG","17-36-4_501 Ostrakon.JPG","17-36-4_742 Ostrakon.JPG","17-36-4_819 Ostrakon.JPG","17-36-4_846 Ostrakon.JPG"];								// pour l instant en brute en attendant de generer la liste automatiquement 
	var test = 0;
	for (h=0;h<imagename.length;h++)
	{
		imagename=imagename.replace('/','_');
	}
																// regler le probleme des (/) dans les nde fouille 
																// chercher le motif dans la liste des photos
																// ajout de l extension et creation du chemain  // il y a un probleme d extension (parfois jpg et d autre JPG) // autre probleme il y a pas que ndefouille dans le nom de l image

	for (i=0 ;i<listeimage.length;i++)
	{
		var position = listeimage[i].indexOf(imagename);
		if (position !== -1)											// si on trouve le motif dans un nom d image 
		{	
			let src ="../Data/Pictures/"+listeimage[i];   				// source de  l image 
			let classe="photoselectionnee"; 							// creer une class
			let alt ="Problème avec le chargement de l'image"; 			// alternative si probleme de chargement 
			let monImage=`<img  src="${src}" class="${classe}" alt="${alt}">`; // creation de la balise
			if(panier. indexOf(monImage) === - 1)
			{
				panier.push(monImage);										// la variable panier sert a rien puisque reinitialiser a chaque click  solution peut etre la passer en global
				maDiv.innerHTML+=monImage;									// afficher l image 
			}
			else 
			{
				alert("vous avez deja selectionner cette donnes dans votre panier");
			}// afficher l image 
			test=1 ;

		}
	}
	if( test === 0)       												 // sinon afficher une alert pas de photo disponible 
	{
		alert("pas de photo disponible pour ces données!");
	}
}

//--------------------------------------- FILTERING ---------------------------------------//

// Display Dropdown List
function displayPossibleValues(){
	let currentAttribut = document.getElementById("attributesMenu").value;
	let valuesMenu = document.getElementById("valuesMenu");
	let listPossibleValues = [];
	let index = attributs.indexOf(currentAttribut);
	let contain = false;

	// Possible values for each attributes
	for (let i=0; i<originalValues.length;i++){
		let currentValue = originalValues[i][index];
		for(let j=0;j<listPossibleValues.length;j++){
			if(currentValue == listPossibleValues[j]){
				contain = true;
			}
		}
		if(contain==false && currentValue != ""){
			listPossibleValues.push(currentValue);
		}
		contain=false;
	}

	// Create the values dropdown list
	for (let n = 0; n < listPossibleValues.length; n++){
		valuesMenu.innerHTML+=`<option id="${listPossibleValues[n]}" value="${listPossibleValues[n]}">${listPossibleValues[n]}<br>`;
	}

}

// Keep the value in the parameter field and convert it into a logical comparison
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

// Update the filtered fragments array
function getFilter(){
	let attribut = document.getElementById("attributesMenu").value;
	let parametre = document.getElementById("parameter").value;
	let value = document.getElementById("valuesMenu").value;
	let updatedList_2 = [];
	let elemSup ="";
	
	// Errors management
	if(attribut == "" || (value=="None" && parametre == "")){
		alert("Missing data");

	}else if(value!="None" && parametre != ""){
		alert("Please enter only one parameter");
	
	// Case 1 : filter enter in the parameter field
	}else if(value=="None" && parametre != ""){
		let index = attributs.indexOf(attribut);
		for(let j=0;j<updatedList.length;j++){
			if(testFilter(parametre,updatedList[j][index])){
				updatedList_2.push(updatedList[j]);
			}
		}
		elemSup = parametre;
	
	// Case 2 : filter chosen with the value dropdown list
	}else{
		let index = attributs.indexOf(attribut);
		for(let j=0;j<updatedList.length;j++){
			if(updatedList[j][index]==value){
				updatedList_2.push(updatedList[j]);
			}
		}
		elemSup = value;	
	}

	// Update the filtered fragments list
	if (updatedList_2.length != 0) {
		updatedList = updatedList_2;
		let insideFiltersBlock = document.getElementById("insideFiltersBlock");
		let elem = document.createElement("div");
		elem.setAttribute("id", attribut);
		let txt = document.createTextNode(elemSup);
		elem.appendChild(txt);
		insideFiltersBlock.appendChild(elem);

		document.getElementById("loading").style.visibility = "visible"; // Downloading...
		showData(attributs, updatedList);
	
	}else{
		alert("No results found");
	}
};


//--------------------------------------- SETUP LISTENERS ---------------------------------------//

let setupListeners = function(){
    let datafile = document.getElementById("file");
	datafile.addEventListener('change', filePicked, false);

	let attributMenu = document.getElementById("attributesMenu");
	attributMenu.addEventListener('change', displayPossibleValues, false);
}

window.onload = setupListeners;
