const fs = require('fs');
const path = require('path');

// Define the test file and the specific test name
const testFile = 'IIDM_Sprint_61.spec.js'; // Replace with your test file
const testName = 'Item notes line breaks at Quotes'; // Replace with the name of the test you want to run

// Define the content of the batch file
const batchContent = `
@echo off
echo Running Playwright test: ${testName}
npx playwright test ${testFile} --grep "${testName}"
pause
`;

// Define the path for the batch file
const batchFilePath = path.join(__dirname, testName.replace(/\s+/g, '')+'.bat');

// Write the batch file
fs.writeFile(batchFilePath, batchContent, (err) => {
  if (err) {
    console.error('Error creating batch file:', err);
  } else {
    console.log('Batch file created successfully at', batchFilePath);
  }
});
