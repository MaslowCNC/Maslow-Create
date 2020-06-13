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
        this.height
        
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
        
        //Set colors
        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }
        else if(this.selected){
            GlobalVariables.c.fillStyle = this.selectedColor
            GlobalVariables.c.strokeStyle = this.defaultColor
            /**
             * This background color
             * @type {string}
             */
            this.color = this.selectedColor
            /**
             * This atoms accent color
             * @type {string}
             */
            this.strokeColor = this.defaultColor
        }
        else{
            GlobalVariables.c.fillStyle = this.defaultColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
        }
        
        this.inputs.forEach(input => {
            input.draw()       
        })
        if(this.output){
            this.output.draw()
        }
        
        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        this.height = pixelsRadius * 1.5

        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(pixelsX - pixelsRadius, pixelsY - this.height/2, 2*pixelsRadius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, pixelsX + pixelsRadius/2, pixelsY-pixelsRadius)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
    
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.2}px Work Sans Bold`
        GlobalVariables.c.fillText('SVG', GlobalVariables.widthToPixels(this.x- this.radius/1.3), GlobalVariables.heightToPixels(this.y)+this.height/6)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    
    /**
     * Set the value to be the input geometry, then call super updateValue()
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry')]
            this.basicThreadValueProcessing(values, "outline")
        }catch(err){this.setAlert(err)}
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
        const values = [this.findIOValue('geometry')]
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        computeValue(values, "svg").then(result => {
            if (result != -1 ){
                const blob = new Blob([result], {type: 'text/plain;charset=utf-8'})
                saveAs(blob, GlobalVariables.topLevelMolecule.name+'.svg')
            }else{
                this.setAlert("Unable to compute")
            }
        })
    }
}