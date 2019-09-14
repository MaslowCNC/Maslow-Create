import GlobalVariables from './globalvariables'
/**
     * Initializes button to see all local molecules.
     */
    export default function localMoleculesMenu(){
        //Menu of local available molecules

        var availableMolecules = document.getElementById('localMolecules_top')
        var availableMoleculesDiv = document.getElementById('top_button_wrap')
        var availableMoleculesSelect = document.createElement('div')
        availableMoleculesDiv.appendChild(availableMoleculesSelect)

        availableMoleculesSelect.setAttribute('class','available_molecules')
        availableMolecules.setAttribute('title','or Right-Click on Canvas')

            
        for(var key in GlobalVariables.availableTypes) {
            var newElement = document.createElement('li')
            var instance = GlobalVariables.availableTypes[key]
            var text = document.createTextNode(instance.atomType)
            newElement.setAttribute('class', 'select-menu')
            newElement.setAttribute('id', instance.atomType)
            newElement.appendChild(text) 
            availableMoleculesSelect.appendChild(newElement) 
            availableMoleculesSelect.style.display = 'block'
           
            //Add function to call when atom is selected and place atom
            newElement.addEventListener('click', (e) => {

                console.log("meme")

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
                availableMoleculesSelect.style.display = 'none'
            })
        }
    }