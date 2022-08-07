class ErrorWouldBlock extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorWouldBlock';
  }
}

const pending$2 = [];

let pendingErrorHandler = (error) => console.log(error);

const addPending = (promise) => pending$2.push(promise);

const resolvePending = async () => {
  while (pending$2.length > 0) {
    await pending$2.pop();
  }
};

const getPendingErrorHandler = () => pendingErrorHandler;
const setPendingErrorHandler = (handler) => {
  pendingErrorHandler = handler;
};

var digest_min = {exports: {}};

/*! digest-js - v0.3.0 - 2015-09-13 */

(function (module, exports) {
/*! ***** BEGIN LICENSE BLOCK *****
 *!
 *! Copyright 2011-2012, 2014 Jean-Christophe Sirot <sirot@chelonix.com>
 *!
 *! This file is part of digest.js
 *!
 *! digest.js is free software: you can redistribute it and/or modify it under
 *! the terms of the GNU General Public License as published by the Free Software
 *! Foundation, either version 3 of the License, or (at your option) any later
 *! version.
 *!
 *! digest.js is distributed in the hope that it will be useful, but
 *! WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 *! or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 *! more details.
 *!
 *! You should have received a copy of the GNU General Public License along with
 *! digest.js. If not, see http://www.gnu.org/licenses/.
 *!
 *! ***** END LICENSE BLOCK *****  */
!function(){ArrayBuffer.prototype.slice||(ArrayBuffer.prototype.slice=function(a,b){var c,d=new Uint8Array(this);void 0===b&&(b=d.length);var e=new ArrayBuffer(b-a),f=new Uint8Array(e);for(c=0;c<f.length;c++)f[c]=d[c+a];return e});}(),function(a){function b(){}function c(){}function d(){}b.prototype.processBlock=function(a){var b,c=this.current[0],d=this.current[1],e=this.current[2],f=this.current[3],g=a[3]<<24|a[2]<<16|a[1]<<8|a[0],h=a[7]<<24|a[6]<<16|a[5]<<8|a[4],i=a[11]<<24|a[10]<<16|a[9]<<8|a[8],j=a[15]<<24|a[14]<<16|a[13]<<8|a[12],k=a[19]<<24|a[18]<<16|a[17]<<8|a[16],l=a[23]<<24|a[22]<<16|a[21]<<8|a[20],m=a[27]<<24|a[26]<<16|a[25]<<8|a[24],n=a[31]<<24|a[30]<<16|a[29]<<8|a[28],o=a[35]<<24|a[34]<<16|a[33]<<8|a[32],p=a[39]<<24|a[38]<<16|a[37]<<8|a[36],q=a[43]<<24|a[42]<<16|a[41]<<8|a[40],r=a[47]<<24|a[46]<<16|a[45]<<8|a[44],s=a[51]<<24|a[50]<<16|a[49]<<8|a[48],t=a[55]<<24|a[54]<<16|a[53]<<8|a[52],u=a[59]<<24|a[58]<<16|a[57]<<8|a[56],v=a[63]<<24|a[62]<<16|a[61]<<8|a[60];b=c+g+3614090360+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+h+3905402710+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+i+606105819+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+j+3250441966+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+k+4118548399+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+l+1200080426+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+m+2821735955+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+n+4249261313+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+o+1770035416+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+p+2336552879+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+q+4294925233+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+r+2304563134+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+s+1804603682+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+t+4254626195+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+u+2792965006+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+v+1236535329+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+h+4129170786+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+m+3225465664+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+r+643717713+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+g+3921069994+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+l+3593408605+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+q+38016083+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+v+3634488961+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+k+3889429448+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+p+568446438+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+u+3275163606+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+j+4107603335+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+o+1163531501+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+t+2850285829+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+i+4243563512+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+n+1735328473+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+s+2368359562+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+l+4294588738+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+o+2272392833+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+r+1839030562+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+u+4259657740+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+h+2763975236+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+k+1272893353+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+n+4139469664+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+q+3200236656+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+t+681279174+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+g+3936430074+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+j+3572445317+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+m+76029189+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+p+3654602809+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+s+3873151461+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+v+530742520+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+i+3299628645+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+g+4096336452+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+n+1126891415+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+u+2878612391+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+l+4237533241+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+s+1700485571+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+j+2399980690+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+q+4293915773+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+h+2240044497+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+o+1873313359+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+v+4264355552+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+m+2734768916+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+t+1309151649+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+k+4149444226+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+r+3174756917+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+i+718787259+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+p+3951481745+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,this.current[0]+=c,this.current[1]+=d,this.current[2]+=e,this.current[3]+=f,this.currentLen+=64;},b.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=4294967295&a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-8]=255&c,e[e.length-7]=c>>>8&255,e[e.length-6]=c>>>16&255,e[e.length-5]=c>>>24&255,e[e.length-4]=255&b,e[e.length-3]=b>>>8&255,e[e.length-2]=b>>>16&255,e[e.length-1]=b>>>24&255,e},b.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(16));return a[0]=255&this.current[0],a[1]=this.current[0]>>>8&255,a[2]=this.current[0]>>>16&255,a[3]=this.current[0]>>>24&255,a[4]=255&this.current[1],a[5]=this.current[1]>>>8&255,a[6]=this.current[1]>>>16&255,a[7]=this.current[1]>>>24&255,a[8]=255&this.current[2],a[9]=this.current[2]>>>8&255,a[10]=this.current[2]>>>16&255,a[11]=this.current[2]>>>24&255,a[12]=255&this.current[3],a[13]=this.current[3]>>>8&255,a[14]=this.current[3]>>>16&255,a[15]=this.current[3]>>>24&255,a.buffer},b.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(16)),this.current[0]=1732584193,this.current[1]=4023233417,this.current[2]=2562383102,this.current[3]=271733878;},b.prototype.blockLen=64,b.prototype.digestLen=16,c.prototype.processBlock=function(a){var b,c,d=this.current[0],e=this.current[1],f=this.current[2],g=this.current[3],h=this.current[4],i=[a[0]<<24|a[1]<<16|a[2]<<8|a[3],a[4]<<24|a[5]<<16|a[6]<<8|a[7],a[8]<<24|a[9]<<16|a[10]<<8|a[11],a[12]<<24|a[13]<<16|a[14]<<8|a[15],a[16]<<24|a[17]<<16|a[18]<<8|a[19],a[20]<<24|a[21]<<16|a[22]<<8|a[23],a[24]<<24|a[25]<<16|a[26]<<8|a[27],a[28]<<24|a[29]<<16|a[30]<<8|a[31],a[32]<<24|a[33]<<16|a[34]<<8|a[35],a[36]<<24|a[37]<<16|a[38]<<8|a[39],a[40]<<24|a[41]<<16|a[42]<<8|a[43],a[44]<<24|a[45]<<16|a[46]<<8|a[47],a[48]<<24|a[49]<<16|a[50]<<8|a[51],a[52]<<24|a[53]<<16|a[54]<<8|a[55],a[56]<<24|a[57]<<16|a[58]<<8|a[59],a[60]<<24|a[61]<<16|a[62]<<8|a[63]];for(c=16;80>c;c++)i.push((i[c-3]^i[c-8]^i[c-14]^i[c-16])<<1|(i[c-3]^i[c-8]^i[c-14]^i[c-16])>>>31);for(c=0;80>c;c++)b=(d<<5|d>>>27)+h+i[c],b+=20>c?(e&f|~e&g)+1518500249|0:40>c?(e^f^g)+1859775393|0:60>c?(e&f|e&g|f&g)+2400959708|0:(e^f^g)+3395469782|0,h=g,g=f,f=e<<30|e>>>2,e=d,d=b;this.current[0]+=d,this.current[1]+=e,this.current[2]+=f,this.current[3]+=g,this.current[4]+=h,this.currentLen+=64;},c.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=4294967295&a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-1]=255&c,e[e.length-2]=c>>>8&255,e[e.length-3]=c>>>16&255,e[e.length-4]=c>>>24&255,e[e.length-5]=255&b,e[e.length-6]=b>>>8&255,e[e.length-7]=b>>>16&255,e[e.length-8]=b>>>24&255,e},c.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(20));return a[3]=255&this.current[0],a[2]=this.current[0]>>>8&255,a[1]=this.current[0]>>>16&255,a[0]=this.current[0]>>>24&255,a[7]=255&this.current[1],a[6]=this.current[1]>>>8&255,a[5]=this.current[1]>>>16&255,a[4]=this.current[1]>>>24&255,a[11]=255&this.current[2],a[10]=this.current[2]>>>8&255,a[9]=this.current[2]>>>16&255,a[8]=this.current[2]>>>24&255,a[15]=255&this.current[3],a[14]=this.current[3]>>>8&255,a[13]=this.current[3]>>>16&255,a[12]=this.current[3]>>>24&255,a[19]=255&this.current[4],a[18]=this.current[4]>>>8&255,a[17]=this.current[4]>>>16&255,a[16]=this.current[4]>>>24&255,a.buffer},c.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(20)),this.current[0]=1732584193,this.current[1]=4023233417,this.current[2]=2562383102,this.current[3]=271733878,this.current[4]=3285377520;},c.prototype.blockLen=64,c.prototype.digestLen=20,d.prototype.processBlock=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t=this.current[0],u=this.current[1],v=this.current[2],w=this.current[3],x=this.current[4],y=this.current[5],z=this.current[6],A=this.current[7];d=a[0]<<24|a[1]<<16|a[2]<<8|a[3],e=a[4]<<24|a[5]<<16|a[6]<<8|a[7],f=a[8]<<24|a[9]<<16|a[10]<<8|a[11],g=a[12]<<24|a[13]<<16|a[14]<<8|a[15],h=a[16]<<24|a[17]<<16|a[18]<<8|a[19],i=a[20]<<24|a[21]<<16|a[22]<<8|a[23],j=a[24]<<24|a[25]<<16|a[26]<<8|a[27],k=a[28]<<24|a[29]<<16|a[30]<<8|a[31],l=a[32]<<24|a[33]<<16|a[34]<<8|a[35],m=a[36]<<24|a[37]<<16|a[38]<<8|a[39],n=a[40]<<24|a[41]<<16|a[42]<<8|a[43],o=a[44]<<24|a[45]<<16|a[46]<<8|a[47],p=a[48]<<24|a[49]<<16|a[50]<<8|a[51],q=a[52]<<24|a[53]<<16|a[54]<<8|a[55],r=a[56]<<24|a[57]<<16|a[58]<<8|a[59],s=a[60]<<24|a[61]<<16|a[62]<<8|a[63];for(var B=[d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s],C=16;64>C;C++)B.push(((B[C-2]>>>17|B[C-2]<<15)^(B[C-2]>>>19|B[C-2]<<13)^B[C-2]>>>10)+B[C-7]+((B[C-15]>>>7|B[C-15]<<25)^(B[C-15]>>>18|B[C-15]<<14)^B[C-15]>>>3)+B[C-16]|0);for(var D=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],E=0;64>E;E++)b=A+((x>>>6|x<<26)^(x>>>11|x<<21)^(x>>>25|x<<7))+(x&y^~x&z)+D[E]+B[E]|0,c=((t>>>2|t<<30)^(t>>>13|t<<19)^(t>>>22|t<<10))+(t&u^u&v^t&v)|0,A=z,z=y,y=x,x=w+b|0,w=v,v=u,u=t,t=b+c|0;this.current[0]+=t,this.current[1]+=u,this.current[2]+=v,this.current[3]+=w,this.current[4]+=x,this.current[5]+=y,this.current[6]+=z,this.current[7]+=A,this.currentLen+=64;},d.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=0|a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-1]=255&c,e[e.length-2]=c>>>8&255,e[e.length-3]=c>>>16&255,e[e.length-4]=c>>>24&255,e[e.length-5]=255&b,e[e.length-6]=b>>>8&255,e[e.length-7]=b>>>16&255,e[e.length-8]=b>>>24&255,e},d.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(32));return a[3]=255&this.current[0],a[2]=this.current[0]>>>8&255,a[1]=this.current[0]>>>16&255,a[0]=this.current[0]>>>24&255,a[7]=255&this.current[1],a[6]=this.current[1]>>>8&255,a[5]=this.current[1]>>>16&255,a[4]=this.current[1]>>>24&255,a[11]=255&this.current[2],a[10]=this.current[2]>>>8&255,a[9]=this.current[2]>>>16&255,a[8]=this.current[2]>>>24&255,a[15]=255&this.current[3],a[14]=this.current[3]>>>8&255,a[13]=this.current[3]>>>16&255,a[12]=this.current[3]>>>24&255,a[19]=255&this.current[4],a[18]=this.current[4]>>>8&255,a[17]=this.current[4]>>>16&255,a[16]=this.current[4]>>>24&255,a[23]=255&this.current[5],a[22]=this.current[5]>>>8&255,a[21]=this.current[5]>>>16&255,a[20]=this.current[5]>>>24&255,a[27]=255&this.current[6],a[26]=this.current[6]>>>8&255,a[25]=this.current[6]>>>16&255,a[24]=this.current[6]>>>24&255,a[31]=255&this.current[7],a[30]=this.current[7]>>>8&255,a[29]=this.current[7]>>>16&255,a[28]=this.current[7]>>>24&255,a.buffer},d.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(32)),this.current[0]=1779033703,this.current[1]=3144134277,this.current[2]=1013904242,this.current[3]=2773480762,this.current[4]=1359893119,this.current[5]=2600822924,this.current[6]=528734635,this.current[7]=1541459225;},d.prototype.blockLen=64,d.prototype.digestLen=32;var e=function(a){var b,c=new ArrayBuffer(a.length),d=new Uint8Array(c);for(b=0;b<a.length;b++)d[b]=a.charCodeAt(b);return d},f=function(a){var b=new ArrayBuffer(1),c=new Uint8Array(b);return c[0]=a,c},g=function(a){if(a.constructor===Uint8Array)return a;if(a.constructor===ArrayBuffer)return new Uint8Array(a);if(a.constructor===String)return e(a);if(a.constructor===Number){if(a>255)throw "For more than one byte, use an array buffer";if(0>a)throw "Input value must be positive";return f(a)}throw "Unsupported type"},h=function(a){var b=new Uint8Array(new ArrayBuffer(4));return b[0]=(4278190080&a)>>24,b[1]=(16711680&a)>>16,b[2]=(65280&a)>>8,b[3]=255&a,b},i=function(a){var b=function(a){for(var b=a.length,c=0;b>0;){var d=this.blockLen-this.inLen;d>b&&(d=b);var e=a.subarray(c,c+d);this.inbuf.set(e,this.inLen),c+=d,b-=d,this.inLen+=d,this.inLen===this.blockLen&&(this.processBlock(this.inbuf),this.inLen=0);}},c=function(){var a=this.doPadding();this.update(a);var b=this.getDigest();return this.reset(),b},d=function(){if(!a)throw "Unsupported algorithm: "+a.toString();a.prototype.update=b,a.prototype.finalize=c;var d=new a;return d.inbuf=new Uint8Array(new ArrayBuffer(d.blockLen)),d.reset(),d}();return {update:function(a){d.update(g(a));},finalize:function(){return d.finalize()},digest:function(a){return d.update(g(a)),d.finalize()},reset:function(){d.reset();},digestLength:function(){return d.digestLen}}},j=function(a){var b,c,d,e=!1,f=function(){var f,g;if(!e){if(void 0===b)throw "MAC key is not defined";for(g=b.byteLength>64?new Uint8Array(a.digest(b)):new Uint8Array(b),c=new Uint8Array(new ArrayBuffer(64)),f=0;f<g.length;f++)c[f]=54^g[f];for(f=g.length;64>f;f++)c[f]=54;for(d=new Uint8Array(new ArrayBuffer(64)),f=0;f<g.length;f++)d[f]=92^g[f];for(f=g.length;64>f;f++)d[f]=92;e=!0,a.update(c.buffer);}},h=function(){e=!1,b=void 0,c=void 0,d=void 0,a.reset();},i=function(){var b=a.finalize();return a.reset(),a.update(d.buffer),a.update(b),b=a.finalize(),h(),b},j=function(a){b=a;};return {setKey:function(a){j(g(a)),f();},update:function(b){a.update(b);},finalize:function(){return i()},mac:function(a){return this.update(a),this.finalize()},reset:function(){h();},hmacLength:function(){return a.digestLength()}}},k=function(a,b){var c=function(c,d,e){var f,g;if(e>a.digestLength())throw "Key length larger than digest length";for(a.reset(),a.update(c),a.update(d),g=a.finalize(),f=1;b>f;f++)g=a.digest(g);return g.slice(0,e)};return {deriveKey:function(a,b,d){return c(g(a),g(b),d)}}},l=function(a,b){var c=function(a,b){var c;for(c=0;c<a.length;c++)a[c]=a[c]^b[c];return a},d=function(b,d,e,f){var g,i=new Uint8Array(new ArrayBuffer(a.hmacLength())),j=new Uint8Array(new ArrayBuffer(d.length+4));for(j.set(d,0),j.set(h(f),d.length),g=1;e>=g;g++)a.setKey(b),a.update(j),j=new Uint8Array(a.finalize()),i=c(i,j);return i},e=function(c,e,f){var g,h,i;if(f>4294967295*a.hmacLength())throw "Derived key length too long";for(h=Math.ceil(f/a.hmacLength()),i=new Uint8Array(new ArrayBuffer(f*a.hmacLength())),g=1;h>=g;g++)i.set(d(c,e,b,g),a.hmacLength()*(g-1));return i.buffer.slice(0,f)};return {deriveKey:function(a,b,c){return e(g(a),g(b),c)}}},m={SHA1:function(){return i(c)},MD5:function(){return i(b)},SHA256:function(){return i(d)},HMAC_SHA1:function(){return j(i(c))},HMAC_MD5:function(){return j(i(b))},HMAC_SHA256:function(){return j(i(d))},PBKDF1_SHA1:function(a){return k(i(c),a)},PBKDF1_MD5:function(a){return k(i(b),a)},PBKDF2_HMAC_SHA1:function(a){return l(j(i(c)),a)},PBKDF2_HMAC_SHA256:function(a){return l(j(i(d)),a)}};module.exports?module.exports=m:m;}();
}(digest_min));

