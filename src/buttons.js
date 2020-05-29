/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
JS FILE 1/5 - BUTTONS
*/

// Show/hide the selection block which contains choosen ostraca
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

// Show/hide the filter block which contains parameters to filter
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

// Reset button : remove all filters already applied
function reset(){
	updatedList = originalValues;
	document.getElementById("insideFiltersBlock").innerHTML="";
	document.getElementById("parameter").value="";
	showData(attributs,updatedList, "s");
	showPics(updatedList,attributs, PicsNamesList);
}

// Switch button : switch between views of data and pictures
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
		document.getElementById("switchButton").innerText="PICTURES";
    }
}

// Edition button : add, remove or edit ostraca
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
		document.getElementById("edit").style.color="black";
}
