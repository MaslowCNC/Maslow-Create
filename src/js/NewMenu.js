import CMenu from './lib/circularmenu.js'
import GlobalVariables from './globalvariables'

    
    var ele = document.querySelector('#circle-menu1');

    var cmenu = CMenu(ele)
            .config({
                        totalAngle: 360,//deg,
                        spaceDeg: 1,//deg
                        background: "#32323285",
                        backgroundHover: "#123321",
                        percent: 0.50,//%
                        diameter: 130,//px
                        position: 'top',
                        horizontal: true,
                        //start: -45,//deg
                        animation: "into",
                        menus: [
                            {
                                title: 'Actions',
                                icon: '',
                                href: '#5',
                                menus: [
                                    {
                                        title: 'menu1-1',
                                        icon: 'fa fa-circle'
                                    },
                                    {
                                        title: 'menu1-2',
                                        icon: 'fa fa-cc-visa'
                                    }
                                ]
                            },
                            {
                                title: 'Shapes',
                                icon: '',
                                //href: '#5',
                                menus: makeArray()
                            },
                            {
                                title: 'Properties',
                                icon: '',
                                //href: '#5',
                                menus: makeArray()
                            },
                            {
                                title: 'Interactions',
                                icon: '',
                                //href: '#5',
                                menus: makeArray()
                            },
                            {
                                title: 'GitHub',
                                icon: '',
                                //href: '#5',
                                
                            }
                        ]
                    });
            

            function makeArray() {
                var menuArray = []
                var subMenu = {}
                subMenu.title = "circle"
                menuArray.push(subMenu);
                
                return menuArray;
            }

            let configMenu = cmenu._creator._config.menus
            
            for (var i = 0; i < configMenu.length; i++) {
            
            var subMenu = {}
            subMenu.title = "circle"
            //configMenu[i].menus.push(subMenu)
            }
 
     //Add function to call when atom is selected
       
        for(var key in GlobalVariables.availableTypes) {         
             //change to filter later
            var instance = GlobalVariables.availableTypes[key]         
            //let configMenu = cmenu._creator._config.menus
            instance.title = instance.atomType
            /*instance.click: function (e, data) {
                                    console.log(123);} */
            delete instance.creator
            delete instance.atomType;
            //configMenu.push(instance);
         }
        
            /*/Add function to call when atom is selected
            document.getElementById(instance.atomType).addEventListener('click', (e) => {
                this.placeNewNode(e)
            })
             */
            
        
          document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
            e.preventDefault()
            cmenu.show([e.clientX, e.clientY])
        }) 
    /**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by clicking on a menu item.
     */ 
    function placeNewNode(ev){
        let clr = ev.target.id
        cmenu.hide()
        const invertScale = 1 / GlobalVariables.scale1
        GlobalVariables.currentMolecule.placeAtom({
            x: e.clientX * invertScale, 
            y: e.clientY * invertScale, 
            parent: GlobalVariables.currentMolecule,
            atomType: clr,
            uniqueID: GlobalVariables.generateUniqueID()
            
        }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one, true indicates the atom should spawn unlocked
    }
 