var Digest = digest_min.exports;

/*
 * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};

const hashObject = (object, hash) => {
  if (object.hash) {
    hash.update('hash');
    hash.update(object.hash);
    return;
  }
  const keys = Object.keys(object);
  keys.sort();
  for (const key of keys) {
    if (typeof key === 'symbol') {
      continue;
    }
    hash.update(key);
    hashValue(object[key], hash);
  }
};

const hashArray = (array, hash) => {
  for (const value of array) {
    hashValue(value, hash);
  }
};

const hashValue = (value, hash) => {
  if (value === undefined) {
    hash.update('undefined');
  } else if (value === null) {
    hash.update('null');
  } else if (value instanceof Array) {
    hash.update('array');
    hashArray(value, hash);
  } else if (value instanceof Object) {
    hash.update('object');
    hashObject(value, hash);
  } else if (typeof value === 'number') {
    hash.update('number');
    hash.update(value.toString());
  } else if (typeof value === 'string') {
    hash.update('string');
    hash.update(value);
  } else if (typeof value === 'boolean') {
    hash.update('bool');
    hash.update(value ? 'true' : 'false');
  } else {
    throw Error(`Unexpected hashValue value ${value}`);
  }
};

const computeHash = (value) => {
  // const hash = createHash('sha256');
  const hash = new Digest.SHA256('sha256');
  hashValue(value, hash);
  return encode(hash.finalize());
};

const fromStringToIntegerHash = (s) =>
  Math.abs(
    s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  );

const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then((value) => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking)
            db.addEventListener('versionchange', () => blocking());
    })
        .catch(() => { });
    return openPromise;
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));

const cacheStoreCount = 10;
const workspaces = {};

const ensureDb = (workspace) => {
  let entry = workspaces[workspace];
  if (!entry) {
    const db = openDB('jsxcad/idb', 1, {
      upgrade(db) {
        db.createObjectStore('config/value');
        db.createObjectStore('config/version');
        db.createObjectStore('control/value');
        db.createObjectStore('control/version');
        db.createObjectStore('source/value');
        db.createObjectStore('source/version');
        for (let nth = 0; nth < cacheStoreCount; nth++) {
          db.createObjectStore(`cache_${nth}/value`);
          db.createObjectStore(`cache_${nth}/version`);
        }
      },
    });
    entry = { db, instances: [] };
    workspaces[workspace] = entry;
  }
  return entry;
};

const ensureStore = (store, db, instances) => {
  let instance = instances[store];
  const valueStore = `${store}/value`;
  const versionStore = `${store}/version`;
  if (!instance) {
    instance = {
      clear: async () => {
        const tx = (await db).transaction(
          [valueStore, versionStore],
          'readwrite'
        );
        await tx.objectStore(valueStore).clear();
        await tx.objectStore(versionStore).clear();
        await tx.done;
        return true;
      },
      getItem: async (key) => (await db).get(valueStore, key),
      getItemAndVersion: async (key) => {
        const tx = (await db).transaction([valueStore, versionStore]);
        const value = await tx.objectStore(valueStore).get(key);
        const version = await tx.objectStore(versionStore).get(key);
        await tx.done;
        return { value, version };
      },
      getItemVersion: async (key) => (await db).get(versionStore, key),
      keys: async () => (await db).getAllKeys(valueStore),
      removeItem: async (key) => (await db).delete(valueStore, key),
      setItem: async (key, value) => (await db).put(valueStore, value, key),
      setItemAndIncrementVersion: async (key, value) => {
        const tx = (await db).transaction(
          [valueStore, versionStore],
          'readwrite'
        );
        const version = (await tx.objectStore(versionStore).get(key)) || 0;
        await tx.objectStore(versionStore).put(version + 1, key);
        await tx.objectStore(valueStore).put(value, key);
        await tx.done;
        return version;
      },
    };
    instances[store] = instance;
  }
  return instance;
};

const db = (key) => {
  const [jsxcad, workspace, partition] = key.split('/');
  let store;

  if (jsxcad !== 'jsxcad') {
    throw Error('Malformed key');
  }

  switch (partition) {
    case 'config':
    case 'control':
    case 'source':
      store = partition;
      break;
    default: {
      const nth = fromStringToIntegerHash(key) % cacheStoreCount;
      store = `cache_${nth}`;
      break;
    }
  }
  const { db, instances } = ensureDb(workspace);
  return ensureStore(store, db, instances);
};

const clearCacheDb = async ({ workspace }) => {
  const { db, instances } = ensureDb(workspace);
  for (let nth = 0; nth < cacheStoreCount; nth++) {
    await ensureStore(`cache_${nth}`, db, instances).clear();
  }
};

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config$1 = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit$1 = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime$2 = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime$2;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit$1,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config$1,
  uptime: uptime
};

/* global self */

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const checkIsWebWorker = () => {
  try {
    return (
      self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'
    );
  } catch (e) {
    return false;
  }
};

