import GlobalVariables from './globalvariables'
import cmenu from './NewMenu.js'

/**
 * This class creates the right click menu behavior for placing atoms.
 */
class Menu {
    /**
     * The constructor creates a new menu. The menu is only created once when the program launches and is hidden and displayed when the menu is needed.
     */
    constructor(){
        /** 
         * The HTML object which contains the menu
         * @type {object}
         */
        this.menu = document.querySelector('.menu')
        this.menu.classList.add('off')
        /** 
         * An array which lists all of the options in the menu.
         * @type {array}
         */
        this.menuList = document.getElementById('menuList')
    
        //Add the search bar to the list item
    
        for(var key in GlobalVariables.availableTypes) {
            var newElement = document.createElement('LI')
            var instance = GlobalVariables.availableTypes[key]
            var text = document.createTextNode(instance.atomType)
            newElement.setAttribute('class', 'menu-item')
            newElement.setAttribute('id', instance.atomType)
            newElement.appendChild(text) 
            this.menuList.appendChild(newElement) 
            
            //Add function to call when atom is selected
            document.getElementById(instance.atomType).addEventListener('click', (e) => {
                this.placeNewNode(e)
            })
            
        }
        
        //Add functions to call when tabs are clicked
        document.getElementById('localTab').addEventListener('click', (e) => {
            this.openTab(e, 'menuList')
        })
        document.getElementById('githubTab').addEventListener('click', (e) => {
            this.openTab(e, 'githubList')
        })
        //Add function call when background is right clicked
        document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
            //this.showmenu(e)
            //cmenu.show();
        })
        //Add function call to search when typing
        document.getElementById('menuInput').addEventListener('keyup', (e) => {
            this.searchMenu(e)
        })
    }
    
    /**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by clicking on a menu item.
     */ 
    placeNewNode(ev){
        let clr = ev.target.id
        this.hidemenu(ev)
        const invertScale = 1 / GlobalVariables.scale1
        GlobalVariables.currentMolecule.placeAtom({
            x: this.menu.x * invertScale, 
            y: this.menu.y * invertScale, 
            parent: GlobalVariables.currentMolecule,
            atomType: clr,
            uniqueID: GlobalVariables.generateUniqueID()
            
        }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one, true indicates the atom should spawn unlocked
    }
    
    /**
     * Runs when a menu option is clicked to place a new atom from searching on GitHub.
     * @param {object} ev - The event triggered by clicking on a menu item.
     */ 
    placeGitHubMolecule(ev){
        
        this.hidemenu()
        let clr = ev.target.id
        const invertScale = 1 / GlobalVariables.scale1
        
        GlobalVariables.currentMolecule.placeAtom({
            x: this.menu.x * invertScale, 
            y: this.menu.y * invertScale, 
            parent: GlobalVariables.currentMolecule,
            atomType: 'GitHubMolecule',
            projectID: clr,
            uniqueID: GlobalVariables.generateUniqueID()
        }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one
    }
    
    /**
     * Runs when a menu is opened by right clicking.
     * @param {object} ev - The event triggered by right clicking on the canvas.
     */ 
    showmenu(ev){
        //Open the default tab
        document.getElementById('localTab').click()
        
        //stop the real right click menu
        ev.preventDefault() 
        
        //make sure all elements are unhidden
        var ul = document.getElementById('menuList')
        var li = ul.getElementsByTagName('li')
        for (var i = 0; i < li.length; i++) {
            li[i].style.display = 'none' //set each item to not display
        }
        
        //show the menu
        this.menu.style.top = `${ev.clientY - 20}px`
        this.menu.style.left = `${ev.clientX - 20}px`
        this.menu.x = ev.clientX
        this.menu.y = ev.clientY
        this.menu.classList.remove('off')
        
        document.getElementById('menuInput').focus()
    }
    
    /**
     * Hides the menu if it is open.
     */ 
    hidemenu(){
        this.menu.classList.add('off')
        this.menu.style.top = '-200%'
        this.menu.style.left = '-200%'
    }
    
    /**
     * Runs when a new search is commanded.
     * @param {object} evt - The event triggered by the search bar.
     */ 
    searchMenu(evt) {
      
        if(document.getElementsByClassName('tablinks active')[0].id == 'localTab'){
            //We are searching the local tab
            // Declare variables
            var input, filter, ul, li, a, i, txtValue
            input = document.getElementById('menuInput')
            filter = input.value.toUpperCase()
            ul = document.getElementById('menuList')
            li = ul.getElementsByTagName('li')

            // Loop through all list items, and hide those who don't match the search query
            for (i = 0; i < li.length; i++) {
                a = li[i] //this is the link part of the list item
                txtValue = a.textContent || a.innerText
                if (txtValue.toUpperCase().indexOf(filter) > -1) { //if the entered string matches
                    li[i].style.display = ''
                } else {
                    li[i].style.display = 'none'
                }
                
                //If enter was just pressed "click" the first element that is being displayed
                if(evt.code == 'Enter' && li[i].style.display != 'none'){
                    li[i].click()
                    return
                }
            }
        }
        else{
            //We are searching on github
            if(evt.code == 'Enter'){
                input = document.getElementById('menuInput').value
                
                var githubList = document.getElementById('githubList')
                
                var oldResults = githubList.getElementsByClassName('menu-item')
                for (i = 0; i < oldResults.length; i++) {
                    githubList.removeChild(oldResults[i])
                }
                
                GlobalVariables.gitHub.searchGithub(input).then(result => {
                    result.data.items.forEach(item => {
                        var newElement = document.createElement('LI')
                        var text = document.createTextNode(item.name)
                        newElement.setAttribute('class', 'menu-item')
                        newElement.setAttribute('id', item.id)
                        newElement.appendChild(text) 
                        githubList.appendChild(newElement) 
                        
                        document.getElementById(item.id).addEventListener('click', (e) => {
                            this.placeGitHubMolecule(e)
                        })
                    })
                })
            }
        }
    }
    
    /**
     * Switches tabs within the menu.
     * @param {object} evt - The event triggered by clicking on a tab.
     * @param {object} tabName - The name of the tab clicked.
     */ 
    openTab(evt, tabName) {
        // Declare all variables
        var i, tabcontent, tablinks

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName('tabcontent')
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none'
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName('tablinks')
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '')
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName).style.display = 'block'
        evt.currentTarget.className += ' active'
      
        //Click on the search bar so that when you start typing it shows updateCommands
        document.getElementById('menuInput').focus()
    }
}

/**
 * Because we want the menu to be the same every time it is imported we export an instance of the menu instead of the constructor.
 */
export default (new Menu)