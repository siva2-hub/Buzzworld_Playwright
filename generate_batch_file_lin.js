const fs = require('fs');
const path = require('path');

// Define the test file and the specific test name
const testFile = 'IIDM_Sprint_61.spec.js'; // Replace with your test file
const testName = 'Item notes line breaks at Quotes'; // Replace with the name of the test you want to run

// Define the content of the batch file
// Define the content of the shell script
const scriptContent = `
#!/bin/bash

# Define the test file and the specific test name
TEST_FILE="${testFile}"
TEST_NAME="${testName}"

echo "Running Playwright test: $TEST_NAME"
npx playwright test $TEST_FILE --grep "$TEST_NAME"
`;
// Define the path for the shell script
const scriptFilePath = path.join(__dirname, testName.replace(/\s+/g, '')+'.sh');
// Write the shell script
fs.writeFile(scriptFilePath, scriptContent, (err) => {
    if (err) {
        console.error('Error creating shell script:', err);
    } else {
        console.log('Shell script created successfully at', scriptFilePath);
    }
});