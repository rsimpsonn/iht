const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Used when generating any kind of Access Token
const twilioAccountSid = "ACa82c7105a4024906a936f1d2ee5fa847";
const twilioApiKey = "SKdc27ef8845e1844dd490f1110542f4de";
const twilioApiSecret = "AVcznW7ALzmeAIOJsxmJP1odN65fu9Ub";

export function generateToken(identity, room) {
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret
  );
  token.identity = identity;

  const videoGrant = new VideoGrant({
    room: room
  });

  token.addGrant(videoGrant);

  return token.toJwt();
}
