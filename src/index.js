<!--
ArcheoAssembler. Project
M1 BioInformatique
Projet de programmation
Référente/Cliente : Ostertag Cécilia
-->

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ArcheoAssembler.</title>
    <link rel="stylesheet" href="index.css">
  </head>
  <body>
    <header>
      <h1><span>A</span>RCHEO <br> &nbsp; &nbsp; <span>A</span>SSEMBLER.</h1>
      <div id="menu">
        <button id="restart" onclick="window.location.reload()">START A NEW PROJECT</button>
        |
        <button id="tutorials">TUTORIALS</button>
        |
        <button id="contacts" href="#bas">CONTACTS</button>
    </div>
    </header>

        <!--MAIN BLOCK-->
        <div id="mainBlock">
          <button class="button1" id="show_hideFiltersButton" onclick="show_hideAction();">HIDE FILTERS</button>
          <button class="button1" id="switchButton" onclick="switchAction();">SWITCH</button>  
            <div class="block" id="FiltersBlock">
              <button class="button1" id="resetButton" onclick="reset()">Clear</button>
              <form id="chooseFilter">
                <select id="attributesMenu"><option value="None">Select an attribute...</option></select><label for="attributesMenu"> | </label>
                <select id="valuesMenu"><option value="None">Select a value...</option></select><label for="valuesMenu"> or</label>
                <input type="text" id="parameter" placeholder="ex : >120 or == marron">
                <input type="button" onclick="getFilter()" value="Apply">
              </form>
              <p id="tableSize"></p>
              <div id="insideFiltersBlock">
              </div>
            </div>

            <!--TABLE BLOCK-->
            <div class="block" id="DataBlock">
              <input type="file" id="file" accept=".xml,.ods,.xls,.xlsx"> <!-- accepted files extensions -->

              <div id="loading">Downloading ...</div>
              
              <!--Conversion-->
              <script src="../lib/jszip.js"></script>
              <script src="../lib/xlsx.js"></script>
              <script lang="javascript" src="../lib/xls.js"></script>
              <script lang="javascript" src="../lib/sm.js"></script>
              
              <!--Table-->
              <table id="table">
                <thead>
                    <tr id="attributes"></tr>
                </thead>
                <tbody id="tbody"></tbody>
              </table>
            </div>

            <!--PICTURES BLOCK-->
             <div class="block" id="PicsBlock">
              <form action="my-script.php" enctype="multipart/form-data" method="post">
                <div><input type="file" onchange="handleFiles(files)" id="upload" multiple name="file"></div>
                <div><label for="upload"><span id="preview"></span></label></div>
              </form>
            </div>

            <!--SELECTION BLOCK-->
            <div class="block" id="selectionBlock">
              <h5>YOUR SELECTION:</h5>
              <div id="insideSelectionBlock"></div>
              <button id="show_hideSelectionButton" onclick="showSelection()"><</button>
            </div>
        </div>
    <footer>
      <a id="bas"></a>
      <p>© 2020 Université de Bordeaux</p>
    </footer>
    <script src="index.js"></script>
  </body>
</html>
