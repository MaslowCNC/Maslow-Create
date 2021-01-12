import { create, all }  from 'mathjs'
import Assembly         from './molecules/assembly.js'
import Box              from './molecules/box.js'
import CutList          from './molecules/cutlist.js'
import Circle           from './molecules/circle.js'
import Color            from './molecules/color.js'
import CutLayout        from './molecules/cutlayout.js'
import Rectangle        from './molecules/rectangle.js'
import ShrinkWrap       from './molecules/shrinkwrap.js'
import Translate        from './molecules/translate.js'
import Tag              from './molecules/tag.js'
import RegularPolygon   from './molecules/regularpolygon.js'
import Extrude          from './molecules/extrude.js'
import Stl              from './molecules/stl.js'
import Svg              from './molecules/svg.js'
import Nest              from './molecules/nest.js'
import Intersection     from './molecules/intersection.js'
import Difference       from './molecules/difference.js'
import Constant         from './molecules/constant.js'
import Equation         from './molecules/equation.js'
import ExtractTag       from './molecules/extracttag.js'
import Molecule         from './molecules/molecule.js'
import GeneticAlgorithm from './molecules/geneticAlgorithm.js'
import Input            from './molecules/input.js'
import Readme           from './molecules/readme.js'
import AddBOMTag        from './molecules/BOM.js'
import Rotate           from './molecules/rotate.js'
import GitHubMolecule   from './molecules/githubmolecule.js'
import Output           from './molecules/output.js'
import Gcode            from './molecules/gcode.js'
import Code             from './molecules/code.js'
import Union             from './molecules/union.js'
import GitHubModule     from './githubOauth'

/**
 * This class defines things which are made available to all objects which import it. It is a singlton which means that each time it is imported the same instance is made available so if it is written to in one place, it can be read somewhere else.
 */
class GlobalVariables{
    /**
     * The constructor creates a new instance of the Global Variables object.
     */
    constructor(){
        /** 
         * The canvas object on which the atoms are drawn.
         * @type {object}
         */
        this.canvas = null
        /** 
         * The 2D reference to the canvas object on which the atoms are drawn.
         * @type {object}
         */
        this.c = null
        /** 
        * An array of all of the available types of atoms which can be placed with a right click.
        * @type {array}
        */
        this.availableTypes = {
        
            box:                {creator: Box, atomType: 'Box'},
            
            intersection:       {creator: Intersection, atomType: 'Intersection', atomCategory: 'Interactions'},
            difference:         {creator: Difference, atomType: 'Difference', atomCategory: 'Interactions'},
            assembly:           {creator: Assembly, atomType: 'Assembly', atomCategory: 'Interactions'},
            union:              {creator: Union, atomType: 'Union', atomCategory: 'Interactions'},
            shrinkwrap:         {creator: ShrinkWrap, atomType: 'ShrinkWrap', atomCategory: 'Interactions'},
            
            
            readme:             {creator: Readme, atomType: 'Readme', atomCategory: 'Tags'},
            addBOMTag:          {creator: AddBOMTag, atomType: 'Add-BOM-Tag', atomCategory: 'Tags'},
            color:              {creator: Color, atomType: 'Color', atomCategory: 'Tags'},
            tag:                {creator: Tag, atomType: 'Tag', atomCategory: 'Tags'},
            extracttag:         {creator: ExtractTag, atomType: 'ExtractTag', atomCategory: 'Tags'},
            cutLayout:          {creator: CutLayout, atomType: 'CutLayout', atomCategory: 'Tags'},
            CutList:            {creator: CutList, atomType: 'CutList', atomCategory: 'Tags'},


            
            regularPolygon:     {creator: RegularPolygon, atomType: 'RegularPolygon', atomCategory: 'Shapes'},
            costant:            {creator: Constant, atomType: 'Constant', atomCategory: 'Inputs'},
            circle:             {creator: Circle, atomType: 'Circle', atomCategory: 'Shapes'},
            rectangle:          {creator: Rectangle, atomType: 'Rectangle', atomCategory: 'Shapes'},
            molecule:           {creator: Molecule, atomType: 'Molecule', atomCategory: 'Shapes'},
            input:              {creator: Input, atomType: 'Input', atomCategory: 'Inputs'},
            equation:           {creator: Equation, atomType: 'Equation', atomCategory: 'Inputs'},
            code:               {creator: Code, atomType: 'Code', atomCategory: 'Inputs'},
            
            rotate:             {creator: Rotate, atomType: 'Rotate', atomCategory: 'Actions'},
            extrude:            {creator: Extrude, atomType: 'Extrude', atomCategory: 'Actions'},
            translate:          {creator: Translate, atomType: 'Translate', atomCategory: 'Actions'},
            GeneticAlgorithm:   {creator: GeneticAlgorithm, atomType: 'GeneticAlgorithm', atomCategory: 'Actions'},

            stl:                {creator: Stl, atomType: 'Stl', atomCategory: 'Export'},
            svg:                {creator: Svg, atomType: 'Svg', atomCategory: 'Export'},
            nest:                {creator: Nest, atomType: 'Nest', atomCategory: 'Export'},
            gcode:              {creator: Gcode, atomType: 'Gcode', atomCategory: 'Export'},
            githubmolecule:     {creator: GitHubMolecule, atomType: 'GitHubMolecule', atomCategory: 'Inputs'},

            output:             {creator: Output, atomType: 'Output'}
        }
        /** 
         * A reference to the molecule curently being displayed on the screen.
         * @type {object}
         */
        this.currentMolecule
        /** 
         * A reference to the top level molecule of the project.
         * @type {object}
         */
        this.topLevelMolecule
        /** 
         * A flag to indicate if the program is running in run mode (ie a shared link).
         * @type {boolean}
         */
        this.runMode = false
        /** 
         * The github object which is used to interact with GitHub.
         * @type {object}
         */
        this.gitHub = new GitHubModule()
        /** 
         * A total of the number of atoms in this project
         * @type {integer}
         */
        this.totalAtomCount = 0
        /** 
         * A counter used during the loading process to keep track of how many atoms are still to be loaded.
         * @type {integer}
         */
        this.numberOfAtomsToLoad = 0
        /** 
         * A flag to indicate if the project is a fork.
         * @type {boolean}
         */
        this.fork = false
        /** 
         * A flag to indicate if command is pressed
         * @type {boolean}
         */
        this.ctrlDown = false
        /** 
         * A variable to save array to be copied
         * @type {array}
         */
        this.atomsSelected = []
        /** 
         * The size (in mm) of segments to use for circles.
         * @type {number}
         */
        this.circleSegmentSize = 2
        
        const math = create(all)  //What does this do? I think it is used to evalue strings as math
        /** 
         * An evaluator for strings as mathmatical equations which is sandboxed and secure.
         * @type {function}
         */
        this.limitedEvaluate = math.evaluate
        math.import({
            'import':     function () { throw new Error('Function import is disabled') },
            'createUnit': function () { throw new Error('Function createUnit is disabled') },
            'evaluate':   function () { throw new Error('Function evaluate is disabled') },
            'parse':      function () { throw new Error('Function parse is disabled') },
            'simplify':   function () { throw new Error('Function simplify is disabled') },
            'derivative': function () { throw new Error('Function derivative is disabled') }
        }, { override: true })
    }

