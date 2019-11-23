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
        * The HTML div object which contains the selection options
        * @type {object}
        */
        this.availableMoleculesSelect = document.createElement('div')
        /** 
        * The HTML object to which the div is attached
        * @type {object}
        */
        this.availableMoleculesDiv = document.getElementById('top_button_wrap')
        
        this.availableMoleculesDiv.appendChild(this.availableMoleculesSelect)
            
        this.availableMoleculesSelect.style.display = 'none'
        this.availableMoleculesSelect.setAttribute("class","available_molecules")
             
        //Adds all local molecules to selection options
                
        for(var key in GlobalVariables.availableTypes) {
            var newElement = document.createElement('li')
            var instance = GlobalVariables.availableTypes[key]
            var text = document.createTextNode(instance.atomType)
            newElement.setAttribute('id', instance.atomType)
            newElement.appendChild(text) 
            //Appends to div
            this.availableMoleculesSelect.appendChild(newElement) 
               
            //Add function to call when atom is selected and place atom
            newElement.addEventListener('click', (e) => {
                this.placeAtom(e)
            })
        }        
    }
    /**
     * Runs when menu button is clicked to display local menu element
     */ 
    showMenu(){
        this.availableMoleculesSelect.style.display = 'block'
    }
    /**
     * Toggles off menu if molecule is selected or if there's a background click
     */ 
    hideMenu(){
        this.availableMoleculesSelect.style.display = 'none'
    }

    /**
     * Runs when a menu option is clicked to place a new atom from the local atoms list.
     * @param {object} ev - The event triggered by click event on a menu item.
     */ 
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
                    
        //hides menu if atom is placed
        this.hideMenu()
    }
}

/**
 * Because we want the menu to be the same every time it is imported we export an instance of the menu instead of the constructor.
 */
export default (new Localmenu)
