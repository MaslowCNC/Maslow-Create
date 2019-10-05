import CMenu from './lib/circularmenu.js'
import GlobalVariables from './globalvariables'

/**
 * Html element that cointains the circular menu
 */    
var ele = document.querySelector('#main_menu_wrap')
/**
 * This creates a new instance of the circular menu. 
 */
var mainMenu = CMenu(ele)
    .config({
        totalAngle: 90,//deg,
        spaceDeg: 1,//deg
        background: "#323232E8",
        backgroundHover: "black",
        percent: 0.2,//%
        diameter: 250,//px
        position: 'top',
        horizontal: true,
        start: -90,//deg
        animation: "into",
        menus: [
            {
                title: 'TO PARENT',
                icon: '',
                click: function menuClick(){
                    GlobalVariables.currentMolecule.goToParentMolecule() 
                }     
                //menus: makeArray('Interactions')
            },
            {
                title: 'SHARE',
                icon: '',
                click: function menuClick(){
                    GlobalVariables.gitHub.shareOpenedProject()
                }     
                //menus: makeArray('Interactions')
            },
            {
                title: 'READ ME',
                icon: '',
                click: function menuClick(){
                    GGlobalVariables.gitHub.openREADMEPage()
                }      
            },
            {
                title: 'SAVE',
                icon: '',
                click: function menuClick(){
                    GlobalVariables.gitHub.saveProject()
                }     
                //menus: makeArray('Shapes')
            },
            {
                title: 'B.O.M',
                icon: '',
                click: function menuClick(){
                    GlobalVariables.gitHub.openBillOfMaterialsPage()
                }     
                //menus: makeArray('Properties')
            },
            {
                title: 'OPEN',
                icon: '',
                click: function menuClick(){
                    GlobalVariables.gitHub.showProjectsToLoad()
                }     
                //menus: makeArray('Import/Export')                    
            }
        ]
    })

export {mainMenu}
