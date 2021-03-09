import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the svg atom which lets you download a .svg file.
 */
export default class Svg extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Svg'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Svg'
        
        /**
         * This atom's value. Contains the value of the input geometry, not the stl
         * @type {string}
         */
        this.value = null

        /**
         * This atom's height as drawn on the screen
         */
        this.height = 0
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        
        //Add a download svg button to the top level atoms side bar in run mode
        GlobalVariables.topLevelMolecule.runModeSidebarAdditions.push(list => {
            this.createButton(list, this, "Download SVG", ()=>{this.downloadSvg()})
        })
        
        this.setValues(values)
    }

    /**
     * Draw the svg atom which has a SVG icon.
     */ 
    draw() {
        
        super.draw("rect")
        
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        this.height = pixelsRadius * 1.5

    
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.2}px Work Sans`
        GlobalVariables.c.fillText('Svg', GlobalVariables.widthToPixels(this.x- this.radius/1.4), GlobalVariables.heightToPixels(this.y)+this.height/6)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    
    /**
     * Set the value to be the input geometry, then call super updateValue()
     */ 
    updateValue(){
        // try{
            // const values = [this.findIOValue('geometry')]
            // this.basicThreadValueProcessing(values, "outline")
        // }catch(err){this.setAlert(err)}
    }
    
    /**
     * Create a button to download the .svg file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createButton(list, this, "Download SVG", ()=>{this.downloadSvg()})
    }
    
    /**
     * The function which is called when you press the download button.
     */ 
    downloadSvg(){
        try{
            const values = {key: "svg", readPath: this.findIOValue('geometry')}
            window.ask(values).then( answer => {
                
                //var enc = new TextDecoder("utf-8");
                
                const blob = new Blob([answer])
                saveAs(blob, GlobalVariables.currentMolecule.name+'.svg')
            })
        }catch(err){this.setAlert(err)}
    }
}