const isWebWorker = checkIsWebWorker();

const isNode$1 =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

/* global self */
var self$1 = self;

const watchers$1 = new Set();

const log = async (entry) => {
  if (isWebWorker) {
    return addPending(self$1.tell({ op: 'log', entry }));
  }

  for (const watcher of watchers$1) {
    watcher(entry);
  }
};

const logInfo = (source, text) =>
  log({ type: 'info', source, text, id: self$1 && self$1.id });

const logError = (source, text) =>
  log({ type: 'error', source, text, id: self$1 && self$1.id });

const watchLog = (thunk) => {
  watchers$1.add(thunk);
  return thunk;
};

const unwatchLog = (thunk) => {
  watchers$1.delete(thunk);
};

const aggregates = new Map();

const clearTimes = () => {
  aggregates.clear();
};
const getTimes = () => [...aggregates];

const startTime$1 = (name) => {
  if (!aggregates.has(name)) {
    aggregates.set(name, { name, count: 0, total: 0, average: 0 });
  }
  const start = new Date();
  const aggregate = aggregates.get(name);
  const timer = { start, name, aggregate };
  return timer;
};

const endTime = ({ start, name, aggregate }) => {
  const end = new Date();
  const seconds = (end - start) / 1000;
  aggregate.last = seconds;
  aggregate.total += seconds;
  aggregate.count += 1;
  aggregate.average = aggregate.total / aggregate.count;
  return aggregate;
};

const reportTimes = () => {
  const entries = [...aggregates.values()].sort((a, b) => a.total - b.total);
  for (const { average, count, last, name, total } of entries) {
    logInfo(
      'profile',
      `${name} average: ${average.toFixed(
        2
      )} count: ${count} last: ${last.toFixed(2)} total: ${total.toFixed(2)}`
    );
  }
};

let config = {};

const getConfig = () => config;

const setConfig = (value = {}) => {
  config = value;
};

const createConversation = ({ agent, say }) => {
  const conversation = {
    agent,
    history: [],
    id: 0,
    openQuestions: new Map(),
    waiters: [],
    say,
  };

  conversation.waitToFinish = () => {
    if (conversation.openQuestions.size === 0) {
      return true;
    } else {
      const promise = new Promise((resolve, reject) =>
        conversation.waiters.push(resolve)
      );
      return !promise;
    }
  };

  conversation.ask = (question, transfer) => {
    const { id, openQuestions, say } = conversation;
    conversation.id += 1;
    const promise = new Promise((resolve, reject) => {
      openQuestions.set(id, { question, resolve, reject });
    });
    say({ id, question }, transfer);
    return promise;
  };

  conversation.tell = (statement, transfer) => say({ statement }, transfer);

  conversation.hear = async (message) => {
    const { ask, history, openQuestions, tell, waiters } = conversation;
    const { id, question, answer, error, statement } = message;

    const payload = answer || question || statement;
    if (payload instanceof Object && payload.sourceLocation) {
      history.unshift({
        op: payload.op,
        sourceLocation: payload.sourceLocation,
      });
      while (history.length > 3) {
        history.pop();
      }
    }

    // Check hasOwnProperty to detect undefined values.
    if (message.hasOwnProperty('answer')) {
      const openQuestion = openQuestions.get(id);
      if (!openQuestion) {
        throw Error(`Unexpected answer: ${JSON.stringify(message)}`);
      }
      const { resolve, reject } = openQuestion;
      if (error) {
        reject(error);
      } else {
        resolve(answer);
      }
      openQuestions.delete(id);
      if (openQuestions.size === 0) {
        while (waiters.length > 0) {
          waiters.pop()();
        }
      }
    } else if (message.hasOwnProperty('question')) {
      try {
        const answer = await agent({
          ask,
          message: question,
          type: 'question',
          tell,
        });
        say({ id, answer });
      } catch (error) {
        say({ id, answer: 'error', error });
      }
    } else if (message.hasOwnProperty('statement')) {
      await agent({ ask, message: statement, type: 'statement', tell });
    } else if (message.hasOwnProperty('error')) {
      throw error;
    } else {
      throw Error(
        `Expected { answer } or { question } but received ${JSON.stringify(
          message
        )}`
      );
    }
  };

  return conversation;
};

const nodeWorker = () => {};

/* global Worker */

const webWorker = (spec) =>
  new Worker(spec.webWorker, { type: spec.workerType });

let serviceId = 0;

const newWorker = (spec) => {
  if (isNode$1) {
    return nodeWorker();
  } else if (isBrowser) {
    return webWorker(spec);
  } else {
    throw Error('die');
  }
};

// Sets up a worker with conversational interface.
const createService = (spec, worker) => {
  try {
    let service = {};
    service.id = serviceId++;
    service.released = false;
    if (worker === undefined) {
      service.worker = newWorker(spec);
    } else {
      service.worker = worker;
    }
    service.say = (message, transfer) => {
      try {
        service.worker.postMessage(message, transfer);
      } catch (e) {
        console.log(e.stack);
        throw e;
      }
    };
    service.conversation = createConversation({
      agent: spec.agent,
      say: service.say,
    });
    const { ask, hear, waitToFinish } = service.conversation;
    service.waitToFinish = () => {
      service.waiting = true;
      return waitToFinish();
    };
    service.ask = ask;
    service.hear = hear;
    service.tell = (statement) => service.say({ statement });
    service.worker.onmessage = ({ data }) => service.hear(data);
    service.worker.onerror = (error) => {
      console.log(`QQ/worker/error: ${error}`);
    };
    service.release = (terminate) => {
      if (!service.released) {
        service.released = true;
        if (spec.release) {
          spec.release(spec, service, terminate);
        } else {
          const worker = service.releaseWorker();
          if (worker) {
            worker.terminate();
          }
        }
      }
    };
    service.releaseWorker = () => {
      if (service.worker) {
        const worker = service.worker;
        service.worker = undefined;
        return worker;
      } else {
        return undefined;
      }
    };
    service.terminate = () => service.release(true);
    service.tell({ op: 'sys/attach', config: getConfig(), id: service.id });
    return service;
  } catch (e) {
    log({ op: 'text', text: '' + e, level: 'serious', duration: 6000000 });
    console.log(e.stack);
    throw e;
  }
};

const controlValue = new Map();

const setControlValue = (module, label, value) =>
  controlValue.set(`${module}/${label}`, value);

const getControlValue = (module, label, value) => {
  const result = controlValue.get(`${module}/${label}`);
  if (result === undefined) {
    return value;
  } else {
    return result;
  }
};

var empty = {};

var fs = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': empty
});

var v8 = {};

var v8$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': v8
});

// When base is undefined the persistent filesystem is disabled.
let base;

const qualifyPath = (path = '', workspace) => {
  if (workspace !== undefined) {
    return `jsxcad/${workspace}/${path}`;
  } else if (base !== undefined) {
    return `jsxcad/${base}${path}`;
  } else {
    return `jsxcad//${path}`;
  }
};

const setupFilesystem = ({ fileBase } = {}) => {
  // A prefix used to partition the persistent filesystem for multiple workspaces.
  if (fileBase !== undefined) {
    if (fileBase.endsWith('/')) {
      base = fileBase;
    } else {
      base = `${fileBase}/`;
    }
  } else {
    base = undefined;
  }
};

const setupWorkspace = (workspace) =>
  setupFilesystem({ filebase: workspace });

