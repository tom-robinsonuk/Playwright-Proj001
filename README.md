# Playwright practice 

### Example Execution
.\tests\basicTest.js

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