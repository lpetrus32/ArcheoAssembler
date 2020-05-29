/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
JS FILE 2/5 - CONVERSIONS + SETUP LISTENERS
*/

var PicsNamesList = [];

//get the names of all images from the folder
function picsChosen(oEvent){
	var oPics = oEvent.target.files;
	PicsNamesList = ["../Data/"+oPics[0].webkitRelativePath.split("/")[0]+"/"]; //relative path

	for(let i = 0; i<oPics.length;i++){
		PicsNamesList.push(oPics[i].name);
	}

	showPics(updatedList,attributs, PicsNamesList);
}

xmlDoc = []; //xmlDoc[0] = xml string, xmlDoc[1] = additional xml string

// Conversion Function
function conversion(oEvent) {

	//Reset possible previous parameters
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";

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

			//create de xml variable
			xmlDoc[0] = '<?xml version="1.0" encoding="UTF-8"?>\n';
			xmlDoc[0] += "<Artefacts>\n";
			for(let i = 2; i < csvData.length; i++) {
				let details = csvData[i].split(',').map(row => row.trim());
				xmlDoc[0] += "<productData>\n";
				for(let j = 0; j < headings.length; j++) {
					if (headings[j] !== ""){    // Condition to solve the table size
						xmlDoc[0] += `<${headings[j]}>${details[j]}</${headings[j]}>`;
					}
				}
				xmlDoc[0] += "</productData>\n";
				}
				xmlDoc[0] += "</Artefacts>\n";
				let xml = xmlDoc[0];
				getMD(new DOMParser().parseFromString(xml,"text/xml"));		
					
		}
		
		// Tell JS To Start Reading The File
		reader.readAsBinaryString(oFile);
	}
	//ask for the pictures' attribut
	document.getElementById("picsAttribut").style.visibility = "visible";
}


//XML File to Object
let loadXML = function loadXML(input) { 
    let reader = new FileReader();
    let content = function(e) { // Waiting for the opening file XML
        let parser = new DOMParser();
		let xml = parser.parseFromString(reader.result,"text/xml");
		getMD(xml);
		xmlDoc[0] = reader.result;
    }
    reader.onload = content;
    reader.readAsText(input);
}

// Store attributes and values for each fragment in an array
attributs = [], originalValues=[], updatedList = [];

//XML String to Arrays
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
	showData(attributs, updatedList,"s");

	// Create the attributes dropdown list
	let AttrLen = attributs.length;
	let menu = "";
	for (let a = 0; a < AttrLen; a++) {
		menu+=`<option id="${attributs[a]}" value="${attributs[a]}">${attributs[a]}<br>`;
	}
	document.getElementById("attributesMenu").innerHTML=menu;
	document.getElementById("attributesMenu2").innerHTML=menu;

	displayPossibleValues();
}

//--------------------------------------- SETUP LISTENERS ---------------------------------------//
let setupListeners = function(){
	let datafile = document.getElementById("file");
	datafile.addEventListener('change', conversion, false);

	let addData = document.getElementById("adFile");
	addData.addEventListener('change', adFile, false);

	let pics = document.getElementById("pics");
	pics.addEventListener('change', picsChosen, false);

	let attributMenu = document.getElementById("attributesMenu");
	attributMenu.addEventListener('change', displayPossibleValues, false);
}

window.onload = setupListeners;