const getFilesystem = () => {
  if (base !== undefined) {
    const [filesystem] = base.split('/');
    return filesystem;
  }
};

const getWorkspace = () => getFilesystem();

const fileChangeWatchers = new Set();
const fileChangeWatchersByPath = new Map();
const fileCreationWatchers = new Set();
const fileDeletionWatchers = new Set();

const runFileCreationWatchers = async (path, workspace) => {
  for (const watcher of fileCreationWatchers) {
    await watcher(path, workspace);
  }
};

const runFileDeletionWatchers = async (path, workspace) => {
  for (const watcher of fileDeletionWatchers) {
    await watcher(path, workspace);
  }
};

const runFileChangeWatchers = async (path, workspace) => {
  for (const watcher of fileChangeWatchers) {
    await watcher(path, workspace);
  }
  const entry = fileChangeWatchersByPath.get(qualifyPath(path, workspace));
  if (entry === undefined) {
    return;
  }
  const { watchers } = entry;
  if (watchers === undefined) {
    return;
  }
  for (const watcher of watchers) {
    await watcher(path, workspace);
  }
};

const watchFile = async (path, workspace, thunk) => {
  if (thunk) {
    const qualifiedPath = qualifyPath(path, workspace);
    let entry = fileChangeWatchersByPath.get(qualifiedPath);
    if (entry === undefined) {
      entry = { path, workspace, watchers: new Set() };
      fileChangeWatchersByPath.set(qualifiedPath, entry);
    }
    entry.watchers.add(thunk);
    return thunk;
  }
};

const unwatchFile = async (path, workspace, thunk) => {
  if (thunk) {
    const qualifiedPath = qualifyPath(path, workspace);
    const entry = fileChangeWatchersByPath.get(qualifiedPath);
    if (entry === undefined) {
      return;
    }
    entry.watchers.delete(thunk);
    if (entry.watchers.size === 0) {
      fileChangeWatchersByPath.delete(qualifiedPath);
    }
  }
};

const unwatchFileCreation = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const unwatchFileDeletion = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const watchFileCreation = async (thunk) => {
  fileCreationWatchers.add(thunk);
  return thunk;
};

const watchFileDeletion = async (thunk) => {
  fileDeletionWatchers.add(thunk);
  return thunk;
};

const files = new Map();

// Do we need the ensureFile functions?
const ensureQualifiedFile = (path, qualifiedPath) => {
  let file = files.get(qualifiedPath);
  // Accessing a file counts as creation.
  if (file === undefined) {
    file = { path, storageKey: qualifiedPath };
    files.set(qualifiedPath, file);
  }
  return file;
};

const getQualifiedFile = (qualifiedPath) => files.get(qualifiedPath);

const getFile = (path, workspace) =>
  getQualifiedFile(qualifyPath(path, workspace));

const listFiles$1 = (set) => {
  for (const file of files.keys()) {
    set.add(file);
  }
};

watchFileDeletion((path, workspace) => {
  const qualifiedPath = qualifyPath(path, workspace);
  const file = files.get(qualifiedPath);
  if (file) {
    file.data = undefined;
  }
  files.delete(qualifiedPath);
});

var nodeFetch = _ => _;

/**
 * returns true if the given object is a promise
 */
