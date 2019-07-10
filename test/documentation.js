/* Check documentation level */

var expect = require('chai').expect
const fs = require('fs')

describe('Check Documentation', function() {
    context('Documentation Level', function() {
        it('Is above 99%', function() {
            const rawdata = fs.readFileSync('./dist/documentation/coverage.json')
            const coverage = JSON.parse(rawdata)
            const percentageCovered = parseFloat(coverage.coverage)
            expect(percentageCovered).to.be.above(99)
        })
    })
  
})