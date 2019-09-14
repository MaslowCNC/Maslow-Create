import GlobalVariables from './globalvariables'


/**
 * This class creates the top menu behavior for looking at list of molecules and placing atoms.
 */
class Localmenu {
    /**
     * The constructor creates a new menu. The menu is only created once when the program launches and is hidden and displayed when the menu is needed.
     */
    constructor(){
            /** 
             * The HTML button object which activates the menu
             * @type {object}
             */
            this.availableMolecules = document.getElementById('localMolecules_top')
            /** 
             * The HTML div object which contains the menu
             * @type {object}
             */
            this.availableMoleculesSelect = document.createElement('div')
            this.availableMoleculesDiv = document.getElementById('top_button_wrap')
            
            this.availableMoleculesDiv.appendChild(this.availableMoleculesSelect)
            
            this.availableMoleculesSelect.style.display = 'none'
            this.availableMoleculesSelect.setAttribute("class","available_molecules")
            //this.availableMoleculesSelect.classList.add('off')
            //this.availableMoleculesSelect.setAttribute('title','or Right-Click on Canvas')
             
             /* An array which lists all of the options in the menu.
             * @type {array}
             */
            //this.menuList = document.getElementById('menuList')
                
            for(var key in GlobalVariables.availableTypes) {
                var newElement = document.createElement('li')
                var instance = GlobalVariables.availableTypes[key]
                var text = document.createTextNode(instance.atomType)
                //newElement.setAttribute('class', 'select-menu')
                newElement.setAttribute('id', instance.atomType)
                newElement.appendChild(text) 
                this.availableMoleculesSelect.appendChild(newElement) 
               
                //Add function to call when atom is selected and place atom
                newElement.addEventListener('click', (e) => {
                    this.placeAtom(e);
                })
            }
            
        }

        showMenu(){
            this.availableMoleculesSelect.style.display = 'block'
        }

        //toggles off menu if molecule is selected or if there's a background click
        hideMenu(){
            this.availableMoleculesSelect.style.display = 'none'
        }

        //place new atom when selected and hide menu
        placeAtom(e){

                let clr = e.target.id
                    const placement = GlobalVariables.scale1/1.1

                    GlobalVariables.currentMolecule.placeAtom({
                        x: GlobalVariables.canvas.width * placement, 
                        y: GlobalVariables.canvas.height * placement, 
                        parent: GlobalVariables.currentMolecule,
                        atomType: clr,
                        uniqueID: GlobalVariables.generateUniqueID()
                        
                    }, null, GlobalVariables.availableTypes, true) //null indicates that there is nothing to load from the molecule list for this one, true indicates the atom should spawn unlocked
                    
                    //hides menu if molecule is selected
                    this.hideMenu()
        }
    }

    /**
 * Because we want the menu to be the same every time it is imported we export an instance of the menu instead of the constructor.
 */
export default (new Localmenu)