function isPromise(obj) {
  if (obj && typeof obj.then === 'function') {
    return true;
  } else {
    return false;
  }
}
Promise.resolve(false);
Promise.resolve(true);
var PROMISE_RESOLVED_VOID = Promise.resolve();
function sleep$1(time, resolveWith) {
  if (!time) time = 0;
  return new Promise(function (res) {
    return setTimeout(function () {
      return res(resolveWith);
    }, time);
  });
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
/**
 * https://stackoverflow.com/a/8084248
 */

function randomToken() {
  return Math.random().toString(36).substring(2);
}
var lastMs = 0;
var additional = 0;
/**
 * returns the current time in micro-seconds,
 * WARNING: This is a pseudo-function
 * Performance.now is not reliable in webworkers, so we just make sure to never return the same time.
 * This is enough in browsers, and this function will not be used in nodejs.
 * The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is used in fast-running unit tests.
 */

function microSeconds$4() {
  var ms = new Date().getTime();

  if (ms === lastMs) {
    additional++;
    return ms * 1000 + additional;
  } else {
    lastMs = ms;
    additional = 0;
    return ms * 1000;
  }
}
/**
 * copied from the 'detect-node' npm module
 * We cannot use the module directly because it causes problems with rollup
 * @link https://github.com/iliakan/detect-node/blob/master/index.js
 */

var isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

var microSeconds$3 = microSeconds$4;
var type$3 = 'native';
function create$3(channelName) {
  var state = {
    messagesCallback: null,
    bc: new BroadcastChannel(channelName),
    subFns: [] // subscriberFunctions

  };

  state.bc.onmessage = function (msg) {
    if (state.messagesCallback) {
      state.messagesCallback(msg.data);
    }
  };

  return state;
}
function close$3(channelState) {
  channelState.bc.close();
  channelState.subFns = [];
}
function postMessage$3(channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false);
    return PROMISE_RESOLVED_VOID;
  } catch (err) {
    return Promise.reject(err);
  }
}
function onMessage$3(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed$3() {
  /**
   * in the electron-renderer, isNode will be true even if we are in browser-context
   * so we also check if window is undefined
   */
  if (isNode && typeof window === 'undefined') return false;

  if (typeof BroadcastChannel === 'function') {
    if (BroadcastChannel._pubkey) {
      throw new Error('BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill');
    }

    return true;
  } else return false;
}
function averageResponseTime$3() {
  return 150;
}
var NativeMethod = {
  create: create$3,
  close: close$3,
  onMessage: onMessage$3,
  postMessage: postMessage$3,
  canBeUsed: canBeUsed$3,
  type: type$3,
  averageResponseTime: averageResponseTime$3,
  microSeconds: microSeconds$3
};

/**
 * this is a set which automatically forgets
 * a given entry when a new entry is set and the ttl
 * of the old one is over
 */
var ObliviousSet = /** @class */ (function () {
    function ObliviousSet(ttl) {
        this.ttl = ttl;
        this.map = new Map();
        /**
         * Creating calls to setTimeout() is expensive,
         * so we only do that if there is not timeout already open.
         */
        this._to = false;
    }
    ObliviousSet.prototype.has = function (value) {
        return this.map.has(value);
    };
    ObliviousSet.prototype.add = function (value) {
        var _this = this;
        this.map.set(value, now());
        /**
         * When a new value is added,
         * start the cleanup at the next tick
         * to not block the cpu for more important stuff
         * that might happen.
         */
        if (!this._to) {
            this._to = true;
            setTimeout(function () {
                _this._to = false;
                removeTooOldValues(_this);
            }, 0);
        }
    };
    ObliviousSet.prototype.clear = function () {
        this.map.clear();
    };
    return ObliviousSet;
}());
/**
 * Removes all entries from the set
 * where the TTL has expired
 */
function removeTooOldValues(obliviousSet) {
    var olderThen = now() - obliviousSet.ttl;
    var iterator = obliviousSet.map[Symbol.iterator]();
    /**
     * Because we can assume the new values are added at the bottom,
     * we start from the top and stop as soon as we reach a non-too-old value.
     */
    while (true) {
        var next = iterator.next().value;
        if (!next) {
            return; // no more elements
        }
        var value = next[0];
        var time = next[1];
        if (time < olderThen) {
            obliviousSet.map.delete(value);
        }
        else {
            // We reached a value that is not old enough
            return;
        }
    }
}
function now() {
    return new Date().getTime();
}

function fillOptionsWithDefaults() {
  var originalOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = JSON.parse(JSON.stringify(originalOptions)); // main

  if (typeof options.webWorkerSupport === 'undefined') options.webWorkerSupport = true; // indexed-db

  if (!options.idb) options.idb = {}; //  after this time the messages get deleted

  if (!options.idb.ttl) options.idb.ttl = 1000 * 45;
  if (!options.idb.fallbackInterval) options.idb.fallbackInterval = 150; //  handles abrupt db onclose events.

  if (originalOptions.idb && typeof originalOptions.idb.onclose === 'function') options.idb.onclose = originalOptions.idb.onclose; // localstorage

  if (!options.localstorage) options.localstorage = {};
  if (!options.localstorage.removeTimeout) options.localstorage.removeTimeout = 1000 * 60; // custom methods

  if (originalOptions.methods) options.methods = originalOptions.methods; // node

  if (!options.node) options.node = {};
  if (!options.node.ttl) options.node.ttl = 1000 * 60 * 2; // 2 minutes;

  /**
   * On linux use 'ulimit -Hn' to get the limit of open files.
   * On ubuntu this was 4096 for me, so we use half of that as maxParallelWrites default.
   */

  if (!options.node.maxParallelWrites) options.node.maxParallelWrites = 2048;
  if (typeof options.node.useFastPath === 'undefined') options.node.useFastPath = true;
  return options;
}

/**
 * this method uses indexeddb to store the messages
 * There is currently no observerAPI for idb
 * @link https://github.com/w3c/IndexedDB/issues/51
 * 
 * When working on this, ensure to use these performance optimizations:
 * @link https://rxdb.info/slow-indexeddb.html
 */
var microSeconds$2 = microSeconds$4;
var DB_PREFIX = 'pubkey.broadcast-channel-0-';
var OBJECT_STORE_ID = 'messages';
/**
 * Use relaxed durability for faster performance on all transactions.
 * @link https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/
 */

var TRANSACTION_SETTINGS = {
  durability: 'relaxed'
};
var type$2 = 'idb';
function getIdb() {
  if (typeof indexedDB !== 'undefined') return indexedDB;

  if (typeof window !== 'undefined') {
    if (typeof window.mozIndexedDB !== 'undefined') return window.mozIndexedDB;
    if (typeof window.webkitIndexedDB !== 'undefined') return window.webkitIndexedDB;
    if (typeof window.msIndexedDB !== 'undefined') return window.msIndexedDB;
  }

  return false;
}
/**
 * If possible, we should explicitly commit IndexedDB transactions
 * for better performance.
 * @link https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/
 */

function commitIndexedDBTransaction(tx) {
  if (tx.commit) {
    tx.commit();
  }
}
function createDatabase(channelName) {
  var IndexedDB = getIdb(); // create table

  var dbName = DB_PREFIX + channelName;
  /**
   * All IndexedDB databases are opened without version
   * because it is a bit faster, especially on firefox
   * @link http://nparashuram.com/IndexedDB/perf/#Open%20Database%20with%20version
   */

  var openRequest = IndexedDB.open(dbName);

  openRequest.onupgradeneeded = function (ev) {
    var db = ev.target.result;
    db.createObjectStore(OBJECT_STORE_ID, {
      keyPath: 'id',
      autoIncrement: true
    });
  };

  var dbPromise = new Promise(function (res, rej) {
    openRequest.onerror = function (ev) {
      return rej(ev);
    };

    openRequest.onsuccess = function () {
      res(openRequest.result);
    };
  });
  return dbPromise;
}
/**
 * writes the new message to the database
 * so other readers can find it
 */

function writeMessage(db, readerUuid, messageJson) {
  var time = new Date().getTime();
  var writeObject = {
    uuid: readerUuid,
    time: time,
    data: messageJson
  };
  var tx = db.transaction([OBJECT_STORE_ID], 'readwrite', TRANSACTION_SETTINGS);
  return new Promise(function (res, rej) {
    tx.oncomplete = function () {
      return res();
    };

    tx.onerror = function (ev) {
      return rej(ev);
    };

    var objectStore = tx.objectStore(OBJECT_STORE_ID);
    objectStore.add(writeObject);
    commitIndexedDBTransaction(tx);
  });
}
function getMessagesHigherThan(db, lastCursorId) {
  var tx = db.transaction(OBJECT_STORE_ID, 'readonly', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  var keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
  /**
   * Optimization shortcut,
   * if getAll() can be used, do not use a cursor.
   * @link https://rxdb.info/slow-indexeddb.html
   */

  if (objectStore.getAll) {
    var getAllRequest = objectStore.getAll(keyRangeValue);
    return new Promise(function (res, rej) {
      getAllRequest.onerror = function (err) {
        return rej(err);
      };

      getAllRequest.onsuccess = function (e) {
        res(e.target.result);
      };
    });
  }

  function openCursor() {
    // Occasionally Safari will fail on IDBKeyRange.bound, this
    // catches that error, having it open the cursor to the first
    // item. When it gets data it will advance to the desired key.
    try {
      keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
      return objectStore.openCursor(keyRangeValue);
    } catch (e) {
      return objectStore.openCursor();
    }
  }

  return new Promise(function (res, rej) {
    var openCursorRequest = openCursor();

    openCursorRequest.onerror = function (err) {
      return rej(err);
    };

    openCursorRequest.onsuccess = function (ev) {
      var cursor = ev.target.result;

      if (cursor) {
        if (cursor.value.id < lastCursorId + 1) {
          cursor["continue"](lastCursorId + 1);
        } else {
          ret.push(cursor.value);
          cursor["continue"]();
        }
      } else {
        commitIndexedDBTransaction(tx);
        res(ret);
      }
    };
  });
}
function removeMessagesById(db, ids) {
  var tx = db.transaction([OBJECT_STORE_ID], 'readwrite', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  return Promise.all(ids.map(function (id) {
    var deleteRequest = objectStore["delete"](id);
    return new Promise(function (res) {
      deleteRequest.onsuccess = function () {
        return res();
      };
    });
  }));
}
function getOldMessages(db, ttl) {
  var olderThen = new Date().getTime() - ttl;
  var tx = db.transaction(OBJECT_STORE_ID, 'readonly', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function (res) {
    objectStore.openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;

      if (cursor) {
        var msgObk = cursor.value;

        if (msgObk.time < olderThen) {
          ret.push(msgObk); //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);

          cursor["continue"]();
        } else {
          // no more old messages,
          commitIndexedDBTransaction(tx);
          res(ret);
          return;
        }
      } else {
        res(ret);
      }
    };
  });
}
function cleanOldMessages(db, ttl) {
  return getOldMessages(db, ttl).then(function (tooOld) {
    return removeMessagesById(db, tooOld.map(function (msg) {
      return msg.id;
    }));
  });
}
function create$2(channelName, options) {
  options = fillOptionsWithDefaults(options);
  return createDatabase(channelName).then(function (db) {
    var state = {
      closed: false,
      lastCursorId: 0,
      channelName: channelName,
      options: options,
      uuid: randomToken(),

      /**
       * emittedMessagesIds
       * contains all messages that have been emitted before
       * @type {ObliviousSet}
       */
      eMIs: new ObliviousSet(options.idb.ttl * 2),
      // ensures we do not read messages in parrallel
      writeBlockPromise: PROMISE_RESOLVED_VOID,
      messagesCallback: null,
      readQueuePromises: [],
      db: db
    };
    /**
     * Handle abrupt closes that do not originate from db.close().
     * This could happen, for example, if the underlying storage is
     * removed or if the user clears the database in the browser's
     * history preferences.
     */

    db.onclose = function () {
      state.closed = true;
      if (options.idb.onclose) options.idb.onclose();
    };
    /**
     * if service-workers are used,
     * we have no 'storage'-event if they post a message,
     * therefore we also have to set an interval
     */


    _readLoop(state);

    return state;
  });
}

function _readLoop(state) {
  if (state.closed) return;
  readNewMessages(state).then(function () {
    return sleep$1(state.options.idb.fallbackInterval);
  }).then(function () {
    return _readLoop(state);
  });
}

function _filterMessage(msgObj, state) {
  if (msgObj.uuid === state.uuid) return false; // send by own

  if (state.eMIs.has(msgObj.id)) return false; // already emitted

  if (msgObj.data.time < state.messagesCallbackTime) return false; // older then onMessageCallback

  return true;
}
/**
 * reads all new messages from the database and emits them
 */


function readNewMessages(state) {
  // channel already closed
  if (state.closed) return PROMISE_RESOLVED_VOID; // if no one is listening, we do not need to scan for new messages

  if (!state.messagesCallback) return PROMISE_RESOLVED_VOID;
  return getMessagesHigherThan(state.db, state.lastCursorId).then(function (newerMessages) {
    var useMessages = newerMessages
    /**
     * there is a bug in iOS where the msgObj can be undefined some times
     * so we filter them out
     * @link https://github.com/pubkey/broadcast-channel/issues/19
     */
    .filter(function (msgObj) {
      return !!msgObj;
    }).map(function (msgObj) {
      if (msgObj.id > state.lastCursorId) {
        state.lastCursorId = msgObj.id;
      }

      return msgObj;
    }).filter(function (msgObj) {
      return _filterMessage(msgObj, state);
    }).sort(function (msgObjA, msgObjB) {
      return msgObjA.time - msgObjB.time;
    }); // sort by time

    useMessages.forEach(function (msgObj) {
      if (state.messagesCallback) {
        state.eMIs.add(msgObj.id);
        state.messagesCallback(msgObj.data);
      }
    });
    return PROMISE_RESOLVED_VOID;
  });
}

function close$2(channelState) {
  channelState.closed = true;
  channelState.db.close();
}
function postMessage$2(channelState, messageJson) {
  channelState.writeBlockPromise = channelState.writeBlockPromise.then(function () {
    return writeMessage(channelState.db, channelState.uuid, messageJson);
  }).then(function () {
    if (randomInt(0, 10) === 0) {
      /* await (do not await) */
      cleanOldMessages(channelState.db, channelState.options.idb.ttl);
    }
  });
  return channelState.writeBlockPromise;
}
function onMessage$2(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
  readNewMessages(channelState);
}
function canBeUsed$2() {
  if (isNode) return false;
  var idb = getIdb();
  if (!idb) return false;
  return true;
}
function averageResponseTime$2(options) {
  return options.idb.fallbackInterval * 2;
}
var IndexeDbMethod = {
  create: create$2,
  close: close$2,
  onMessage: onMessage$2,
  postMessage: postMessage$2,
  canBeUsed: canBeUsed$2,
  type: type$2,
  averageResponseTime: averageResponseTime$2,
  microSeconds: microSeconds$2
};

/**
 * A localStorage-only method which uses localstorage and its 'storage'-event
 * This does not work inside of webworkers because they have no access to locastorage
 * This is basically implemented to support IE9 or your grandmothers toaster.
 * @link https://caniuse.com/#feat=namevalue-storage
 * @link https://caniuse.com/#feat=indexeddb
 */
var microSeconds$1 = microSeconds$4;
var KEY_PREFIX = 'pubkey.broadcastChannel-';
var type$1 = 'localstorage';
/**
 * copied from crosstab
 * @link https://github.com/tejacques/crosstab/blob/master/src/crosstab.js#L32
 */

function getLocalStorage() {
  var localStorage;
  if (typeof window === 'undefined') return null;

  try {
    localStorage = window.localStorage;
    localStorage = window['ie8-eventlistener/storage'] || window.localStorage;
  } catch (e) {// New versions of Firefox throw a Security exception
    // if cookies are disabled. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1028153
  }

  return localStorage;
}
function storageKey(channelName) {
  return KEY_PREFIX + channelName;
}
/**
* writes the new message to the storage
* and fires the storage-event so other readers can find it
*/

function postMessage$1(channelState, messageJson) {
  return new Promise(function (res) {
    sleep$1().then(function () {
      var key = storageKey(channelState.channelName);
      var writeObj = {
        token: randomToken(),
        time: new Date().getTime(),
        data: messageJson,
        uuid: channelState.uuid
      };
      var value = JSON.stringify(writeObj);
      getLocalStorage().setItem(key, value);
      /**
       * StorageEvent does not fire the 'storage' event
       * in the window that changes the state of the local storage.
       * So we fire it manually
       */

      var ev = document.createEvent('Event');
      ev.initEvent('storage', true, true);
      ev.key = key;
      ev.newValue = value;
      window.dispatchEvent(ev);
      res();
    });
  });
}
function addStorageEventListener(channelName, fn) {
  var key = storageKey(channelName);

  var listener = function listener(ev) {
    if (ev.key === key) {
      fn(JSON.parse(ev.newValue));
    }
  };

  window.addEventListener('storage', listener);
  return listener;
}
function removeStorageEventListener(listener) {
  window.removeEventListener('storage', listener);
}
function create$1(channelName, options) {
  options = fillOptionsWithDefaults(options);

  if (!canBeUsed$1()) {
    throw new Error('BroadcastChannel: localstorage cannot be used');
  }

  var uuid = randomToken();
  /**
   * eMIs
   * contains all messages that have been emitted before
   * @type {ObliviousSet}
   */

  var eMIs = new ObliviousSet(options.localstorage.removeTimeout);
  var state = {
    channelName: channelName,
    uuid: uuid,
    eMIs: eMIs // emittedMessagesIds

  };
  state.listener = addStorageEventListener(channelName, function (msgObj) {
    if (!state.messagesCallback) return; // no listener

    if (msgObj.uuid === uuid) return; // own message

    if (!msgObj.token || eMIs.has(msgObj.token)) return; // already emitted

    if (msgObj.data.time && msgObj.data.time < state.messagesCallbackTime) return; // too old

    eMIs.add(msgObj.token);
    state.messagesCallback(msgObj.data);
  });
  return state;
}
function close$1(channelState) {
  removeStorageEventListener(channelState.listener);
}
function onMessage$1(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
}
function canBeUsed$1() {
  if (isNode) return false;
  var ls = getLocalStorage();
  if (!ls) return false;

  try {
    var key = '__broadcastchannel_check';
    ls.setItem(key, 'works');
    ls.removeItem(key);
  } catch (e) {
    // Safari 10 in private mode will not allow write access to local
    // storage and fail with a QuotaExceededError. See
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#Private_Browsing_Incognito_modes
    return false;
  }

  return true;
}
function averageResponseTime$1() {
  var defaultTime = 120;
  var userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    // safari is much slower so this time is higher
    return defaultTime * 2;
  }

  return defaultTime;
}
var LocalstorageMethod = {
  create: create$1,
  close: close$1,
  onMessage: onMessage$1,
  postMessage: postMessage$1,
  canBeUsed: canBeUsed$1,
  type: type$1,
  averageResponseTime: averageResponseTime$1,
  microSeconds: microSeconds$1
};

var microSeconds = microSeconds$4;
var type = 'simulate';
var SIMULATE_CHANNELS = new Set();
function create(channelName) {
  var state = {
    name: channelName,
    messagesCallback: null
  };
  SIMULATE_CHANNELS.add(state);
  return state;
}
function close(channelState) {
  SIMULATE_CHANNELS["delete"](channelState);
}
function postMessage(channelState, messageJson) {
  return new Promise(function (res) {
    return setTimeout(function () {
      var channelArray = Array.from(SIMULATE_CHANNELS);
      channelArray.filter(function (channel) {
        return channel.name === channelState.name;
      }).filter(function (channel) {
        return channel !== channelState;
      }).filter(function (channel) {
        return !!channel.messagesCallback;
      }).forEach(function (channel) {
        return channel.messagesCallback(messageJson);
      });
      res();
    }, 5);
  });
}
function onMessage(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed() {
  return true;
}
function averageResponseTime() {
  return 5;
}
var SimulateMethod = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};

var METHODS = [NativeMethod, // fastest
IndexeDbMethod, LocalstorageMethod];
function chooseMethod(options) {
  var chooseMethods = [].concat(options.methods, METHODS).filter(Boolean); // the line below will be removed from es5/browser builds



  if (options.type) {
    if (options.type === 'simulate') {
      // only use simulate-method if directly chosen
      return SimulateMethod;
    }

    var ret = chooseMethods.find(function (m) {
      return m.type === options.type;
    });
    if (!ret) throw new Error('method-type ' + options.type + ' not found');else return ret;
  }
  /**
   * if no webworker support is needed,
   * remove idb from the list so that localstorage is been chosen
   */


  if (!options.webWorkerSupport && !isNode) {
    chooseMethods = chooseMethods.filter(function (m) {
      return m.type !== 'idb';
    });
  }

  var useMethod = chooseMethods.find(function (method) {
    return method.canBeUsed();
  });
  if (!useMethod) throw new Error("No useable method found in " + JSON.stringify(METHODS.map(function (m) {
    return m.type;
  })));else return useMethod;
}

/**
 * Contains all open channels,
 * used in tests to ensure everything is closed.
 */

var OPEN_BROADCAST_CHANNELS = new Set();
var lastId = 0;
var BroadcastChannel$1 = function BroadcastChannel(name, options) {
  // identifier of the channel to debug stuff
  this.id = lastId++;
  OPEN_BROADCAST_CHANNELS.add(this);
  this.name = name;

  if (ENFORCED_OPTIONS) {
    options = ENFORCED_OPTIONS;
  }

  this.options = fillOptionsWithDefaults(options);
  this.method = chooseMethod(this.options); // isListening

  this._iL = false;
  /**
   * _onMessageListener
   * setting onmessage twice,
   * will overwrite the first listener
   */

  this._onML = null;
  /**
   * _addEventListeners
   */

  this._addEL = {
    message: [],
    internal: []
  };
  /**
   * Unsend message promises
   * where the sending is still in progress
   * @type {Set<Promise>}
   */

  this._uMP = new Set();
  /**
   * _beforeClose
   * array of promises that will be awaited
   * before the channel is closed
   */

  this._befC = [];
  /**
   * _preparePromise
   */

  this._prepP = null;

  _prepareChannel(this);
}; // STATICS

/**
 * used to identify if someone overwrites
 * window.BroadcastChannel with this
 * See methods/native.js
 */

BroadcastChannel$1._pubkey = true;
/**
 * if set, this method is enforced,
 * no mather what the options are
 */

var ENFORCED_OPTIONS;

BroadcastChannel$1.prototype = {
  postMessage: function postMessage(msg) {
    if (this.closed) {
      throw new Error('BroadcastChannel.postMessage(): ' + 'Cannot post message after channel has closed ' +
      /**
       * In the past when this error appeared, it was realy hard to debug.
       * So now we log the msg together with the error so it at least
       * gives some clue about where in your application this happens.
       */
      JSON.stringify(msg));
    }

    return _post(this, 'message', msg);
  },
  postInternal: function postInternal(msg) {
    return _post(this, 'internal', msg);
  },

  set onmessage(fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };

    _removeListenerObject(this, 'message', this._onML);

    if (fn && typeof fn === 'function') {
      this._onML = listenObj;

      _addListenerObject(this, 'message', listenObj);
    } else {
      this._onML = null;
    }
  },

  addEventListener: function addEventListener(type, fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };

    _addListenerObject(this, type, listenObj);
  },
  removeEventListener: function removeEventListener(type, fn) {
    var obj = this._addEL[type].find(function (obj) {
      return obj.fn === fn;
    });

    _removeListenerObject(this, type, obj);
  },
  close: function close() {
    var _this = this;

    if (this.closed) {
      return;
    }

    OPEN_BROADCAST_CHANNELS["delete"](this);
    this.closed = true;
    var awaitPrepare = this._prepP ? this._prepP : PROMISE_RESOLVED_VOID;
    this._onML = null;
    this._addEL.message = [];
    return awaitPrepare // wait until all current sending are processed
    .then(function () {
      return Promise.all(Array.from(_this._uMP));
    }) // run before-close hooks
    .then(function () {
      return Promise.all(_this._befC.map(function (fn) {
        return fn();
      }));
    }) // close the channel
    .then(function () {
      return _this.method.close(_this._state);
    });
  },

  get type() {
    return this.method.type;
  },

  get isClosed() {
    return this.closed;
  }

};
/**
 * Post a message over the channel
 * @returns {Promise} that resolved when the message sending is done
 */

