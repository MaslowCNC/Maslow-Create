import Assembly from './molecules/assembly.js'
import Circle from './molecules/circle.js'
import Rectangle from './molecules/rectangle.js'
import ShrinkWrap from './molecules/shrinkwrap.js'
import Translate from './molecules/translate.js'
import Tag from './molecules/tag.js'
import RegularPolygon from './molecules/regularpolygon.js'
import Extrude from './molecules/extrude.js'
import Scale from './molecules/scale.js'
import Union from './molecules/union.js'
import Intersection from './molecules/intersection.js'
import Difference from './molecules/difference.js'
import Constant from './molecules/constant.js'
import Equation from './molecules/equation.js'
import Molecule from './molecules/molecule.js'
import Input from './molecules/input.js'
import Readme from './molecules/readme.js'
import AddBOMTag from './molecules/BOM.js'
import Rotate from './molecules/rotate.js'
import GitHubMolecule from './molecules/githubmolecule.js'
import Output from './molecules/output.js'
import Stretch from './molecules/stretch.js'
import Gcode from './molecules/gcode.js'
import Code from './molecules/code.js'

import GitHubModule from './githubOauth'

import { createService } from './lib/service.js'

class GlobalVariables{
    constructor(){
        this.canvas = null
        this.c = null
        this.scale1 = 1 
        this.availableTypes = {
            assembly:           {creator: Assembly, atomType: 'Assembly'},
            circle:             {creator: Circle, atomType: 'Circle'},
            rectangle:          {creator: Rectangle, atomType: 'Rectangle'},
            shirinkwrap:        {creator: ShrinkWrap, atomType: 'ShrinkWrap'},
            translate:          {creator: Translate, atomType: 'Translate'},
            tag:                {creator: Tag, atomType: 'Tag'},
            regularPolygon:     {creator: RegularPolygon, atomType: 'RegularPolygon'},
            extrude:            {creator: Extrude, atomType: 'Extrude'},
            scale:              {creator: Scale, atomType: 'Scale'},
            intersection:       {creator: Intersection, atomType: 'Intersection'},
            difference:         {creator: Difference, atomType: 'Difference'},
            costant:            {creator: Constant, atomType: 'Constant'},
            equation:           {creator: Equation, atomType: 'Equation'},
            molecule:           {creator: Molecule, atomType: 'Molecule'},
            input:              {creator: Input, atomType: 'Input'},
            readme:             {creator: Readme, atomType: 'Readme'},
            addBOMTag:          {creator: AddBOMTag, atomType: 'Add BOM Tag'},
            rotate:             {creator: Rotate, atomType: 'Rotate'},
            githubmolecule:     {creator: GitHubMolecule, atomType: 'GitHubMolecule'},
            union:              {creator: Union, atomType: 'Union'},
            stretch:            {creator: Stretch, atomType: 'Stretch'},
            gcode:              {creator: Gcode, atomType: 'Gcode'},
            code:               {creator: Code, atomType: 'Code'}
        }
        this.secretTypes = {
            output:        {creator: Output, atomType: 'Output'}
        }
        this.currentMolecule
        this.topLevelMolecule
        this.runMode = false
        this.gitHub = new GitHubModule()
        
        const agent = async ({ question }) => `Secret ${question}`
        createService({ webWorker: './webworker.js', agent }).then(result => {
            this.ask = result.ask
        })
    }
    
    generateUniqueID(){
        return Math.floor(Math.random()*900000) + 100000
    }

    distBetweenPoints(x1, x2, y1, y2){
        var a2 = Math.pow(x1 - x2, 2)
        var b2 = Math.pow(y1 - y2, 2)
        var dist = Math.sqrt(a2 + b2)
        
        return dist
    }
}

export default (new GlobalVariables)