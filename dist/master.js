/* global location */

import { installUi } from './jsxcad-ui-v1.js';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    const bootstrap = async () => {
      const booting = document.createElement('center');
      booting.innerText = `Booting sha`;
      document.getElementById('loading').appendChild(booting);
      const hash = location.hash.substring(1);
      const [project, source] = hash.split('@');
      await installUi({ document, project, source, sha: 'master' });
      document.body.removeChild(document.getElementById('loading'));
    };
    bootstrap();
  }
};
