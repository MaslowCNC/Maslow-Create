import CMenu from './lib/circularmenu.js'
import GlobalVariables from './globalvariables'

/**
 * Html element that contains the circular menu
 */    
var ele = document.querySelector('#circle-menu1')
/**
 * This creates a new instance of the circular menu. 
 */
var cmenu = CMenu(ele)
    .config({
        totalAngle: 360,//deg,
        spaceDeg: 1,//deg
        background: "#e1e1e1",
        backgroundHover: "#FFFFFF",
        percent: 0.20,//%
        diameter: 120,//px
        position: 'top',
        horizontal: true,
        //start: -45,//deg
        animation: "into",
        menus: [
            {
                title: '',
                icon: 'Actions',
                menus: makeArray('Actions')        
            },
            {
                title: '',
                icon: 'Properties',
                menus: makeArray('Properties')
            },
            {
                title: '',
                icon: 'Import-export',
                menus: makeArray('Import/Export')
                                
            },
            {
                title: '',
                icon: 'Shapes',
                menus: makeArray('Shapes')
            },
            {
                title: '',
                icon: 'Interaction',
                menus: makeArray('Interactions')
            }
        ]
    })
/**
     * Runs to create submenus from Global Variables atomCategories. Populates menu objects
     * @param {object} group - Name of the category to find appropriate atoms
     */ 
function makeArray(group) {
                
    var menuArray = []
    for(var key in GlobalVariables.availableTypes){
        var instance = GlobalVariables.availableTypes[key] 
        if(instance.atomCategory === group){
            var subMenu = new Object()
            subMenu.title = `${instance.atomType}`
            subMenu.icon = `${instance.atomType}`
            subMenu.name = instance.atomType
            subMenu.click = function menuClick(e, title){ 
                if (title.icon === 'GitHubMolecule'){
                    showGitHubSearch(e)
                }
                else{
                    e.target.id = title.name
                    placeNewNode(e)
                }
            }  
            menuArray.push(subMenu)
        }
    }
    return menuArray
}

/*Mask the default context menu on the main canvas*/
document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
    e.preventDefault()
}) 

/*Mask the default context menu on the menu*/
ele.addEventListener('contextmenu', (e) => {
    e.preventDefault()
}) 

var doubleClick

/* Right click to open circular menu -- mouse click and drag*/
document.getElementById('flow-canvas').addEventListener('mousedown', event => {
    //every time the mouse button goes down
    if (event.detail === 1) {
        doubleClick = false
        // it was a single click
        var isRightMB

        if ("which" in event){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            isRightMB = event.which == 3
        }
        else if ("button" in event){  // IE, Opera 
            isRightMB = event.button == 2
        }
        if(isRightMB){
            cmenu.show([event.clientX, event.clientY],doubleClick)
            return
        }
    } else if (event.detail === 2) {
        // it was a double click
        //every time the mouse button goes down
        doubleClick = true

        if ("which" in event){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            isRightMB = event.which == 3
        }
        else if ("button" in event){  // IE, Opera 
            isRightMB = event.button == 2
        }
        if(isRightMB){
            cmenu.show([event.clientX, event.clientY],doubleClick)
            return
        }
    }
})

//Add function call to search when typing
document.getElementById('menuInput').addEventListener('keyup', (e) => {
    if(e.code == 'Enter'){
        searchMenu()}
})

/**  List that contains results of gitHub search */
let githubList = document.getElementById('githubList')

/**
 * Runs when a gitHub molecule menu option is clicked to show search bar.
 */ 
function showGitHubSearch(){
    //remove old results everytime           
    const menu = document.querySelector('#canvas_menu')

    githubList.querySelectorAll('*').forEach(n => n.remove())

    const containerX = parseInt(cmenu._container.style.left, 10)
    const containerY = parseInt(cmenu._container.style.top, 10)
    menu.style.display = 'block'
    menu.style.top = `${containerY}px`
    menu.style.left = `${containerX}px`
    menu.classList.remove('off')

    const menuInput = document.getElementById('menuInput')
    menuInput.setAttribute('style','display:block')
    
}

/**
* Runs when enter key is clicked and the input is focused to show results from search.
*/ 
function searchMenu() {

    //We are searching on github
    let input = document.getElementById('menuInput').value
   
    githubList.querySelectorAll('*').forEach(n => n.remove())

    GlobalVariables.gitHub.searchGithub(input,true).then(result => {     
        result.data.items.forEach(item => {
            
            addToList(item,true)
        })
    })
    GlobalVariables.gitHub.searchGithub(input,false).then(result => {
        result.data.items.forEach(item => { 

            addToList(item,false)  
        })
    })
}
/**
     * Runs when a search value is entered (after return)
     * @param {object} item - What is being added to the list.
     * @param {object} owned - Does the project belong to the currentUser.
     */ 
function addToList(item,owned){
    var newElement = document.createElement('LI')
    var text = document.createTextNode(item.name)
    if (owned){
        newElement.classList.add('menu-item-mine')
    }
    newElement.classList.add('menu-item')
    newElement.setAttribute('id', item.id)
    newElement.appendChild(text) 
    githubList.appendChild(newElement) 
    githubList.setAttribute('style','display:block;')

 
    document.getElementById(item.id).addEventListener('click', (e) => {
        placeGitHubMolecule(e)
    })
}

/**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by click event on a menu item.
     */ 
function placeNewNode(e){
    let clr = e.target.id
    const containerX = parseInt(cmenu._container.style.left, 10)
    const containerY = parseInt(cmenu._container.style.top, 10)
    GlobalVariables.currentMolecule.placeAtom({
        x: GlobalVariables.pixelsToWidth(containerX), 
        y: GlobalVariables.pixelsToHeight(containerY), 
        parent: GlobalVariables.currentMolecule,
        atomType: clr,
        uniqueID: GlobalVariables.generateUniqueID()
            
    }, true)
    
    //Simulate a click on the new atom
    var clickHandledByAtom = false
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
        if (atom.clickDown(containerX,containerY,clickHandledByAtom) == true){
            clickHandledByAtom = true
            atom.clickUp(containerX, containerY) //Click up to not drag the atom
        }
    })
}

/**
     * Runs when a menu option is clicked to place a new atom from searching on GitHub.
     * @param {object} ev - The event triggered by clicking on a menu item.
     */ 
function placeGitHubMolecule(ev){

    const menu = document.querySelector('#canvas_menu')
    menu.classList.add('off')
    menu.style.top = '-200%'
    menu.style.left = '-200%'  

    let clr = ev.target.id
    const containerXinPixels = parseInt(cmenu._container.style.left, 10)
    const containerYinPixels = parseInt(cmenu._container.style.top, 10)
    const containerX = GlobalVariables.pixelsToWidth(containerXinPixels)
    const containerY = GlobalVariables.pixelsToHeight(containerYinPixels)
    GlobalVariables.currentMolecule.placeAtom({
        x: containerX, 
        y: containerY, 
        parent: GlobalVariables.currentMolecule,
        atomType: 'GitHubMolecule',
        projectID: clr,
        uniqueID: GlobalVariables.generateUniqueID()
    }, true)
}

export {cmenu}
 