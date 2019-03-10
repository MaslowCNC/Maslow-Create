
function placeNewNode(ev){
    hidemenu();
    let clr = ev.target.id;
    
    console.log("Trying to place");
    console.log(ev);
    
    currentMolecule.placeAtom({
        x: menu.x, 
        y: menu.y, 
        parent: currentMolecule,
        atomType: clr,
        uniqueID: generateUniqueID()
    }, null, availableTypes); //null indicates that there is nothing to load from the molecule list for this one
}

function placeGitHubMolecule(ev){
    hidemenu();
    let clr = ev.target.id;
    
    console.log("Trying to place");
    console.log(clr);
    
    currentMolecule.placeAtom({
        x: menu.x, 
        y: menu.y, 
        parent: currentMolecule,
        atomType: "GitHubMolecule",
        projectID: clr,
        uniqueID: generateUniqueID()
    }, null, availableTypes); //null indicates that there is nothing to load from the molecule list for this one
}

function showmenu(ev){
    //Open the default tab
    document.getElementById("localTab").click();
    
    //stop the real right click menu
    ev.preventDefault(); 
    
    //make sure all elements are unhidden
    ul = document.getElementById("menuList");
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
        li[i].style.display = "none"; //set each item to not display
    }
    
    //show the menu
    menu.style.top = `${ev.clientY - 20}px`;
    menu.style.left = `${ev.clientX - 20}px`;
    menu.x = ev.clientX;
    menu.y = ev.clientY;
    menu.classList.remove('off');
    
    document.getElementById('menuInput').focus();
}

function hidemenu(ev){
    menu.classList.add('off');
    menu.style.top = '-200%';
    menu.style.left = '-200%';
}

function searchMenu(evt) {
  
    if(document.getElementsByClassName("tablinks active")[0].id == "localTab"){
        console.log("local tab recognized");
        // Declare variables
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('menuInput');
        filter = input.value.toUpperCase();
        ul = document.getElementById("menuList");
        li = ul.getElementsByTagName('li');

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i]; //this is the link part of the list item
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) { //if the entered string matches
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
            
            //If enter was just pressed "click" the first element that is being displayed
            if(evt.code == "Enter" && li[i].style.display != "none"){
                li[i].click();
                return;
            }
        }
    }
    else{
        console.log("github tab recognized");
        if(evt.code == "Enter"){
            input = document.getElementById('menuInput').value;
            console.log("would search github now for: " + input);
            
            githubList = document.getElementById("githubList");
            
            oldResults = document.getElementsByClassName("menu-item");
            for (i = 0; i < oldResults.length; i++) {
                oldResults[i].style.display = "none";
            }
            
            octokit.search.repos({
                q: input,
                sort: "stars",
                per_page: 100,
                topic: "maslowcreate-molecule",
                page: 1,
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            }).then(result => {
                result.data.items.forEach(item => {
                    console.log(item);
                    if(item.topics.includes("maslowcreate-molecule")){
                    
                        var newElement = document.createElement("LI");
                        var text = document.createTextNode(item.name);
                        newElement.setAttribute("class", "menu-item");
                        newElement.setAttribute("id", item.id);
                        newElement.appendChild(text); 
                        githubList.appendChild(newElement); 
                        
                        document.getElementById(item.id).addEventListener('click', placeGitHubMolecule);
                    }
                });
            })
        }
    }
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}