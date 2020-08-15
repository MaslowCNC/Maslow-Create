import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

import * as pathseg from '../SVGnest/util/pathsegpolyfill.js'
import * as matrix from '../SVGnest/util/matrix.js'
import * as domparser from '../SVGnest/util/domparser.js'
import * as ClipperLib from '../SVGnest/util/clipper.js'
import * as parallel from '../SVGnest/util/parallel.js'
import * as placementworker from '../SVGnest/util/placementworker.js'
import * as Svgparser from '../SVGnest/svgparser.js'
import * as Svgnest from '../SVGnest/svgnest.js'
import * as geometryutil from '../SVGnest/util/geometryutil.js'
/**
 * This class creates the svg atom which lets you download a .svg file.
 */
export default class Nest extends Atom {
    
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
        this.name = 'Nest'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Nest'
        
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
        this.addIO('input', 'spacing', this, 'number', 0.3)
        this.addIO('input', 'curveTolerance', this, 'number', 0.3)
        
        /*
        //Add a download svg button to the top level atoms side bar in run mode
        GlobalVariables.topLevelMolecule.runModeSidebarAdditions.push(list => {
            this.createButton(list, this, "Download Nested SVG", ()=>{this.downloadSvg()})
        })*/  
        
        this.setValues(values)

        this.prevpercent = 0
        this.startTime = null

        this.iterations = 0
        this.isworking = false
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
        GlobalVariables.c.font = `${pixelsRadius/1.2}px Work Sans Bold`
        GlobalVariables.c.fillText('SVG', GlobalVariables.widthToPixels(this.x- this.radius/1.3), GlobalVariables.heightToPixels(this.y)+this.height/6)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    setValue(){
        this.setConfig()
    }
    /**
     * Set the value to be the input geometry, then call super updateValue()
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry')]
            this.basicThreadValueProcessing(values, "outline")
        }catch(err){this.setAlert(err)}
        //Saves new config values for nesting
        this.setConfig()

    } 

    /**
     * Update values for config text. Called when the readme text has been edited.
     */ 
    setConfig() {
                // config = [distance, curve tolerance,rotations, population size, mutation rate, use holes, concave]
                const configKeys = ["spacing","curveTolerance"]
                var c = {"useholes":false,"exploreConcave":false,"rotations":4,"mutationRate":10,"populationSize":10}; 
                for(var i=0; i<configKeys.length; i++){
                    var key = configKeys[i]
                        c[key] = this.findIOValue(key)
                    }
                var check1 = document.getElementById("Part in Part")
                if(check1 !== null){
                    if (check1.checked){
                        c[check1] = true
                        console.log(c[check1])
                    }
                    else{
                        c[check1] = false
                         console.log(c[check1])
                    }
                }
                
                
                window.SvgNest.config(c);
                
                // new configs will invalidate current nest
                if(this.isworking){
                  this.stopnest();
                }
                //configvisible = false;
                //config.className = '';
                return false;
            
    }
    
