// @ts-check
const core = require("@actions/core");
const github = require("@actions/github");
const { WebClient } = require("@slack/web-api");

run();

async function run() {
  try {
    const githubUsername = core.getInput("github-username");
    const githubToken = core.getInput("github-token");
    const slackToken = core.getInput("slack-token");

    const slackUserId = await lookupSlackUserByGitHubUsername(
      githubUsername,
      githubToken,
      slackToken
    );
    core.setOutput("slack-user-id", slackUserId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function lookupSlackUserByGitHubUsername(
  githubUsername,
  githubToken,
  slackToken
) {
  const octokit = github.getOctokit(githubToken);

  const email = await core.group("Fetch GitHub user info", async () => {
    core.debug(`Looking up email for GitHub user: ${githubUsername}`);

    const {
      data: { email },
    } = await octokit.rest.users.getByUsername({
      username: githubUsername,
    });

    if (!email) {
      throw new Error(
        `No public email found for GitHub user: ${githubUsername}`
      );
    }

    core.debug(`Found email for GitHub user: ${email}`);

    return email;
  });

  return await core.group("Fetch Slack user info", async () => {
    const web = new WebClient(slackToken);

    core.debug(`Looking up Slack user by email: ${email}`);

    const { user: slackUser } = await web.users.lookupByEmail({ email: email });

    if (!slackUser) {
      throw new Error(`No Slack user found with email: ${email}`);
    }

    core.debug(`Found Slack user: ${slackUser.id}`);

    return slackUser.id;
  });
}