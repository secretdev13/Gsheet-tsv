# Google Sheet to tsv
Convert Google Sheets to TSV using Google Apps Script, commit & push to the repository on GitHub, and create a pull request. Also, the flow follows GitHub Flow and creates a new branch before commit & push. As a result, i18n (multilingual) support can be managed with Google Sheets and easily reflected in the repository on GitHub.

# Usage
- Issue a GitHub access token (recommended to minimize permissions)
- Create files you want to manage with TSV in Google Sheets
- Open the Apps Script editor in the created Google Sheets
- Paste the code from gsheetToTsv.jp
- Execute the setup function only once using the issued GitHub access token
- Comment out the setup function
- Set the required parameters in code
  - repoOwner
  - repoName
  - fileName (without extension)
  - filePath
- save the edited code
- set the trigger
  - Function to run: onOpen
  - Select Event Source: From Spreadsheet
  - Select event type: At startup
  - Error Notification Settings: Any
- Reopen the created Google Sheets
- Run `Custom Menu` from added to menu `Convert to TSV and push to GitHub`