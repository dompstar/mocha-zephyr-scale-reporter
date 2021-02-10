var mocha = require('mocha')
var fs = require("fs");
var path = require("path");

module.exports = MochaZephyrReporter;

function setTestCaseKey(test) {
    var regexAllTags = /@TestCaseKey+=([A-Za-z0-9\-]+)/

    let result = test

    var foundTags = test.title.match(regexAllTags);

    if (foundTags && foundTags.length > 0) {
        const testCaseKey = foundTags[1]
        let title = test.title.replace(foundTags[0], "").trim();

        return {
            source: title,
            result: test.result,
            testCase: { key: testCaseKey }
        }
    }
    return null
}

function writeToJson(data) {
    fs.writeFileSync('./zephyr-report.json', JSON.stringify(data))
}


function MochaZephyrReporter(runner, options) {

    mocha.reporters.Base.call(this, runner);

    var cases = []

    const createZephyrEntry = (test, result) => {

        let testJson = {
            title: test.title,
            result: result
        }

        return setTestCaseKey(testJson)
    }

    runner.on('pass', (test) => {
        cases.push(createZephyrEntry(test, 'Passed'))
    })

    runner.on('pending', (test) => {
        cases.push(createZephyrEntry(test, 'Pending'))
    })

    runner.on('fail', (test) => {
        cases.push(createZephyrEntry(test, 'Failed'))
    })



    runner.on('end', () => {
        writeToJson({ version: 1, executions: cases.filter(x => x !== null) })
    })
}