/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
JS FILE 3/5 - DISPLAYS + SELECTION
*/

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
	let tableau="";
	for (let i = 0; i < Attr.length; i++) {
		att+=`<th scope="col">${Attr[i]}</th>`; // colnames
	}
	Attributs.innerHTML=att;
	var IdpicsAttribut = Attr.indexOf(picsAttribut);
	let choosen = false;


	for (let i = 0; i < updatedList.length; i++) {
		for(let k=0; k<panier.length;k++){ //Detect if fragment already choosen to adapt the display
			if(panier[k].indexOf(updatedList[i][IdpicsAttribut].replace(/\//,'_')) != -1){
				choosen = true;
				break;
			}
		}
		if(choosen == true){ //if fragment already selected, the line will be grey
			tableau+=`<tr id="ostraca${i}"  style="background-color : darkgrey;">`; // row creation for each ostracon
		}else{tableau+=`<tr id="ostraca${i}">`;}
		
		for (let j = 0; j < updatedList[i].length; j++) {
			if(edition == "s"){ //selection mode
				tableau+=`<td onclick="selectionner( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else if(edition == "r"){ //deletion mode
				tableau+=`<td onclick="removeAction( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else if(edition == "e"){ //edit mode
				tableau+=`<td onclick="editAction( this)" class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}else{ //no mode
				tableau+=`<td class ="selectionnee"><input type="hidden"  value="${updatedList[i][IdpicsAttribut]}">${updatedList[i][j]}</td>`; // que la colonne des ndefouille cliquable 
			}
		}
		choosen = false;
		tableau+=`</tr>`;
	}
	TableBody.innerHTML=tableau;
	document.getElementById("loading").style.visibility = "hidden";
}

//selection function, get the id of a line
function selectionner(obj){
  var oInput = obj.getElementsByTagName('input');
  
  imagename = oInput[0].value;
  afficherselection(imagename);
}


var panier =[];

//if image not already selected, add it to the selection block
function afficherselection(imagename){
	var maDiv = document.getElementById("insideSelectionBlock");
	let presence = true;

	imagename=imagename.replace(/\//,'_'); //normalize the image name

	for (i=1 ;i<PicsNamesList.length;i++){
		if (PicsNamesList[i].indexOf(imagename) != -1){				
			if(panier.indexOf(PicsNamesList[i]) == -1){
				
				let src =PicsNamesList[0]+PicsNamesList[i];	
				
				panier.push(PicsNamesList[i]);
				maDiv.innerHTML+=`<div id="${PicsNamesList[i]}" class="selectionBoxes"><img src="${src}" class="photoselectionnee" alt="Loading error"><br><label>${PicsNamesList[i].split(".")[0]}</label></div>`;	// afficher l image 
				document.getElementById(PicsNamesList[i]).innerHTML+=`<button class="delButton" onclick="deleteSelection('${PicsNamesList[i]}')">X</button>`;
				//gestion des boutons
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

//remove the image from the selection block and panier[]
function deleteSelection(img){ 
	panier.splice(panier.indexOf(img),1);
	document.getElementById(img).remove();
	showData(attributs, updatedList, "s");
}
