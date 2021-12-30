import { askService } from './jsxcad-sys.js';

import { orbitDisplay } from './jsxcad-ui-threejs.js';

window.bootstrap = async () => {
  const agent = async ({ ask, message }) => {
    const { id, op, path, workspace } = message;
    switch (op) {
      case 'log':
        return;
      default:
        throw Error(`master/unhandled: ${JSON.stringify(message)}`);
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
    question.workspace = 'maslow';
    const result = askService(serviceSpec, question);
    return result;
  };
  
  //Launch run mode if it is queued
  if(window.askSetupCallback){
      window.askSetupCallback();
  }
  
};

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    window.bootstrap();
  }
};


//Add 3d view
orbitDisplay({view: {fit: false}, withAxes: true, withGrid: true, gridLayer: 0}, document.getElementById('viewerContext')).then(result=>{
    window.updateDisplay = result.updateGeometry
});


//TODo: Add some garbage collection here which checks when a path was last written to or read from and deletes the old ones. Probably will require a wrapper for reading and writing to paths
// listFiles().then(result => {
    // console.log(result);
// })
