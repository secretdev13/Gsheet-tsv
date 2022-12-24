/* First run only once and save GitHub access token in scriptProperties */
// function setup() {
//   const scriptProperties = PropertiesService.getScriptProperties();
//   scriptProperties.setProperty('GITHUB_TOKEN', '<GitHub access token>')
// }

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Custom Menu")
    .addItem(
      "Convert to TSV and push to GitHub",
      "createNewBranchPushAndCreatePullRequest"
    )
    .addToUi();
}

function createNewBranchPushAndCreatePullRequest() {
  // GitHub Personal access token
  const GITHUB_TOKEN =
    PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");

  // Specify the repository owner name, repository name, and target file path
  const repoOwner = "alfnets";
  const repoName = "gas-gsheet2tsv-github";
  const fileName = "testGasPush";
  const filePath = `src/${fileName}.tsv`;

  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetAsCSV = convertToTSV(sheet.getDataRange().getValues());

  const currentDateTime = getCurrentDateTime();

  // create a new branch
  const newBranchName = `update_${fileName}_${currentDateTime}`;
  const mainBranch = JSON.parse(
    UrlFetchApp.fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/main`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    ).getContentText()
  );

  UrlFetchApp.fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
    {
      method: "post",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      contentType: "application/json",
      payload: JSON.stringify({
        ref: `refs/heads/${newBranchName}`,
        sha: mainBranch.object.sha,
      }),
    }
  );

  // commit and push to new branch
  const commitMessage = `Update ${fileName} in ${currentDateTime}`;
  const content = JSON.parse(
    UrlFetchApp.fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    ).getContentText()
  );

  UrlFetchApp.fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      method: "put",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({
        message: commitMessage,
        content: Utilities.base64Encode(sheetAsCSV),
        branch: newBranchName,
        sha: content.sha,
      }),
    }
  );

  // create pull request
  const pullRequestTitle = `Update ${fileName}`;
  const pullRequestBody = `Please review the changes made to the ${fileName} sheet.`;
  UrlFetchApp.fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
    {
      method: "post",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      contentType: "application/json",
      payload: JSON.stringify({
        title: pullRequestTitle,
        body: pullRequestBody,
        head: newBranchName,
        base: "main",
      }),
    }
  );
}

function convertToTSV(values) {
  return values
    .map((row) =>
      row
        .map((cell) => {
          if (typeof cell === "boolean") {
            return cell ? "TRUE" : "FALSE";
          }
          return cell;
        })
        .join("\t")
    )
    .join("\n");
}

function getCurrentDateTime() {
  return new Date()
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    .split(/[/ :]/)
    .join("");
}
