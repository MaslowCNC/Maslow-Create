import { askService, askServices, createService, touch, setupFilesystem, listFiles } from './jsxcad-sys.js';
import { buildMeshes, orbitDisplay } from './jsxcad-ui-threejs.js';

import("./maslowWorker.js");
console.log("Imported web worker");

//Setup worker
const agent = async ({ ask, question }) => {
  if (question.ask) {
    const { identifier, options } = question.ask;
    return askSys(identifier, options);
  }else if (question.touchFile) {
    const { path, workspace } = question.touchFile;
    await touch(path, { workspace });
    // Invalidate the path in all workers.
    await askServices({ touchFile: { path, workspace } });
  }
};

var serviceSpec = {};

if(window.location.href.includes('run')){
    serviceSpec = {
      webWorker: '../maslowWorker.js',  //'../maslowWorker.js', fixes this for run mode
      agent,
      workerType: 'module',
    };
}
else{
    serviceSpec = {
      webWorker: './maslowWorker.js',  //'../maslowWorker.js', fixes this for run mode
      agent,
      workerType: 'module',
    };
}

window.ask = (question) => {
    
    const result = askService(serviceSpec, question);
    return result;
};


//Add 3d view //With axis does not work right now. Needs to be changed in jsxcad-ui-threejs
orbitDisplay({view: {fit: false}, withAxes: true, withGrid: true, gridLayer: 0}, document.getElementById('viewerContext')).then(result=>{
    window.updateDisplay = result.updateGeometry
});

setupFilesystem({ fileBase: 'maslow' });

//Test some things
window.ask({key: "rectangle", x:5, y:5, writePath: "atomGeometry/test" }); //This just establishes the worker

//If there is anything queued up to be called back when the ask worker is operational 
if(window.askSetupCallback){
    window.askSetupCallback();
}


//TODo: Add some garbage collection here which checks when a path was last written to or read from and deletes the old ones. Probably will require a wrapper for reading and writing to paths
// listFiles().then(result => {
    // console.log(result);
// })
