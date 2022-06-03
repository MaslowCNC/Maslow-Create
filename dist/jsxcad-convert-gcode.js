import { op, visit } from './jsxcad-geometry.js';

const X = 0;
const Y = 1;
const Z = 2;

// FIX: This is actually GRBL.
const toGcode = async (geometry) => {
  const codes = [];

  // CHECK: Perhaps this should be a more direct modeling of the GRBL state?
  const state = {
    // Where is the tool
    x: 0,
    y: 0,
    z: 0,
    // How 'fast' the tool is running (rpm or power).
    s: 0,
    f: 0,
  };

  const emit = (code) => codes.push(code);

  const value = (v) => {
    let s = v.toFixed(3);
    // This could be more efficient.
    while (s.includes('.') && (s.endsWith('0') || s.endsWith('.'))) {
      s = s.substring(0, s.length - 1);
    }
    return s;
  };

  const pX = (x = state.x) => {
    if (x !== state.x) {
      return ` X${value(x)}`;
    } else {
      return '';
    }
  };

  const pY = (y = state.y) => {
    if (y !== state.y) {
      return ` Y${value(y)}`;
    } else {
      return '';
    }
  };

  const pZ = (z = state.z) => {
    if (z !== state.z) {
      return ` Z${value(z)}`;
    } else {
      return '';
    }
  };

  const cM5 = () => {
    if (state.m !== 5) {
      emit('M5');
      state.m = 5;
    }
  };

  const cM3 = () => {
    if (state.m !== 3) {
      emit('M3');
      state.m = 3;
    }
  };

  // Rapid Linear Motion
  const cG0 = ({
    x = state.x,
    y = state.y,
    z = state.z,
    f = state.f,
    s = state.s,
  } = {}) => {
    const code = `G0${pX(x)}${pY(y)}${pZ(z)}`;
    if (code === 'G0') {
      return;
    }
    emit(code);
    state.x = x;
    state.y = y;
    state.z = z;
  };

  // Cut
  const cG1 = ({
    x = state.x,
    y = state.y,
    z = state.z,
    f = state.f,
    s = state.s,
  } = {}) => {
    const code = `G1${pX(x)}${pY(y)}${pZ(z)}`;
    if (code === 'G1') {
      return;
    }
    emit(code);
    state.x = x;
    state.y = y;
    state.z = z;
  };

  const cS = ({ s = state.s } = {}) => {
    if (s !== state.s) {
      emit(`S${value(s)}`);
      state.s = s;
    }
  };

  const cF = ({ f = state.f } = {}) => {
    if (f !== state.f) {
      emit(`F${value(f)}`);
      state.f = f;
    }
  };

  const useAbsoluteCoordinates = () => emit('G90');
  const useMetric = () => emit('G21');

  codes.push('');

  useMetric();
  useAbsoluteCoordinates();

  cM3();

  const processToolpath = ({ toolpath }) => {
    for (const entry of toolpath) {
      switch (entry.op) {
        case 'jump':
          cF({ f: entry.speed });
          cS({ s: entry.power });
          cG0({ x: entry.to[X], y: entry.to[Y], z: entry.to[Z] });
          break;
        case 'cut':
          cF({ f: entry.speed });
          cS({ s: entry.power });
          cG1({ x: entry.to[X], y: entry.to[Y], z: entry.to[Z] });
          break;
      }
    }
  };

  op({ toolpath: processToolpath }, visit)(geometry);

  cM5();
  codes.push('');
  return new TextEncoder('utf8').encode(codes.join('\n'));
};

export { toGcode };
