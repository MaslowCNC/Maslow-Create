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
        background: "#32323270",
        backgroundHover: "black",
        percent: 0.1,//%
        diameter: 200,//px
        position: 'top',
        horizontal: true,
        start: -90,//deg
        animation: "into",
        menus: [
            {
                title: '',
                icon: 'maslow-icon',
                //menus: makeArray('Actions')        
            },
            {
                title: '',
                icon: 'maslow-icon',
                //menus: makeArray('Shapes')
            },
            {
                title: '',
                icon: 'maslow-icon',
                //menus: makeArray('Properties')
            },
            {
                title: '',
                icon: 'maslow-icon',
                //menus: makeArray('Interactions')
            },
            {
                title: '',
                icon: 'maslow-icon',
                //menus: makeArray('Import/Export')
                                
            }
        ]
    })

export {mainMenu}
