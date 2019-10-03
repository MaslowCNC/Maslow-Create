import { create, all }  from 'mathjs'
import Assembly         from './molecules/assembly.js'
import CutAway          from './molecules/cutaway.js'
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
import Scale            from './molecules/scale.js'
import Stl              from './molecules/stl.js'
import Svg              from './molecules/svg.js'
import Union            from './molecules/union.js'
import Intersection     from './molecules/intersection.js'
import Difference       from './molecules/difference.js'
import Constant         from './molecules/constant.js'
import Equation         from './molecules/equation.js'
import ExtractTag       from './molecules/extracttag.js'
import Molecule         from './molecules/molecule.js'
import Input            from './molecules/input.js'
import Readme           from './molecules/readme.js'
import AddBOMTag        from './molecules/BOM.js'
import Rotate           from './molecules/rotate.js'
import GitHubMolecule   from './molecules/githubmolecule.js'
import Output           from './molecules/output.js'
import Stretch          from './molecules/stretch.js'
import Gcode            from './molecules/gcode.js'
import Code             from './molecules/code.js'
import GitHubModule     from './githubOauth'
import { createService } from './lib/service.js'

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
         * An array of all of the secret types of atoms which can not be placed by the user.
         * @type {array}
         */
        this.secretTypes = {
            output:        {creator: Output, atomType: 'Output'}
        }
        /** 
         * The current amount by which the canvas has been scaled.
         * @type {number}
         */
        this.scale1 = 1 
        /** 
         * An array of all of the available types of atoms which can be placed with a right click.
         * @type {array}
         */
        this.availableTypes = {

            assembly:           {creator: Assembly, atomType: 'Assembly', atomCategory: 'Interactions'},
            circle:             {creator: Circle, atomType: 'Circle', atomCategory: 'Shapes'},
            color:              {creator: Color, atomType: 'Color', atomCategory: 'Properties'},
            cutLayout:          {creator: CutLayout, atomType: "Cut Layout", atomCategory: 'Import/Export'},
            rectangle:          {creator: Rectangle, atomType: 'Rectangle', atomCategory: 'Shapes'},
            shirinkwrap:        {creator: ShrinkWrap, atomType: 'ShrinkWrap', atomCategory: 'Interactions'},
            translate:          {creator: Translate, atomType: 'Translate', atomCategory: 'Actions'},
            tag:                {creator: Tag, atomType: 'Tag', atomCategory: 'Properties'},
            regularPolygon:     {creator: RegularPolygon, atomType: 'RegularPolygon', atomCategory: 'Shapes'},
            extrude:            {creator: Extrude, atomType: 'Extrude', atomCategory: 'Actions'},
            extracttag:         {creator: ExtractTag, atomType: 'ExtractTag', atomCategory: 'Actions'},
            scale:              {creator: Scale, atomType: 'Scale', atomCategory: 'Properties'},
            stl:                {creator: Stl, atomType: 'Stl', atomCategory: 'Import/Export'},
            svg:                {creator: Svg, atomType: 'Svg', atomCategory: 'Import/Export'},
            intersection:       {creator: Intersection, atomType: 'Intersection', atomCategory: 'Interactions'},
            difference:         {creator: Difference, atomType: 'Difference', atomCategory: 'Interactions'},
            costant:            {creator: Constant, atomType: 'Constant', atomCategory: 'Properties'},
            equation:           {creator: Equation, atomType: 'Equation', atomCategory: 'Actions'},
            molecule:           {creator: Molecule, atomType: 'Molecule', atomCategory: 'Shapes'},
            input:              {creator: Input, atomType: 'Input', atomCategory: 'Properties'},
            readme:             {creator: Readme, atomType: 'Readme', atomCategory: 'Properties'},
            addBOMTag:          {creator: AddBOMTag, atomType: 'Add BOM Tag', atomCategory: 'Properties'},
            rotate:             {creator: Rotate, atomType: 'Rotate', atomCategory: 'Actions'},
            githubmolecule:     {creator: GitHubMolecule, atomType: 'GitHubMolecule', atomCategory: 'Import/Export'},
            union:              {creator: Union, atomType: 'Union', atomCategory: 'Interactions'},
            stretch:            {creator: Stretch, atomType: 'Stretch', atomCategory: 'Actions'},
            gcode:              {creator: Gcode, atomType: 'Gcode', atomCategory: 'Import/Export'},
            code:               {creator: Code, atomType: 'Code', atomCategory: 'Import/Export'},
            cutAway:            {creator: CutAway, atomType: 'CutAway', atomCategory: 'Import/Export'},
            CutList:            {creator: CutList, atomType: 'CutList', atomCategory: 'Import/Export'}
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
         * The size (in mm) of segments to use for circles.
         * @type {number}
         */
        this.circleSegmentSize = 2
        
        const agent = async ({ question }) => `Secret ${question}`
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * A worker thread which can do computation.
             * @type {object}
             */
            this.ask = result.ask
        })
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * The threejs renderer which displays things on the screen.
             * @type {object}
             */
            this.render = result.ask
        })
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * The worker which is used during the saving process.
             * @type {object}
             */
            this.saveWorker = result.ask
        })
        
        const math = create(all)
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