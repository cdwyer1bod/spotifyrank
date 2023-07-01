import { User } from "@spotifyRank/core/user";
import { Issuer } from "openid-client";
import { AuthHandler, OauthAdapter } from "sst/node/auth";
import { Config } from "sst/node/config";

export const handler = AuthHandler({
  providers: {
    spotify: OauthAdapter({
      clientID: Config.SPOTIFY_CLIENT_ID,
      clientSecret: Config.SPOTIFY_CLIENT_SECRET,
      scope:
        "user-top-read playlist-modify-public playlist-modify-private playlist-read-private user-modify-playback-state user-read-playback-state",
      issuer: new Issuer({
        issuer: "https://accounts.spotify.com",
        authorization_endpoint: "https://accounts.spotify.com/authorize",
        token_endpoint: "https://accounts.spotify.com/api/token",
      }),
      onSuccess: async (result) => {
        const user = User.login({
          access: result.access_token!,
          refresh: result.refresh_token!,
        });
        console.log("User logged in");
        console.log(user);
        return {
          statusCode: 200,
          body: JSON.stringify(user),
        };
      },
    }),
  },
});

//https://2ywjofpb8d.execute-api.ap-southeast-2.amazonaws.com/auth/spotify/authorize
