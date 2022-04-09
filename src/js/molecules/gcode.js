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
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Generates Maslow gcode from the input geometry."
        /**
         * The generated gcode string
         * @type {string}
         */
        this.gcodeString = ""
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('input', 'tool size', this, 'number', 6.35)
        this.addIO('input', 'passes', this, 'number', 6)
        this.addIO('input', 'speed', this, 'number', 500)
        this.addIO('input', 'tabs', this, 'string', "true")
        this.addIO('input', 'safe height', this, 'number', 6)
        
        this.addIO('output', 'gcode', this, 'geometry', '')
        
        this.setValues(values)
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
            var geometry = this.findIOValue('geometry')
            var toolSize = this.findIOValue('tool size')
            var passes = this.findIOValue('passes')
            var speed = this.findIOValue('speed')
            var tabs = this.findIOValue('tabs')
            var safeHeight = this.findIOValue('safe height')
            const values = {op: "gcode", readPath:geometry, toolSize:toolSize, passes:passes, speed:speed, tabs:tabs, safeHeight:safeHeight ,writePath: this.path }
            this.gcodeString = this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Create a button to download the .stl file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createButton(list, this, "Download G-Code", ()=>{this.downloadGCode()})
    }
    
    /**
     * The function which is called when you press the download button.
     */ 
    downloadGCode(){
        try{
            var geometry = this.findIOValue('geometry')
            var toolSize = this.findIOValue('tool size')
            var passes = this.findIOValue('passes')
            var speed = this.findIOValue('speed')
            var tabs = this.findIOValue('tabs')
            var safeHeight = this.findIOValue('safe height')
            const values = {op: "gcode", readPath:geometry, toolSize:toolSize, passes:passes, speed:speed, tabs:tabs, safeHeight:safeHeight ,writePath: this.path }
            const {answer} = window.ask(values)
            answer.then( returnedAnswer => {
                const blob = new Blob([returnedAnswer])
                saveAs(blob, GlobalVariables.currentMolecule.name+'.nc')
            })
        }catch(err){this.setAlert(err)}
        
    }
    
}