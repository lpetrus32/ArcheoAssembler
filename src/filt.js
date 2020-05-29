/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
JS FILE 4/5 - FILTERING
*/

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

// Delete chosen filters
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
