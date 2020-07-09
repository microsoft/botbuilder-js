module.exports = async function (
    token,
    { domain = process.env.DIRECT_LINE_URL || 'https://directline.botframework.com/' } = {}
  ) {
    // TODO: We could use the "iss" in the token, as long as they are trusted.
    console.log(`Renewing Direct Line token using token "${token.substr(0, 3)}...${token.substr(-3)}"`);
  
    const tokenRes = await fetch(`${domain}/v3/directline/tokens/refresh`, {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
  
    if (tokenRes.status === 200) {
      const json = await tokenRes.json();
  
      if (json.error) {
        throw new Error(`Direct Line service responded ${JSON.stringify(json.error)} while renewing token`);
      } else {
        return json;
      }
    } else {
      throw new Error(`Direct Line service returned ${tokenRes.status} while renewing token`);
    }
  }