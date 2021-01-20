import { askService, askServices, touch, setupFilesystem } from './jsxcad-sys.js';
import { buildMeshes, orbitDisplay } from './jsxcad-ui-threejs.js';


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
        
const serviceSpec = {
  webWorker: './maslowWorker.js',
  agent,
  workerType: 'module',
};

window.ask = async (question, context) =>
    askService(serviceSpec, question, context);


//Add 3d view //With axis does not work right now. Needs to be changed in jsxcad-ui-threejs
orbitDisplay({view: {fit: false}, withAxes: true, withGrid: true, gridLayer: 0}, document.getElementById('viewerContext')).then(result=>{
    window.updateDisplay = result.updateGeometry
});

setupFilesystem({ fileBase: 'maslow' });

//Test some things
window.ask({key: "rectangle", x:5, y:5, writePath: "atomGeometry/test" }) //This just establishes the worker


// .then( status => {
    // window.ask({ evaluate: "md`hello`", key: "extrude", distance:5, readPath: "atomGeometry/test", writePath: "atomGeometry/test2" }).then( status => {
        // var thingReturned = window.ask({ evaluate: "md`hello`", key: "display", readPath: "atomGeometry/test2" }).then( thingReturned => {
            // window.updateDisplay(thingReturned);
        // })
    // })
// })
