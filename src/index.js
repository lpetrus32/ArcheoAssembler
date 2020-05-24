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
    let Button = document.getElementById("show_hideFiltersButton");

    let FiltersBlock = document.getElementById("FiltersBlock");
    if(FiltersBlock.clientHeight == 0){

        Button.innerHTML = `<img id="iconeResize" src="../ico/resize1.png"/>`;
        FiltersBlock.style.display = "block";
        DataBlock.style.height = (mainBlockHeight*0.84)+'px';
        PicsBlock.style.height = (mainBlockHeight*0.84)+'px';
    }else{
        Button.innerHTML = `<img id="iconeResize" src="../ico/resize2.png"/>`;
        FiltersBlock.style.display = "none";
        DataBlock.style.height = (mainBlockHeight-3)+'px';
        PicsBlock.style.height = (mainBlockHeight-3)+'px';
    }
}

// Reset button
function reset(){
	updatedList = originalValues;
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";
	showData(attributs,updatedList, "s");
	showPics(updatedList,attributs, PicsNamesList);
}

// Switch button between Data and pictures
function switchAction(){
    let DataBlock = document.getElementById("DataBlock");
    let PicsBlock = document.getElementById("PicsBlock");
    
    if(DataBlock.clientHeight != 0){
        DataBlock.style.display="none";
		PicsBlock.style.display="block";
		document.getElementById("switchButton").innerText="DATA";
    }else{
        DataBlock.style.display="block";
		PicsBlock.style.display="none";
		document.getElementById("switchButton").innerText="FRAGMENTS";
    }
}

function editionMode1(){
	let dataBlock = document.getElementById("DataBlock");
		if(dataBlock.style.display=="none"){
			switchAction();
		}
		document.body.style.backgroundColor="grey";
		dataBlock.style.borderStyle= "dashed";
		document.getElementById("switchButton").style.visibility="hidden";
		document.getElementById("selectionBlock").style.visibility="hidden";
		document.getElementById("editButtons").style.visibility="visible";
		showData(attributs, updatedList);
		document.getElementById("editModeButton").onclick=editionMode2;
}
function editionMode2(){
		document.getElementById("switchButton").style.visibility="visible";
		document.getElementById("selectionBlock").style.visibility="visible";
		document.getElementById("editButtons").style.visibility="hidden";
		document.body.style.backgroundColor="white";
		document.getElementById("addDataBlock").style.visibility="hidden"; 
		document.getElementById("table").style.visibility="visible"; 
		document.getElementById("DataBlock").style.borderStyle= "groove";
		showData(attributs,updatedList, "s");
		showPics(updatedList,attributs, PicsNamesList);
		document.getElementById("editModeButton").onclick=editionMode1;
}

//--------------------------------------- CONVERSION FILE -> XML ---------------------------------------//
var PicsNamesList = [];
//xmlDoc = "";
function picsChosen(oEvent){
	var oPics = oEvent.target.files;
	PicsNamesList = ["../Data/"+oPics[0].webkitRelativePath.split("/")[0]+"/"]; //relative path

	for(let i = 0; i<oPics.length;i++){
		PicsNamesList.push(oPics[i].name);
	}
	
	showPics(updatedList,attributs, PicsNamesList);
}

