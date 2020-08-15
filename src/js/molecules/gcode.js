import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the circle atom.
 */
export default class Gcode extends Atom {
    
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
        this.name = 'Gcode'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Gcode'
        /**
         * This atom's height as drawn on the screen
         */
        this.height = 16
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('input', 'tool size', this, 'number', 6.35)
        this.addIO('input', 'passes', this, 'number', 6)
        this.addIO('input', 'speed', this, 'number', 500)
        this.addIO('input', 'tabs', this, 'string', "true")
        this.addIO('input', 'safe height', this, 'number', 6)
        
        this.addIO('output', 'gcode', this, 'geometry', '')
        
        this.setValues(values)
        
        this.updateValue()
    }
    
    /**
     * Draw the circle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${GlobalVariables.widthToPixels(this.radius)}px Work Sans Bold`
        GlobalVariables.c.fillText('G', GlobalVariables.widthToPixels(this.x- this.radius/3), GlobalVariables.heightToPixels(this.y)+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()

    }

    /**
     * Generate a layered outline of the part where the tool will cut
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('tool size'), this.findIOValue('passes'), this.findIOValue('speed'), this.findIOValue('tabs'), this.findIOValue('safe height')]
            this.basicThreadValueProcessing(values, "stackedOutline")
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Add a button to download the generated gcode
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,'Download Gcode',() => {const feedRate = this.findIOValue('speed')
            var gcodeString = "G20 \nG90 \n"
            
            this.value.paths[0].forEach(point => {
                gcodeString += "G1 X" + point[0] + " Y" + point[1] + " Z" + point[2] + " F" + feedRate + "\n"
            })
            
            const blob = new Blob([gcodeString], {type: 'text/plain;charset=utf-8'})
            saveAs(blob, GlobalVariables.topLevelMolecule.name+'.nc')
        })
    }
    
}