# Playwright practice 
Essentially this is just to practice Playwright/javascript Automation with a familiar website. however for context, This is just a tool to automate a root and follow instructors in a robotic way, there will be no testing included, other than basic validate checks to ensure successful execution. This tool will automate the SL Virtual Marketplace and upload some products.
The framework is setup in a way to be dynamic making use of JSON data format for storing the unique selectors, and 'Workflow' for the scripts, leaving the testBed as just pure executor for simplicity.

The plan for the tool is to just create a simple workflow script and matching config file to automate any website with very little maintenance/refactoring. 

### Example Execution
node .\executor\basicExec.js

### Updating credentials 
1. Create a credentials.json within workflow/
2.  follow this structure:
{
    "username": "testUser",
    "password": "password1234"
}

### Extra
Json workflows will contain URLs and Selectors to keep everything clean and tidy.

## The plan:
1. Create a workflow to automate. 
2. Configure just the testbed/execution area to use any specified workflow. Each 'Page' to be controlled by workflow specific JSON Configs