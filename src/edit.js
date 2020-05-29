/*
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
JS FILE 5/5 - DATA EDITING
*/

function adFile(oEvent){
    // Get The Files From The Inputs
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    if(/.xml$/.test(sFilename)) { // Check the end of the filename (.xml)
        let reader = new FileReader();
        reader.onload = function(){
            xmlDoc[1] = reader.result.toString();
            xmlDoc[0] = xmlDoc[0].substring(0,xmlDoc[0].length-13) + xmlDoc[1].substring(xmlDoc[1].search("<productData>"));
            let xml = xmlDoc[0];
            getMD(new DOMParser().parseFromString(xml,"text/xml"));	
        }
        
        reader.readAsText(oFile);
    } else{
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
            xmlDoc[0] = xmlDoc[0].substring(0,xmlDoc[0].length-13);
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
    
}


function add(){
    let Block = document.getElementById("addDataBlock"); 
    Block.innerHTML= "";
    Block.style.visibility="visible";
    document.getElementById("table").style.visibility="hidden";
    for(let i=0;i<attributs.length;i++){
        Block.innerHTML+=`<div class="addBoxes" style="border : solid;"><p>${attributs[i]}</p><input type="text" id ="add${i}" value="Undefined"></div>`;
    }
    Block.innerHTML+=`<input type="button" onclick="addAction()" value="Apply" style="position:absolute;bottom:-15px;left:5px;"></input>`;
}
function addAction(){	
    var addValues = [];
    var test = true;

    for(let i=0;i<attributs.length;i++){
        addValues.push(document.getElementById(`add${i}`).value);
    }

    xmlDoc[0] = xmlDoc[0].substring(0,xmlDoc[0].length-13);
    xmlDoc[0] +="<productData>\n";
    for(let j = 0; j < attributs.length; j++) {
        xmlDoc[0] += `<${attributs[j]}>${addValues[j]}</${attributs[j]}>`;
    }
    xmlDoc[0] += "</productData>\n";
    xmlDoc[0] += "</Artefacts>\n";

    // Test if picsAttribut is already in the original values
    let index = attributs[0].indexOf(picsAttribut);
    for(let k=0;k<updatedList.length;k++){
            if(addValues[index]==updatedList[k][index]){
                test = false;
                break;
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
    document.getElementById("remove").style.color="red";
}
function removeAction(obj){
    var oInput = obj.getElementsByTagName('input');
    let idName = oInput[0].value;
    let idx = 0, startIdx = 0,endIdx = 0;

    // Remove from xml
    idx = xmlDoc[0].search(idName);
    endIdx = idx + xmlDoc[0].substring(idx).search("</productData>")+14;
    for(let i = idx;i<xmlDoc[0].length;i--){
        if(xmlDoc[0].substring(i,i+13) == "<productData>"){
            startIdx=i-1;
            break;
        }
    }
    xmlDoc[0] = xmlDoc[0].substring(0,startIdx)+xmlDoc[0].substring(endIdx);

    // Update values'lists
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
    document.getElementById("edit").style.color="darkgreen";
    }

    function editAction(obj){
    var oInput = obj.getElementsByTagName('input');
    let idName = oInput[0].value;
    let idx = 0, startIdx = 0,endIdx = 0;
    let line ="";

    // Detect line from xml
    idx = xmlDoc[0].search(idName);
    endIdx = idx + xmlDoc[0].substring(idx).search("</productData>")+14;
    for(let i = idx;i<xmlDoc[0].length;i--){
        if(xmlDoc[0].substring(i,i+13) == "<productData>"){
            startIdx=i-1;
            break;
        }
    }
    line = xmlDoc[0].substring(startIdx,endIdx);

    // Detect values in list
    for(let j=0;j<originalValues.length;j++){
        if(originalValues[j].indexOf(idName) != -1){
            let Block = document.getElementById("addDataBlock"); 
            Block.innerHTML= "";
            Block.style.visibility="visible";
            document.getElementById("table").style.visibility="hidden";
            for(let k=0;k<attributs.length;k++){
                if(attributs[k]==picsAttribut){
                    Block.innerHTML+=`<div class="addBoxes" style="border : solid;"><p>${attributs[k]}</p><p id="edit${k}" value="${originalValues[j][k]}">${originalValues[j][k]}</p></div>`;
                }else{
                    Block.innerHTML+=`<div class="addBoxes" style="border : solid;"><p>${attributs[k]}</p><input type="text" id="edit${k}" value="${originalValues[j][k]}"></div>`;
                }
            }
            Block.innerHTML+=`<input type="button" onclick="editAction2(${j},${startIdx},${endIdx})" value="Apply" style="position:absolute;bottom:-15px;left:5px;"></input>`;
            break;
        }
    }
}

function editAction2(idx,startIdx,endIdx){
    var addValues=[];

    // Get new values
    for(let i=0;i<attributs.length;i++){
        addValues.push(document.getElementById(`edit${i}`).value);
    }

    // Change values in list
    for(let k = 0;k<originalValues[idx].length;k++){
        originalValues[idx][k]=addValues[k];
    }
    updatedList=originalValues;

    // Change line in xml
    var newline="";
    newline +="<productData>\n";
    for(let j = 0; j < attributs.length; j++) {
        newline += `<${attributs[j]}>${addValues[j]}</${attributs[j]}>`;
    }
    newline += "</productData>\n"; 
    xmlDoc[0]=xmlDoc[0].substring(0,startIdx)+newline+xmlDoc[0].substring(endIdx);

    // Reload table
    showData(attributs, updatedList);
    if(PicsNamesList.length > 0){showPics(updatedList,attributs, PicsNamesList);}
    alert("Changing success");
    document.getElementById("addDataBlock").style.visibility="hidden";
    document.getElementById("table").style.visibility="visible";
    document.getElementById("edit").style.color="black";

}
