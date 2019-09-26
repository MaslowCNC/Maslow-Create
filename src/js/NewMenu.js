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
                title: 'Actions',
                icon: '',
                menus: makeArray('Actions')        
            },
            {
                title: 'Shapes',
                icon: '',
                menus: makeArray('Shapes')
            },
            {
                title: 'Properties',
                icon: '',
                menus: makeArray('Properties')
            },
            {
                title: 'Interactions',
                icon: '',
                menus: makeArray('Interactions')
            },
            {
                title: 'Import/Export',
                icon: '',
                menus: makeArray('Import/Export')
                                
            }
        ]
    })

function makeArray(group) {
                
    var menuArray = []
    for(var key in GlobalVariables.availableTypes){
        var instance = GlobalVariables.availableTypes[key] 
        if(instance.atomCategory === group){
            var subMenu = new Object()
            subMenu.title = instance.atomType     
            subMenu.click = function menuClick(e, title){ 
                e.target.id = title.title
                placeNewNode(e)

            }
            menuArray.push(subMenu)
        }
    }
    return menuArray
}

document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
    e.preventDefault()
    cmenu.show([e.clientX, e.clientY])
}) 
/**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by clicking on a menu item.
     */ 
function placeNewNode(e){
    let clr = e.target.id
    const invertScale = 1 / GlobalVariables.scale1
    GlobalVariables.currentMolecule.placeAtom({
        x: e.clientX * invertScale, 
        y: e.clientY * invertScale, 
        parent: GlobalVariables.currentMolecule,
        atomType: clr,
        uniqueID: GlobalVariables.generateUniqueID()
            
    }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one, true indicates the atom should spawn unlocked
}

export {cmenu}
 