    /**
     * Create a button to download the .svg file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()

        this.createCheckbox(list,"Part in Part", false, ()=>{this.setConfig()})
        this.createButton(list, this, "Start Nest", ()=>{this.svgToNest()})
        //remember to disable until svg is nested 
        this.createButton(list, this, "Download SVG", ()=>{this.downloadSvg()})
        console.log(list)
    }
    
    svgToNest(){

        //turn into svg
        const values = [this.findIOValue('geometry')]
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        var unestedSVG

        computeValue(values, "svg").then(result => {
            if (result != -1 ){
                const blob = new Blob([result], {type: 'text/plain;charset=utf-8'})
                //saveAs(blob, GlobalVariables.topLevelMolecule.name+'.svg')
                var decoder = new TextDecoder('utf8')
                unestedSVG = decoder.decode(result)
                
                return unestedSVG
            }else{
                this.setAlert("Unable to compute")
            }
        }).then(result =>{ 
            try{
                var svg = SvgNest.parsesvg(result)
                var display = document.getElementById('select')
                {
                    var wholeSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                    // Copy relevant scaling info
                    wholeSVG.setAttribute('width',svg.getAttribute('width'))
                    wholeSVG.setAttribute('height',svg.getAttribute('height'))
                    wholeSVG.setAttribute('viewBox',svg.getAttribute('viewBox'))
                    var rect = document.createElementNS(wholeSVG.namespaceURI,'rect')
                    rect.setAttribute('x', wholeSVG.viewBox.baseVal.x)
                    rect.setAttribute('y', wholeSVG.viewBox.baseVal.x)
                    rect.setAttribute('width', wholeSVG.viewBox.baseVal.width)
                    rect.setAttribute('height', wholeSVG.viewBox.baseVal.height)
                    rect.setAttribute('class', 'fullRect')
                    wholeSVG.appendChild(rect)
                }
                display.innerHTML = ''
                display.appendChild(wholeSVG) // As a default bin in background
                display.appendChild(svg)
            }
            catch(e){
                console.log(e)
                //message.innerHTML = e;
                //message.className = 'error animated bounce';
                return
            }                   
                        
            //hideSplash();
            //message.className = 'active animated bounce';
            //start.className = 'button start disabled';
                        
            //attachSvgListeners(svg);

            //set the bin to wholeSVG
            this.attachSvgListeners(wholeSVG)
                        
                     
        })
    }

    attachSvgListeners(svg){
        // auto set bin to be whole svg
        for(var i=0; i<svg.childNodes.length; i++){
            var node = svg.childNodes[i]
                    
            if(node.nodeType == 1){
                node.setAttribute("class", "active")
                        
                //if(display.className == 'disabled'){
                //    return;
                //}
                            
                var currentbin = document.querySelector('#select .active')
                if(currentbin){
                    var className = currentbin.getAttribute('class').replace('active', '').trim()
                    if(!className)
                        currentbin.removeAttribute('class')
                    else
                        currentbin.setAttribute('class', className)
                }
                SvgNest.setbin(node) 
                node.setAttribute('class',(node.getAttribute('class') ? node.getAttribute('class')+' ' : '') + 'active')
                            
                //start.className = 'button start animated bounce';
                //message.className = '';
                this.startnest()
                        
            }
        }
    }

    async startnest(){
        // Once started, don't allow this anymore
        //document.removeEventListener('dragover', FileDragHover, false);
        //document.removeEventListener('dragleave', FileDragHover, false);
        //document.removeEventListener('drop', FileDrop, false);
                
        SvgNest.start(this.progress,this.renderSvg)
        //remember to change label so nest can stop
        //startlabel.innerHTML = 'Stop Nest';
        //start.className = 'button spinner';
        //configbutton.className = 'button config disabled';
        //config.className = '';
        //zoomin.className = 'button zoomin disabled';
        //zoomout.className = 'button zoomout disabled';

        var svg = document.querySelector('#select svg')
        if(svg){
            svg.removeAttribute('style')
        }
        this.isworking = true
    }
            
    stopnest(){
        SvgNest.stop()
        startlabel.innerHTML = 'Start Nest'
        start.className = 'button start'
        configbutton.className = 'button config'
                
        this.isworking = false
    }

            
            
    progress(percent){
        var transition = percent > this.prevpercent ? '; transition: width 0.1s' : ''
        document.getElementById('info_progress').setAttribute('style','width: '+Math.round(percent*100)+'% ' + transition)
        document.getElementById('info').setAttribute('style','display: block')
                
        this.prevpercent = percent
                
        var now = new Date().getTime()
        if(startTime && now){
            var diff = now-startTime
            // show a time estimate for long-running placements
            var estimate = (diff/percent)*(1-percent)
            document.getElementById('info_time').innerHTML = millisecondsToStr(estimate)+' remaining'
                    
            if(diff > 5000 && percent < 0.3 && percent > 0.02 && estimate > 10000){
                document.getElementById('info_time').setAttribute('style','display: block')
            }
        }
                
        if(percent > 0.95 || percent < 0.02){
            document.getElementById('info_time').setAttribute('style','display: none')
        }
        if(percent < 0.02){
            startTime = new Date().getTime()
        }
    }
            
    renderSvg(svglist, efficiency, placed, total){
                
        //this.iterations++;
                
        //document.getElementById('info_iterations').innerHTML = iterations;
                
        if(!svglist || svglist.length == 0){
            return
        }
        var bins = document.getElementById('bins')
        bins.innerHTML = ''
                
        for(var i=0; i<svglist.length; i++){
            if(svglist.length > 2){
                svglist[i].setAttribute('class','grid')
            }
            bins.appendChild(svglist[i])
        }
                
        if(efficiency || efficiency === 0){
            // document.getElementById('info_efficiency').innerHTML = Math.round(efficiency*100);
        }

        //document.getElementById('info_placed').innerHTML = placed+'/'+total;
                
        //document.getElementById('info_placement').setAttribute('style','display: block');
        //display.setAttribute('style','display: none');
        //download.className = 'button download animated bounce';
                
    }
            
    /**
     * The function which is called when you press the download button.
     */ 
    downloadSvg(){
        var bins = document.getElementById('bins')
        console.log(bins)
                
        if(bins.children.length == 0){
            message.innerHTML = 'No SVG to export'
            message.className = 'error animated bounce'
            return
        }
                
        var svg

        var display = document.getElementById('select')
        svg = display.querySelector('svg')
                
        if(!svg){
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        }
                
        svg = svg.cloneNode(false)
                
        // maintain stroke, fill etc of input
        if(SvgNest.style){
            svg.appendChild(SvgNest.style)
        }
                
        var binHeight = parseInt(bins.children[0].getAttribute('height'))
                
        for(var i=0; i<bins.children.length; i++){
            var b = bins.children[i]
            console.log(b)
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            group.setAttribute('fill', 'none')
            group.setAttribute('stroke-width', '.1')
            group.setAttribute('fill', 'none')
            group.setAttribute('transform', 'translate(0 '+binHeight*1.1*i+')')
            for(var j=0; j<b.children.length; j++){
                group.appendChild(b.children[j].cloneNode(true))
            }
            svg.appendChild(group)
        }
                
        var output
        if(typeof XMLSerializer != 'undefined'){
            output = (new XMLSerializer()).serializeToString(svg)
        }
        else{
            output = svg.outerHTML
        }
        console.log(output)
        var blob = new Blob([output], {type: "image/svg+xml;charset=utf-8"})
        saveAs(blob, "SVGnest-output.svg")
    }
}