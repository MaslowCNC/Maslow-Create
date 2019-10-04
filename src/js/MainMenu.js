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
        percent: 0.35,//%
        diameter: 130,//px
        position: 'top',
        horizontal: false,
        start: -90,//deg
        animation: "into",
        menus: [
            {
                title: 'ACTIONS',
                icon: '',
                //menus: makeArray('Actions')        
            },
            {
                title: 'SHAPES',
                icon: '',
                //menus: makeArray('Shapes')
            },
            {
                title: 'PROPERTY',
                icon: '',
                //menus: makeArray('Properties')
            },
            {
                title: 'INTERACTION',
                icon: '',
                //menus: makeArray('Interactions')
            },
            {
                title: 'Import/Export',
                icon: '',
                //menus: makeArray('Import/Export')
                                
            }
        ]
    })

export {mainMenu}