xmlDoc = "";
// Conversion Function
function filePicked(oEvent) {

	//Reset possible previous parameters
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";

	// Downloading...
	document.getElementById("loading").style.visibility = "visible";
	
	// Get The Files From The Inputs
	var oFile = oEvent.target.files[0];
	var sFilename = oFile.name;

	if(/.xml$/.test(sFilename)) { // Check the end of the filename (.xml)
		document.getElementById("fileDiv").style.visibility="hidden";
		loadXML(oFile);

	} else{
		document.getElementById("fileDiv").style.visibility="hidden";

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
			xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n'; // Xml content as a string
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
				let xml = xmlDoc;
				getMD(new DOMParser().parseFromString(xml,"text/xml"));			
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
attributs = [], originalValues=[], updatedList = [];

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
	showData(attributs, updatedList,"s");

	// Create the attributes dropdown list
	let AttrLen = attributs.length;
	let menu = "";
	for (let a = 0; a < AttrLen; a++) {
		menu+=`<option id="${attributs[a]}" value="${attributs[a]}">${attributs[a]}<br>`;
	}
	document.getElementById("attributesMenu").innerHTML=menu;
	document.getElementById("attributesMenu2").innerHTML=menu;

	//ask for the pictures' attribut
	document.getElementById("picsAttribut").style.visibility = "visible";

	displayPossibleValues();
}


//--------------------------------------- DISPLAYS ---------------------------------------//
picsAttribut = "";

//ask for the pictures' attribut
function choosePicsAttribut(){
	picsAttribut=document.getElementById("attributesMenu2").value;
	document.getElementById("picsAttribut").style.visibility = "hidden";
	showData(attributs, updatedList, "s");
}

//return the updated pictures list according to the displayed data
function currentPicsList(updatedList,attributs, PicsNamesList){
	var IdpicsAttribut = attributs.indexOf(picsAttribut);
	var liste = [];
	let name ="";
	for(let i = 0; i<updatedList.length;i++){
		name = updatedList[i][IdpicsAttribut].replace(/\//,'_');
		for (let j = 1;j<PicsNamesList.length;j++){
			if(PicsNamesList[j].indexOf(name) != -1){
				liste.push(PicsNamesList[j]);
				break;
			}
		}
	}
	return liste;
}

//Display images
function showPics(updatedList,attributs, PicsNamesList){
	let maDiv = "";
	var picsList = currentPicsList(updatedList,attributs, PicsNamesList);
	for (let i=0;i<picsList.length;i++){
		maDiv+=`<div onclick="selectionner( this)" class="selectionBoxes"><input type="hidden" value="${picsList[i].split(".")[0]}"><img class="photoselectionnee" alt="Loading error" src="../Data/${PicsNamesList[0]}/${picsList[i]}"><br><label>${picsList[i].split(".")[0]}</label></div>`;
	}
	document.getElementById("PicsBlock").innerHTML=maDiv;
}

// Display Table
function showData(Attr, updatedList, edition="n"){ // Attr = attributs list, updatedList = remaining ostraca after filtering process
	document.getElementById("tableSize").textContent=`Table size = ${updatedList.length}`;
	
	let TableBody = document.getElementById("tbody");
	let Attributs = document.getElementById("attributes");
	let att="";
	let tableau="";   // chaine de caractere du tableau 
	for (let i = 0; i < Attr.length; i++) {
		att+=`<th scope="col">${Attr[i]}</th>`; // colnames
	}
	Attributs.innerHTML=att;
	var IdpicsAttribut = Attr.indexOf(picsAttribut);
	let choosen = false;

	for (let i = 0; i < updatedList.length; i++) {
		for(let k=0; k<panier.length;k++){ //Detect if fragment already choosen to adapt the display
			if(panier[k].indexOf(updatedList[i][IdpicsAttribut]) != -1){
				choosen = true;
				break;
			}
		}
		if(choosen == true){
			tableau+=`<tr id="ostraca${i}"  style="background-color : lightblue;">`; // row creation for each ostracon
		}else{tableau+=`<tr id="ostraca${i}">`;}
		
		for (let j = 0; j < updatedList[i].length; j++) {
			if(edition == "s"){
				tableau+=`<td onclick="selectionner( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else if(edition == "r"){
				tableau+=`<td onclick="removeAction( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else if(edition == "e"){
				tableau+=`<td onclick="editAction( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else{
				tableau+=`<td class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}
		}
		choosen = false;
		tableau+=`</tr>`;
	}
	//document.getElementsByClassName("selectionnee").onclick="selectionner( this)";
	TableBody.innerHTML=tableau;
	document.getElementById("loading").style.visibility = "hidden";
}


function selectionner(obj){
	// récup. de tous les INPUT de la TD passée en paramètre
  var oInput = obj.getElementsByTagName('input');
  // recuperer la value == ndefouille == imagename 
  imagename = oInput[0].value;
  afficherselection(imagename);
}


var panier =[]; // variable global des photo choisis qu on va utiliser pour lancer le python 
function afficherselection(imagename){
	var maDiv = document.getElementById("insideSelectionBlock");
	let presence = true;

	imagename=imagename.replace(/\//,'_');
	
												// regler le probleme des (/) dans les nde fouille 
												// chercher le motif dans la liste des photos
												// ajout de l extension et creation du chemain  // il y a un probleme d extension (parfois jpg et d autre JPG) // autre probleme il y a pas que ndefouille dans le nom de l image

	for (i=1 ;i<PicsNamesList.length;i++){
		if (PicsNamesList[i].indexOf(imagename) != -1){		// si on trouve le motif dans un nom d image 
									
			if(panier.indexOf(PicsNamesList[i]) == -1){
				
				let src =PicsNamesList[0]+PicsNamesList[i];   				// source de  l image 	
				
				panier.push(PicsNamesList[i]);
				maDiv.innerHTML+=`<div id="${PicsNamesList[i]}" class="selectionBoxes"><img src="${src}" class="photoselectionnee" alt="Loading error"><br><label>${PicsNamesList[i].split(".")[0]}</label></div>`;	// afficher l image 
				document.getElementById(PicsNamesList[i]).innerHTML+=`<button class="delButton" onclick="deleteSelection('${PicsNamesList[i]}')">X</button>`;
				//gestion des boutons
				let panierLength = panier.length;
				if(panierLength == 1){
					//document.getElementById("patchButton").onclick = CreatePatchs;
					document.getElementById("assemblyButton").onclick="alert('Please choose at least 2 fragments to try an assembly')";
				}else if(panierLength == 0 ){
					document.getElementById("patchButton").onclick = "alert('Please choose 1 fragment to create patches')";
					document.getElementById("assemblyButton").onclick="alert('Please choose at least 2 fragments to try an assembly')";
				}else{
					document.getElementById("patchButton").onclick = "alert('Only one fragment is required to create patches')";
				//	document.getElementById("assemblyButton").onclick = Assembly;
				}
				presence = true;

				showData(attributs, updatedList, "s");
				break;
			}else{
				alert("Fragment already choosen");
				presence = true;
				break;
			}
			
		}
		presence = false;
	}
	
	if(presence == false){
		alert("No picture avalaible!");
	}
}

function deleteSelection(img){
	panier.splice(panier.indexOf(img),1);
	document.getElementById(img).remove();
}


//--------------------------------------- FILTERING ---------------------------------------//

// Display Dropdown List
function displayPossibleValues(){
	let currentAttribut = document.getElementById("attributesMenu").value;
	let listPossibleValues = [];
	let index = attributs.indexOf(currentAttribut);
	let contain = false;
	let menu = `<option value="None">Select a value...</option>`;

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
		menu+=`<option id="${listPossibleValues[n]}" value="${listPossibleValues[n]}">${listPossibleValues[n]}<br>`;
	}
	document.getElementById("valuesMenu").innerHTML=menu;
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

NodeList.prototype.indexOf = Array.prototype.indexOf;

// Update the filtered fragments array
function getFilter(){
	let attribut = document.getElementById("attributesMenu").value;
	let parametre = document.getElementById("parameter").value;
	let value = document.getElementById("valuesMenu").value;
	let updatedList_2 = [];
	let elemSup ="";
	
	// Errors management
	if(attribut == "" || (value=="None" && parametre == "")){
		alert("Missing data.");

	}else if(value!="None" && parametre != ""){
		alert("Please enter only one parameter.");
	
	// Case 1 : filter entered in the parameter field
	}else if(value=="None" && parametre != ""){
		let index = attributs.indexOf(attribut);
		for(let j=0;j<updatedList.length;j++){
			if(testFilter(parametre,updatedList[j][index])){
				updatedList_2.push(updatedList[j]);
			}
		}
		elemSup = " " + parametre; // MODIF
	
	// Case 2 : filter chosen with the value dropdown list
	}else{
		let index = attributs.indexOf(attribut);
		for(let j=0;j<updatedList.length;j++){
			if(updatedList[j][index]==value){
				updatedList_2.push(updatedList[j]);
			}
		}
		elemSup = " (" + value + ")";
	}

	// Update the filtered fragments list
	if (updatedList_2.length != 0) {
		updatedList = updatedList_2;
		let insideFiltersBlock = document.getElementById("insideFiltersBlock");
		let d = document.createElement("div");
		d.setAttribute("attribut", attribut);
		d.setAttribute("filter", "== "+ value);
		d.setAttribute("id", "filterTag");
		let p = document.createElement("p");
		p.innerHTML = attribut + elemSup;
		d.appendChild(p);
		b = document.createElement("button");
    		b.innerHTML = "x";
    		b.addEventListener('click', deleteFilter, false);
    		d.appendChild(b);
		insideFiltersBlock.appendChild(d);

		document.getElementById("loading").style.visibility = "visible"; // Downloading...
		showData(attributs, updatedList, "s");
		if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
	
	}else{
		alert("No results found");
	}
};

//function to delete chosen filters
let deleteFilter = function(e) {
	let filterList = document.getElementById("insideFiltersBlock").childNodes;
    	let position = filterList.indexOf(e.target.parentNode);
	updatedList = originalValues;
	for(let i = 0; i < filterList.length; i++) {
		if (i != position) {
		let updatedList_2 = [];
		let index = attributs.indexOf(filterList[i].getAttribute("attribut"));
				let filter = filterList[i].getAttribute("filter");
			for(let j = 0; j < updatedList.length; j++){
				if(testFilter(filter, updatedList[j][index])) {
					updatedList_2.push(updatedList[j]);
				}
			}
			updatedList = updatedList_2;
		}
	}
	showData(attributs, updatedList, "s");
	if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
	e.target.parentNode.remove();
}

//--------------------------------------- DATA EDITING ---------------------------------------//

function add(){
	let Block = document.getElementById("addDataBlock"); 
	Block.innerHTML= "";
	Block.style.visibility="visible";
	document.getElementById("table").style.visibility="hidden";
	for(let i=0;i<attributs.length;i++){
		Block.innerHTML+=`<div class="addBoxes" style="border : solid;"><p>${attributs[i]}</p><input type="text" id ="add${i}" value="Undefined"></div>`;
	}
	Block.innerHTML+=`<input type="button" onclick="addAction()" value="Apply"></input>`;
}
function addAction(){	
	var addValues = [];
	var test = true;

	for(let i=0;i<attributs.length;i++){
		addValues.push(document.getElementById(`add${i}`).value);
	}
	xmlDoc = xmlDoc.substring(0,xmlDoc.length-13);
	xmlDoc +="<productData>\n";
	for(let j = 0; j < attributs.length; j++) {
		xmlDoc += `<${attributs[j]}>${addValues[j]}</${attributs[j]}>`;
	}
	xmlDoc += "</productData>\n";
	xmlDoc += "</Artefacts>\n";

	//test if picsAttribut already in the original values
	let index = attributs[0].indexOf(picsAttribut);
	for(let k=0;k<updatedList.length;k++){
			if(addValues[index]==updatedList[k][index]){
				test = false;
			}
	}

	if(test = true){
		originalValues.push(addValues);
		updatedList=originalValues;
		document.getElementById("addDataBlock").style.visibility="hidden";
		showData(attributs, updatedList);
		document.getElementById("table").style.visibility="visible";
		if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
		alert("Addition success");
	}else{
		alert("The picture's attribut is already choosen, please retry with another one");
	}
}

function remove(){
	showData(attributs, updatedList, "r");
	//document.getElementsByClassName("selectionnee").onclick="removeAction( this)";
	document.getElementById("remove").style.color="red";
}
function removeAction(obj){
	var oInput = obj.getElementsByTagName('input');
	let idName = oInput[0].value;
	let idx = 0, startIdx = 0,endIdx = 0;

	//remove from xml
	idx = xmlDoc.search(idName);
	endIdx = idx + xmlDoc.substring(idx).search("</productData>")+14;
	for(let i = idx;i<xmlDoc.length;i--){
		if(xmlDoc.substring(i,i+13) == "<productData>"){
			startIdx=i-1;
			break;
		}
	}
	xmlDoc = xmlDoc.substring(0,startIdx)+xmlDoc.substring(endIdx);

	//update values' lists

	for(let j=0;j<originalValues.length;j++){
		if(originalValues[j].indexOf(idName) != -1){
			originalValues.splice(j,1);
			break;
		}
	}

	updatedList=originalValues;
	showData(attributs, updatedList);
	if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
	alert("Removing success");
	document.getElementById("remove").style.color="black";
	document.getElementsByClassName("selectionnee").onclick="";
}

function edit(){
	showData(attributs, updatedList, "e");
	//document.getElementsByClassName("selectionnee").onclick="editAction( this)";
	document.getElementById("edit").style.color="darkgreen";
}

function editAction(obj){
	var oInput = obj.getElementsByTagName('input');
	let idName = oInput[0].value;
	let idx = 0, startIdx = 0,endIdx = 0;
	let line ="";

	//detect line from xml
	idx = xmlDoc.search(idName);
	endIdx = idx + xmlDoc.substring(idx).search("</productData>")+14;
	for(let i = idx;i<xmlDoc.length;i--){
		if(xmlDoc.substring(i,i+13) == "<productData>"){
			startIdx=i-1;
			break;
		}
	}
	line = xmlDoc.substring(startIdx,endIdx);

	//detect values in list
	for(let j=0;j<originalValues.length;j++){
		if(originalValues[j].indexOf(idName) != -1){
			let Block = document.getElementById("addDataBlock"); 
			Block.innerHTML= "";
			Block.style.visibility="visible";
			document.getElementById("table").style.visibility="hidden";
			for(let k=0;k<attributs.length;k++){
				Block.innerHTML+=`<div class="addBoxes" style="border : solid;"><p>${attributs[k]}</p><input type="text" id="edit${k}" value="${originalValues[j][k]}"></div>`;
			}
			Block.innerHTML+=`<input type="button" onclick="editAction2(${j},${startIdx},${endIdx})" value="Apply"></input>`;
			break;
		}
	}
}

function editAction2(idx,startIdx,endIdx){
	var addValues=[];

	//get new values
	for(let i=0;i<attributs.length;i++){
		addValues.push(document.getElementById(`edit${i}`).value);
	}

	//change values in list
	for(let k = 0;k<originalValues[idx].length;k++){
		originalValues[idx][k]=addValues[k];
	}
	updatedList=originalValues;

	//change line in xml
	var newline="";
	newline +="<productData>\n";
	for(let j = 0; j < attributs.length; j++) {
		newline += `<${attributs[j]}>${addValues[j]}</${attributs[j]}>`;
	}
	newline += "</productData>\n"; 
	xmlDoc=xmlDoc.substring(0,startIdx)+newline+xmlDoc.substring(endIdx);

	//reload table
	showData(attributs, updatedList);
	if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
	alert("Changing success");
	document.getElementById("addDataBlock").style.visibility="hidden";
	document.getElementById("table").style.visibility="visible";
	document.getElementById("edit").style.color="black";
}

//--------------------------------------- SETUP LISTENERS ---------------------------------------//

let setupListeners = function(){
	let datafile = document.getElementById("file");
	datafile.addEventListener('change', filePicked, false);

	let pics = document.getElementById("pics");
	pics.addEventListener('change', picsChosen, false);

	let attributMenu = document.getElementById("attributesMenu");
	attributMenu.addEventListener('change', displayPossibleValues, false);
}

window.onload = setupListeners;