    /** 
    * A function to generate a pixel value for 0-1 location on screen depending on screen width
    * @param {number} width 0-1 
    */
    widthToPixels(width){
        width = Math.min(width, 1) //Constrain the position to be a max of 1
        let pixels = this.canvas.width * width
        return pixels
    }
    /** 
    * A function to generate a 0-1 value from pixels for location on screen depending on screen width
    * @param {number} width 0-1 
    */
    pixelsToWidth(pixels){
        let width = 1 /(this.canvas.width / pixels)
        return width
    }
    /** 
    * A function to generate a pixel value for 0-1 location on screen depending on screen height
    * @param {number} width 0-1 
    */
    heightToPixels(height){
        height = Math.min(height, 1) //Constrain the position of the max value to be 1
        let pixels = this.canvas.height * height
        return pixels
    }
    /** 
    * A function which reads from a path and displays the geometry it contains
    * @param {string} The path to read from
    */
    writeToDisplay(path){
        console.trace()
        var thingReturned = window.ask({ evaluate: "md`hello`", key: "display", readPath: path }).then( thingReturned => {
            if(thingReturned && thingReturned != -1){
                window.updateDisplay(thingReturned);
            }
        })
    }
    /** 
    * A function to generate a 0-1 value from pixels for location on screen depending on screen height
    * @param {number} width 0-1 
    */
    pixelsToHeight(pixels){
        let height = 1 /(this.canvas.height / pixels)
        return height
    }
    
    /** 
     * A function to generate a unique ID value. Currently uses random which does not gurintee that it will be unique.
     */
    generateUniqueID(){
        return Math.floor(Math.random()*900000) + 100000
    }
    
    /**
     * Computes the distance between two points on a plane. This is a duplicate of the one in utils which should probably be deleted.
     * @param {number} x1 - The x cordinate of the first point.
     * @param {number} x2 - The x cordinate of the second point.
     * @param {number} y1 - The y cordinate of the first point.
     * @param {number} y2 - The y cordinate of the second point.
     */ 
    distBetweenPoints(x1, x2, y1, y2){
        var a2 = Math.pow(x1 - x2, 2)
        var b2 = Math.pow(y1 - y2, 2)
        var dist = Math.sqrt(a2 + b2)
        
        return dist
    }


}

/**
 * Because we want global variables to be the same every time it is imported we export an instance of global variables instead of the constructor.
 */
export default (new GlobalVariables)