function _post(broadcastChannel, type, msg) {
  var time = broadcastChannel.method.microSeconds();
  var msgObj = {
    time: time,
    type: type,
    data: msg
  };
  var awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : PROMISE_RESOLVED_VOID;
  return awaitPrepare.then(function () {
    var sendPromise = broadcastChannel.method.postMessage(broadcastChannel._state, msgObj); // add/remove to unsend messages list

    broadcastChannel._uMP.add(sendPromise);

    sendPromise["catch"]().then(function () {
      return broadcastChannel._uMP["delete"](sendPromise);
    });
    return sendPromise;
  });
}

function _prepareChannel(channel) {
  var maybePromise = channel.method.create(channel.name, channel.options);

  if (isPromise(maybePromise)) {
    channel._prepP = maybePromise;
    maybePromise.then(function (s) {
      // used in tests to simulate slow runtime

      /*if (channel.options.prepareDelay) {
           await new Promise(res => setTimeout(res, this.options.prepareDelay));
      }*/
      channel._state = s;
    });
  } else {
    channel._state = maybePromise;
  }
}

function _hasMessageListeners(channel) {
  if (channel._addEL.message.length > 0) return true;
  if (channel._addEL.internal.length > 0) return true;
  return false;
}

function _addListenerObject(channel, type, obj) {
  channel._addEL[type].push(obj);

  _startListening(channel);
}

function _removeListenerObject(channel, type, obj) {
  channel._addEL[type] = channel._addEL[type].filter(function (o) {
    return o !== obj;
  });

  _stopListening(channel);
}

function _startListening(channel) {
  if (!channel._iL && _hasMessageListeners(channel)) {
    // someone is listening, start subscribing
    var listenerFn = function listenerFn(msgObj) {
      channel._addEL[msgObj.type].forEach(function (listenerObject) {
        /**
         * Getting the current time in JavaScript has no good precision.
         * So instead of only listening to events that happend 'after' the listener
         * was added, we also listen to events that happended 100ms before it.
         * This ensures that when another process, like a WebWorker, sends events
         * we do not miss them out because their timestamp is a bit off compared to the main process.
         * Not doing this would make messages missing when we send data directly after subscribing and awaiting a response.
         * @link https://johnresig.com/blog/accuracy-of-javascript-time/
         */
        var hundredMsInMicro = 100 * 1000;
        var minMessageTime = listenerObject.time - hundredMsInMicro;

        if (msgObj.time >= minMessageTime) {
          listenerObject.fn(msgObj.data);
        }
      });
    };

    var time = channel.method.microSeconds();

    if (channel._prepP) {
      channel._prepP.then(function () {
        channel._iL = true;
        channel.method.onMessage(channel._state, listenerFn, time);
      });
    } else {
      channel._iL = true;
      channel.method.onMessage(channel._state, listenerFn, time);
    }
  }
}

