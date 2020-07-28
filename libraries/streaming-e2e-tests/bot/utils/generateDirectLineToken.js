const createUserId = require('./createUserId');

module.exports = async function (
  directLineSecret = process.env.DIRECT_LINE_SECRET,
  { domain = process.env.DIRECT_LINE_URL || 'https://directline.botframework.com/', userId = createUserId() } = {}
) {
  console.log(
    `Generating Direct Line token using secret "${directLineSecret.substr(0, 3)}...${directLineSecret.substr(
      -3
    )}" and user ID "${userId}"`
  );
  
  const WEBSITE_HOSTNAME = process.env.WEBSITE_HOSTNAME;
  const tokenRes = await fetch(`${domain}v3/directline/tokens/generate`, {
    body: JSON.stringify({
      user: { id: userId },
      trustedOrigins: [
        'https://compulim.github.io/',
        'https://microsoft.github.io/',
        'https://webchat-mockbot2.azurewebsites.net/',
        'http://localhost',
        `https://${WEBSITE_HOSTNAME}.azurewebsites.net/`
      ]
    }),
    headers: {
      authorization: `Bearer ${directLineSecret}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });

  if (tokenRes.status !== 200) {
    console.log(await tokenRes.text());

    throw new Error(`Direct Line service returned ${tokenRes.status} while generating new token`);
  }

  const json = await tokenRes.json();

  if ('error' in json) {
    throw new Error(`Direct Line service responded ${JSON.stringify(json.error)} while generating new token`);
  }

  const { conversationId, ...otherJSON } = json;

  return { ...otherJSON, conversationId, userId: userId };
}
