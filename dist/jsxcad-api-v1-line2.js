import { fromPoints, intersect } from './jsxcad-math-line2.js';

const ofPoints = (a, b) => fromPoints(a, b);
const meet = (a, b) => intersect(a, b);

const Line2 = (...args) => ofPoints(...args);

Line2.ofPoints = ofPoints;
Line2.meet = meet;

export default Line2;
export { Line2, meet, ofPoints };