function _stopListening(channel) {
  if (channel._iL && !_hasMessageListeners(channel)) {
    // noone is listening, stop subscribing
    channel._iL = false;
    var time = channel.method.microSeconds();
    channel.method.onMessage(channel._state, null, time);
  }
}

let broadcastChannel;

const receiveNotification = async ({ id, op, path, workspace }) => {
  logInfo(
    'sys/broadcast',
    `Received broadcast: ${JSON.stringify({ id, op, path, workspace })}`
  );
  switch (op) {
    case 'changePath':
      await runFileChangeWatchers(path, workspace);
      break;
    case 'createPath':
      await runFileCreationWatchers(path, workspace);
      break;
    case 'deletePath':
      await runFileDeletionWatchers(path, workspace);
      break;
    default:
      throw Error(
        `Unexpected broadcast ${JSON.stringify({ id, op, path, workspace })}`
      );
  }
};

const receiveBroadcast = ({ id, op, path, workspace }) => {
  if (id === (self$1 && self$1.id)) {
    // We already received this via a local receiveNotification.
    return;
  }
  receiveNotification({ id, op, path, workspace });
};

const sendBroadcast = async (message) => {
  // We send to ourself immediately, so that we can order effects like cache clears and updates.
  await receiveNotification(message);
  broadcastChannel.postMessage(message);
};

const initBroadcastChannel = async () => {
  broadcastChannel = new BroadcastChannel$1('sys/fs');
  broadcastChannel.onmessage = receiveBroadcast;
};

const notifyFileChange = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'changePath', path, workspace });

const notifyFileCreation = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'createPath', path, workspace });

const notifyFileDeletion = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'deletePath', path, workspace });

initBroadcastChannel();

// Copyright Joyent, Inc. and other Node contributors.

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

const { promises: promises$3 } = fs;
const { serialize } = v8$1;

const getFileWriter = () => {
  if (isNode$1) {
    return async (qualifiedPath, data) => {
      try {
        await promises$3.mkdir(dirname(qualifiedPath), { recursive: true });
      } catch (error) {
        throw error;
      }
      try {
        await promises$3.writeFile(qualifiedPath, serialize(data));
        // FIX: Do proper versioning.
        const version = 0;
        return version;
      } catch (error) {
        throw error;
      }
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath, data) => {
      return db(qualifiedPath).setItemAndIncrementVersion(qualifiedPath, data);
    };
  }
};

const fileWriter = getFileWriter();

const writeNonblocking = (path, data, options = {}) => {
  const { workspace = getFilesystem(), errorOnBlocking = true } = options;
  const qualifiedPath = qualifyPath(path, workspace);
  const file = ensureQualifiedFile(path, qualifiedPath);
  if (file.data === data) {
    // This has already been written.
    return true;
  }
  // Schedule a deferred write to update persistent storage.
  addPending(write(path, data, options));
  if (errorOnBlocking) {
    throw new ErrorWouldBlock(`Would have blocked on write ${path}`);
  }
};

const write = async (path, data, options = {}) => {
  data = await data;

  if (typeof data === 'function') {
    // Always fail to write functions.
    return undefined;
  }

  const { ephemeral, workspace = getFilesystem() } = options;

  const qualifiedPath = qualifyPath(path, workspace);
  const file = ensureQualifiedFile(path, qualifiedPath);

  if (!file.data) {
    await notifyFileCreation(path, workspace);
  }

  file.data = data;

  if (!ephemeral && workspace !== undefined) {
    file.version = await fileWriter(qualifiedPath, data);
  }

  // Let everyone else know the file has changed.
  await notifyFileChange(path, workspace);

  return true;
};

/* global self */

const { promises: promises$2 } = fs;
const { deserialize } = v8$1;

const getUrlFetcher = () => {
  if (isBrowser) {
    return window.fetch;
  }
  if (isWebWorker) {
    return self.fetch;
  }
  if (isNode$1) {
    return nodeFetch;
  }
  throw Error('Expected browser or web worker or node');
};

const urlFetcher = getUrlFetcher();

