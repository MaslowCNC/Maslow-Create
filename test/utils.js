/* Test the global variables module */

var expect = require('chai').expect

import {distance, randomColor, randomIntFromRange} from '../src/utils.js'

describe('Test Utility Functions', function() {
    context('Distance Between Points', function() {
        it('On Y Axis', function() {
            expect(distance(0,0,0,1)).to.be.equal(1)
        })
        it('On X Axis', function() {
            expect(distance(0,0,1,0)).to.be.equal(1)
        })
        it('At an angle', function() {
            expect(distance(0,0,1,1)).to.be.equal(Math.sqrt(2))
        })
        it('At an angle off origin', function() {
            expect(distance(2,2,1,3)).to.be.equal(Math.sqrt(2))
        })
    })
    context('Random Color', function() {
        it('Color Returned', function() {
            expect(randomColor(["red", "green", "blue"])).to.be.oneOf(["red", "green", "blue"])
        })
    })
    context('Random Int In Range', function() {
        it('In Range', function() {
            expect(randomIntFromRange(0,100)).to.be.within(0,100)
        })
        it('Random', function() {
            expect(randomIntFromRange(0,100000)).to.not.equal(randomIntFromRange(0,100000))
        })
    })
  
})