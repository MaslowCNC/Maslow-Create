import GlobalVariables from './globalvariables'

class Menu {
    constructor(){
        this.menu = document.querySelector('.menu');
        this.menu.classList.add('off');
        this.menuList = document.getElementById("menuList");
    
        //Add the search bar to the list item
    
        for(var key in GlobalVariables.availableTypes) {
            var newElement = document.createElement("LI");
            var instance = GlobalVariables.availableTypes[key];
            var text = document.createTextNode(instance.atomType);
            newElement.setAttribute("class", "menu-item");
            newElement.setAttribute("id", instance.atomType);
            newElement.appendChild(text); 
            this.menuList.appendChild(newElement); 
            
            //Add function to call when atom is selected
            document.getElementById(instance.atomType).addEventListener('click', (e) => {
               this.placeNewNode(e);
            });
            
        }
        
        //Add functions to call when tabs are clicked
        document.getElementById("localTab").addEventListener("click", (e) => {
            this.openTab(e, "menuList");
        });
        document.getElementById("githubTab").addEventListener("click", (e) => {
           this.openTab(e, "githubList");
        });
        //Add function call when background is right clicked
        document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
           this.showmenu(e);
        });
        //Add function call to search when typing
        document.getElementById('menuInput').addEventListener('keyup', (e) => {
           this.searchMenu(e);
        });
    }
    
    placeNewNode(ev){
        let clr = ev.target.id;
        this.hidemenu(ev);
        
        GlobalVariables.currentMolecule.placeAtom({
            x: this.menu.x, 
            y: this.menu.y, 
            parent: GlobalVariables.currentMolecule,
            atomType: clr,
            uniqueID: GlobalVariables.generateUniqueID()
        }, null, GlobalVariables.availableTypes); //null indicates that there is nothing to load from the molecule list for this one
    }

    placeGitHubMolecule(ev){
        this.hidemenu();
        let clr = ev.target.id;
        
        GlobalVariables.currentMolecule.placeAtom({
            x: this.menu.x, 
            y: this.menu.y, 
            parent: GlobalVariables.currentMolecule,
            atomType: "GitHubMolecule",
            projectID: clr,
            uniqueID: GlobalVariables.generateUniqueID()
        }, null, GlobalVariables.availableTypes); //null indicates that there is nothing to load from the molecule list for this one
    }

    showmenu(ev){
        //Open the default tab
        document.getElementById("localTab").click();
        
        //stop the real right click menu
        ev.preventDefault(); 
        
        //make sure all elements are unhidden
        var ul = document.getElementById("menuList");
        var li = ul.getElementsByTagName('li');
        for (var i = 0; i < li.length; i++) {
            li[i].style.display = "none"; //set each item to not display
        }
        
        //show the menu
        this.menu.style.top = `${ev.clientY - 20}px`;
        this.menu.style.left = `${ev.clientX - 20}px`;
        this.menu.x = ev.clientX;
        this.menu.y = ev.clientY;
        this.menu.classList.remove('off');
        
        document.getElementById('menuInput').focus();
    }

    hidemenu(ev){
        this.menu.classList.add('off');
        this.menu.style.top = '-200%';
        this.menu.style.left = '-200%';
    }

    searchMenu(evt) {
      
        if(document.getElementsByClassName("tablinks active")[0].id == "localTab"){
            //We are searching the local tab
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
            //We are searching on github
            if(evt.code == "Enter"){
                input = document.getElementById('menuInput').value;
                
                this.githubList = document.getElementById("githubList");
                
                var oldResults = document.getElementsByClassName("menu-item");
                for (i = 0; i < oldResults.length; i++) {
                    oldResults[i].style.display = "none";
                }
                
                GlobalVariables.gitHub.octokit.search.repos({  //FIXME: This should be a function exported from the GitHub objects
                    q: 'topic:react',
                    sort: "stars",
                    per_page: 100,
                    page: 1,
                    headers: {
                        accept: 'application/vnd.github.mercy-preview+json'
                    }
                }).then(result => {
                    console.log("Search results: ");
                    console.log(result);
                    result.data.items.forEach(item => {
                        if(item.topics.includes("maslowcreate-molecule")){
                        
                            var newElement = document.createElement("LI");
                            var text = document.createTextNode(item.name);
                            newElement.setAttribute("class", "menu-item");
                            newElement.setAttribute("id", item.id);
                            newElement.appendChild(text); 
                            this.githubList.appendChild(newElement); 
                            
                            document.getElementById(item.id).addEventListener('click', placeGitHubMolecule);
                        }
                    });
                })
            }
        }
    }

    openTab(evt, tabName) {
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
}

export default (new Menu);