const getExternalFileFetcher = () => {
  if (isNode$1) {
    // FIX: Put this through getFile, also.
    return async (qualifiedPath) => {
      try {
        let data = await promises$2.readFile(qualifiedPath);
        return data;
      } catch (e) {
        if (e.code && e.code === 'ENOENT') {
          return {};
        }
        logInfo('sys/getExternalFile/error', e.toString());
      }
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath) => {};
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const externalFileFetcher = getExternalFileFetcher();

const getInternalFileFetcher = () => {
  if (isNode$1) {
    // FIX: Put this through getFile, also.
    return async (qualifiedPath, doSerialize = true) => {
      try {
        let data = await promises$2.readFile(qualifiedPath);
        if (doSerialize) {
          data = deserialize(data);
        }
        // FIX: Use a proper version.
        return { data, version: 0 };
      } catch (e) {
        if (e.code && e.code === 'ENOENT') {
          return {};
        }
        logInfo('sys/getExternalFile/error', e.toString());
      }
    };
  } else if (isBrowser || isWebWorker) {
    return (qualifiedPath) =>
      db(qualifiedPath).getItemAndVersion(qualifiedPath);
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const internalFileFetcher = getInternalFileFetcher();

const getInternalFileVersionFetcher = (qualify = qualifyPath) => {
  if (isNode$1) {
    // FIX: Put this through getFile, also.
    return (qualifiedPath) => {
      // FIX: Use a proper version.
      return 0;
    };
  } else if (isBrowser || isWebWorker) {
    return (qualifiedPath) => db(qualifiedPath).getItemVersion(qualifiedPath);
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const internalFileVersionFetcher = getInternalFileVersionFetcher();

// Fetch from internal store.
const fetchPersistent = (qualifiedPath, { workspace, doSerialize }) => {
  try {
    if (workspace) {
      return internalFileFetcher(qualifiedPath, doSerialize);
    } else {
      return {};
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      return {};
    }
    logInfo('sys/fetchPersistent/error', e.toString());
  }
};

const fetchPersistentVersion = (qualifiedPath, { workspace }) => {
  try {
    if (workspace) {
      return internalFileVersionFetcher(qualifiedPath);
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      return;
    }
    logInfo('sys/fetchPersistentVersion/error', e.toString());
  }
};

// Fetch from external sources.
const fetchSources = async (sources, { workspace }) => {
  // Try to load the data from a source.
  for (const source of sources) {
    if (typeof source === 'string') {
      try {
        if (source.startsWith('http:') || source.startsWith('https:')) {
          logInfo('sys/fetchSources/url', source);
          const response = await urlFetcher(source, { cache: 'reload' });
          if (response.ok) {
            return new Uint8Array(await response.arrayBuffer());
          }
        } else {
          logInfo('sys/fetchSources/file', source);
          // Assume a file path.
          const data = await externalFileFetcher(source);
          if (data !== undefined) {
            return data;
          }
        }
      } catch (e) {}
    } else {
      throw Error('Expected file source to be a string');
    }
  }
};

const readNonblocking = (path, options = {}) => {
  const { workspace = getFilesystem(), errorOnMissing = true } = options;
  const file = getFile(path, workspace);
  if (file) {
    return file.data;
  }
  addPending(read(path, options));
  if (errorOnMissing) {
    throw new ErrorWouldBlock(`Would have blocked on read ${path}`);
  }
};

const read = async (path, options = {}) => {
  const {
    allowFetch = true,
    ephemeral,
    sources = [],
    workspace = getFilesystem(),
    useCache = true,
    forceNoCache = false,
    decode,
  } = options;
  const qualifiedPath = qualifyPath(path, workspace);
  const file = ensureQualifiedFile(path, qualifiedPath);

  if (file.data && workspace) {
    // Check that the version is still up to date.
    if (
      file.version !==
      (await fetchPersistentVersion(qualifiedPath, { workspace }))
    ) {
      file.data = undefined;
    }
  }

  if (file.data === undefined || useCache === false || forceNoCache) {
    const { value, version } = await fetchPersistent(qualifiedPath, {
      workspace,
      doSerialize: true,
    });
    file.data = value;
    file.version = version;
  }

  if (file.data === undefined && allowFetch && sources.length > 0) {
    let data = await fetchSources(sources, { workspace });
    if (decode) {
      data = new TextDecoder(decode).decode(data);
    }
    if (!ephemeral && file.data !== undefined) {
      // Update persistent cache.
      await write(path, data, { ...options, doSerialize: true });
    }
    file.data = data;
  }
  if (file.data !== undefined) {
    if (file.data.then) {
      // Resolve any outstanding promises.
      file.data = await file.data;
    }
  }
  return file.data;
};

const readOrWatch = async (path, options = {}) => {
  const data = await read(path, options);
  if (data !== undefined) {
    return data;
  }
  let resolveWatch;
  const watch = new Promise((resolve) => {
    resolveWatch = resolve;
  });
  const watcher = await watchFile(path, options.workspace, (file) =>
    resolveWatch(path)
  );
  await watch;
  await unwatchFile(path, options.workspace, watcher);
  return read(path, options);
};

/* global self */

let handleAskUser;

const askUser = async (identifier, options) => {
  if (handleAskUser) {
    return handleAskUser(identifier, options);
  } else {
    return { identifier, value: '', type: 'string' };
  }
};

const ask = async (identifier, options = {}) => {
  if (isWebWorker) {
    return addPending(self.ask({ op: 'ask', identifier, options }));
  }

  return askUser(identifier, options);
};

const setHandleAskUser = (handler) => {
  handleAskUser = handler;
};

const tasks = [];

// Add task to complete before using system.
// Note: These are expected to be idempotent.
const onBoot = (op) => {
  tasks.push(op);
};

const UNBOOTED = 'unbooted';
const BOOTING = 'booting';
const BOOTED = 'booted';

let status = UNBOOTED;

const pending$1 = [];

// Execute tasks to complete before using system.
const boot = async () => {
  // No need to wait.
  if (status === BOOTED) {
    return;
  }
  if (status === BOOTING) {
    // Wait for the system to boot.
    return new Promise((resolve, reject) => {
      pending$1.push(resolve);
    });
  }
  // Initiate boot.
  status = BOOTING;
  for (const task of tasks) {
    await task();
  }
  // Complete boot.
  status = BOOTED;
  // Release the pending clients.
  while (pending$1.length > 0) {
    pending$1.pop()();
  }
};

const sourceLocations = [];

const getSourceLocation = () =>
  sourceLocations[sourceLocations.length - 1];

const emitGroup = [];

let startTime = new Date();

const elapsed = () => new Date() - startTime;

const clearEmitted = () => {
  startTime = new Date();
  sourceLocations.splice(0);
};

const saveEmitGroup = () => {
  const savedSourceLocations = [...sourceLocations];
  sourceLocations.splice(0);

  const savedEmitGroup = [...emitGroup];
  emitGroup.splice(0);

  return { savedSourceLocations, savedEmitGroup };
};

const restoreEmitGroup = ({ savedSourceLocations, savedEmitGroup }) => {
  sourceLocations.splice(0, sourceLocations.length, ...savedSourceLocations);
  emitGroup.splice(0, emitGroup.length, ...savedEmitGroup);
};

const onEmitHandlers = new Set();

const emit = (value) => {
  if (value.sourceLocation === undefined) {
    value.sourceLocation = getSourceLocation();
  }
  console.log(JSON.stringify(value));
  emitGroup.push(value);
};

const addOnEmitHandler = (handler) => {
  onEmitHandlers.add(handler);
  return handler;
};

const beginEmitGroup = (sourceLocation) => {
  if (emitGroup.length !== 0) {
    throw Error('emitGroup not empty');
  }
  sourceLocations.push(sourceLocation);
  emit({ beginSourceLocation: sourceLocation });
};

const flushEmitGroup = () => {
  for (const onEmitHandler of onEmitHandlers) {
    onEmitHandler([...emitGroup]);
  }
  emitGroup.splice(0);
};

const finishEmitGroup = (sourceLocation) => {
  if (sourceLocations.length === 0) {
    throw Error(`Expected current sourceLocation but there was none.`);
  }
  const endSourceLocation = getSourceLocation();
  if (
    sourceLocation.path !== endSourceLocation.path ||
    sourceLocation.id !== endSourceLocation.id
  ) {
    throw Error(
      `Expected sourceLocation ${JSON.stringify(
        sourceLocation
      )} but found ${JSON.stringify(endSourceLocation)}`
    );
  }
  emit({ endSourceLocation });
  sourceLocations.pop();
  flushEmitGroup();
};

const removeOnEmitHandler = (handler) => onEmitHandlers.delete(handler);

const { promises: promises$1 } = fs;

const getFileLister = async ({ workspace }) => {
  if (isNode$1) {
    // FIX: Put this through getFile, also.
    return async () => {
      const qualifiedPaths = new Set();
      const walk = async (path) => {
        for (const file of await promises$1.readdir(path)) {
          if (file.startsWith('.') || file === 'node_modules') {
            continue;
          }
          const subpath = `${path}${file}`;
          const stats = await promises$1.stat(subpath);
          if (stats.isDirectory()) {
            await walk(`${subpath}/`);
          } else {
            qualifiedPaths.add(subpath);
          }
        }
      };
      await walk('jsxcad/');
      listFiles$1(qualifiedPaths);
      return qualifiedPaths;
    };
  } else if (isBrowser || isWebWorker) {
    // FIX: Make localstorage optional.
    return async () => {
      const qualifiedPaths = new Set(
        await db(`jsxcad/${workspace}/source`).keys(),
        await db(`jsxcad/${workspace}/config`).keys(),
        await db(`jsxcad/${workspace}/control`).keys()
      );
      listFiles$1(qualifiedPaths);
      return qualifiedPaths;
    };
  } else {
    throw Error('Did not detect node, browser, or webworker');
  }
};

const getKeys = async ({ workspace }) => (await getFileLister({ workspace }))();

const listFiles = async ({ workspace } = {}) => {
  if (workspace === undefined) {
    workspace = getFilesystem();
  }
  const prefix = qualifyPath('', workspace);
  const keys = await getKeys({ workspace });
  const files = [];
  for (const key of keys) {
    if (key && key.startsWith(prefix)) {
      files.push(key.substring(prefix.length));
    }
  }
  return files;
};

let activeServiceLimit = 5;
let idleServiceLimit = 5;
const activeServices = new Set();
const idleServices = [];
const pending = [];
const watchers = new Set();

// TODO: Consider different specifications.

const notifyWatchers = () => {
  for (const watcher of watchers) {
    watcher();
  }
};

const acquireService = async (spec, context) => {
  if (idleServices.length > 0) {
    logInfo('sys/servicePool', 'Recycle worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Recycle an existing worker.
    // FIX: We might have multiple paths to consider in the future.
    // For now, just assume that the path is correct.
    const service = idleServices.pop();
    activeServices.add(service);
    if (service.released) {
      throw Error('die');
    }
    service.context = context;
    notifyWatchers();
    return service;
  } else if (activeServices.size < activeServiceLimit) {
    logInfo('sys/servicePool', 'Allocate worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Create a new service.
    const service = createService({ ...spec, release: releaseService });
    activeServices.add(service);
    if (service.released) {
      throw Error('die');
    }
    service.context = context;
    notifyWatchers();
    return service;
  } else {
    logInfo('sys/servicePool', 'Wait for worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Wait for a service to become available.
    return new Promise((resolve, reject) =>
      pending.push({ spec, resolve, context })
    );
  }
};

const releaseService = (spec, service, terminate = false) => {
  logInfo('sys/servicePool', 'Release worker');
  logInfo(
    'sys/servicePool/counts',
    `Active service count: ${activeServices.size}`
  );
  service.poolReleased = true;
  activeServices.delete(service);
  const worker = service.releaseWorker();
  if (worker) {
    if (terminate || idleServices.length >= idleServiceLimit) {
      worker.terminate();
    } else {
      idleServices.push(
        createService({ ...spec, release: releaseService }, worker)
      );
    }
  }
  if (pending.length > 0 && activeServices.size < activeServiceLimit) {
    const { spec, resolve, context } = pending.shift();
    resolve(acquireService(spec, context));
  }
  notifyWatchers();
};

const getServicePoolInfo = () => ({
  activeServices: [...activeServices],
  activeServiceCount: activeServices.size,
  activeServiceLimit,
  idleServices: [...idleServices],
  idleServiceLimit,
  idleServiceCount: idleServices.length,
  pendingCount: pending.length,
});

const getActiveServices = (contextFilter = (context) => true) => {
  const filteredServices = [];
  for (const service of activeServices) {
    const { context } = service;
    if (contextFilter(context)) {
      filteredServices.push(service);
    }
  }
  return filteredServices;
};

const terminateActiveServices = (contextFilter = (context) => true) => {
  for (const { terminate, context } of activeServices) {
    if (contextFilter(context)) {
      terminate();
    }
  }
};

const askService = (spec, question, transfer, context) => {
  let terminated;
  let doTerminate = () => {
    terminated = true;
  };
  const terminate = () => doTerminate();
  const flow = async () => {
    let service;
    try {
      service = await acquireService(spec, context);
      if (service.released) {
        return Promise.reject(Error('Terminated'));
      }
      doTerminate = () => {
        service.terminate();
        return Promise.reject(Error('Terminated'));
      };
      if (terminated) {
        return terminate();
      }
      const answer = await service.ask(question, transfer);
      return answer;
    } catch (error) {
      throw error;
    } finally {
      if (service) {
        await service.waitToFinish();
        service.finished = true;
        service.release();
      }
    }
  };
  const answer = flow();
  // Avoid a race in which the service might be terminated before
  // acquireService returns.
  return { answer, terminate };
};

const askServices = async (question) => {
  for (const { ask } of [...idleServices, ...activeServices]) {
    await ask(question);
  }
};

const tellServices = (statement) => {
  for (const { tell } of [...idleServices, ...activeServices]) {
    tell(statement);
  }
};

const waitServices = () => {
  return new Promise((resolve, reject) => {
    let watcher;
    watcher = () => {
      unwatchServices(watcher);
      resolve();
    };
    watchServices(watcher);
  });
};

const watchServices = (watcher) => {
  watchers.add(watcher);
  return watcher;
};

const unwatchServices = (watcher) => {
  watchers.delete(watcher);
  return watcher;
};

const { promises } = fs;

const getPersistentFileDeleter = () => {
  if (isNode$1) {
    return async (qualifiedPath) => {
      return promises.unlink(qualifiedPath);
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath) => {
      await db(qualifiedPath).removeItem(qualifiedPath);
    };
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const persistentFileDeleter = getPersistentFileDeleter();

const remove = async (path, { workspace } = {}) => {
  await persistentFileDeleter(qualifyPath(path, workspace));
  await notifyFileDeletion(path, workspace);
};

const sleep = (ms = 0) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
let nanoid = (size = 21) => {
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

const generateUniqueId = () => nanoid();

export { ErrorWouldBlock, addOnEmitHandler, addPending, ask, askService, askServices, beginEmitGroup, boot, clearCacheDb, clearEmitted, clearTimes, computeHash, createConversation, createService, elapsed, emit, endTime, finishEmitGroup, flushEmitGroup, generateUniqueId, getActiveServices, getConfig, getControlValue, getFilesystem, getPendingErrorHandler, getServicePoolInfo, getSourceLocation, getTimes, getWorkspace, isBrowser, isNode$1 as isNode, isWebWorker, listFiles, log, logError, logInfo, onBoot, qualifyPath, read, readNonblocking, readOrWatch, remove, removeOnEmitHandler, reportTimes, resolvePending, restoreEmitGroup, saveEmitGroup, setConfig, setControlValue, setHandleAskUser, setPendingErrorHandler, setupFilesystem, setupWorkspace, sleep, startTime$1 as startTime, tellServices, terminateActiveServices, unwatchFile, unwatchFileCreation, unwatchFileDeletion, unwatchLog, unwatchServices, waitServices, watchFile, watchFileCreation, watchFileDeletion, watchLog, watchServices, write, writeNonblocking };
