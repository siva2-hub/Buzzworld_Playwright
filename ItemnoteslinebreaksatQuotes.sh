
#!/bin/bash

# Define the test file and the specific test name
TEST_FILE="IIDM_Sprint_61.spec.js"
TEST_NAME="Item notes line breaks at Quotes"

echo "Running Playwright test: $TEST_NAME"
npx playwright test $TEST_FILE --grep "$TEST_NAME"
