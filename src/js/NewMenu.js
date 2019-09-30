import CMenu from './lib/circularmenu.js'
import GlobalVariables from './globalvariables'
    
var ele = document.querySelector('#circle-menu1')

var cmenu = CMenu(ele)
    .config({
        totalAngle: 360,//deg,
        spaceDeg: 1,//deg
        background: "#323232E8",
        backgroundHover: "black",
        percent: 0.35,//%
        diameter: 130,//px
        position: 'top',
        horizontal: false,
        //start: -45,//deg
        animation: "into",
        menus: [
            {
                title: 'ACTIONS',
                icon: '',
                menus: makeArray('Actions')        
            },
            {
                title: 'SHAPES',
                icon: '',
                menus: makeArray('Shapes')
            },
            {
                title: 'PROPERTY',
                icon: '',
                menus: makeArray('Properties')
            },
            {
                title: 'INTERACTION',
                icon: '',
                menus: makeArray('Interactions')
            },
            {
                title: 'EX/IM',
                icon: '',
                menus: makeArray('Import/Export')
                                
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
            subMenu.title = instance.atomType.toUpperCase() 
            subMenu.name = instance.atomType
            subMenu.click = function menuClick(e, title){ 
                if (title.title === 'GITHUBMOLECULE'){
                    showGitHubSearch(e)
                }
                else{
                console.log(title.name)
                e.target.id = title.name
                placeNewNode(e)
                }
            }  
            menuArray.push(subMenu)
        }
    }
    return menuArray
}

/* Right click to open circular menu */
document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
    e.preventDefault()
    cmenu.show([e.clientX, e.clientY])
}) 

function showGitHubSearch(ev){

     //remove old results everytime
    var oldResults = githubList.getElementsByClassName('menu-item')
    for (let i = 0; i < oldResults.length; i++) {
            githubList.removeChild(oldResults[i])
            githubList.setAttribute('style','display:none;')
    }
    
    const menu = document.querySelector('#canvas_menu')
    console.log(cmenu._container.style)
    const containerX = parseInt(cmenu._container.style.left, 10)
    const containerY = parseInt(cmenu._container.style.top, 10)
    const containerWidth = parseInt(cmenu._container.style.width, 10)
    menu.style.display = 'block'
    menu.style.top = `${containerY}px`
    menu.style.left = `${containerX}px`
    menu.classList.remove('off')

    const menuInput = document.getElementById('menuInput')
    menuInput.setAttribute('style','display:block')

    
    //Add function call to search when typing
    document.getElementById('menuInput').addEventListener('keyup', (e) => {
        searchMenu(e)
        })
}

function searchMenu(evt) {
    //We are searching on github
    if(evt.code == 'Enter'){
        let input = document.getElementById('menuInput').value
        
        var githubList = document.getElementById('githubList')
        
        var oldResults = githubList.getElementsByClassName('menu-item')
        for (let i = 0; i < oldResults.length; i++) {
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
                githubList.setAttribute('style','display:block;')
                
                document.getElementById(item.id).addEventListener('click', (e) => {
                    placeGitHubMolecule(e)
                })
            })
        })
    }
}
/**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by click event on a menu item.
     */ 
function placeNewNode(e){
    let clr = e.target.id
    const containerX = parseInt(cmenu._container.style.left, 10)
    const containerY = parseInt(cmenu._container.style.top, 10)
    const invertScale = 1 / GlobalVariables.scale1
    GlobalVariables.currentMolecule.placeAtom({
        x: containerX * invertScale, 
        y: containerY * invertScale, 
        parent: GlobalVariables.currentMolecule,
        atomType: clr,
        uniqueID: GlobalVariables.generateUniqueID()
            
    }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one, true indicates the atom should spawn unlocked
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
        const containerX = parseInt(cmenu._container.style.left, 10)
        const containerY = parseInt(cmenu._container.style.top, 10)
        const invertScale = 1 / GlobalVariables.scale1
        GlobalVariables.currentMolecule.placeAtom({
            x: containerX * invertScale, 
            y: containerY * invertScale, 
            parent: GlobalVariables.currentMolecule,
            atomType: 'GitHubMolecule',
            projectID: clr,
            uniqueID: GlobalVariables.generateUniqueID()
        }, null, GlobalVariables.availableTypes) //null indicates that there is nothing to load from the molecule list for this one
    
    }

export {cmenu}
 