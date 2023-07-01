import { Spotify } from "@spotifyRank/core/spotify";
import { User } from "@spotifyRank/core/user";
import { ApiHandler } from "sst/node/api";

export const getAllUserPlaylists = ApiHandler(async (_evt) => {
  const user = await User.getByUserId(_evt.userId);
  const client = await Spotify.client({
    access: user.accessToken,
    refresh: user.refreshToken,
  });
  // const test = client.tracks.get("6rqhFgbbKwnb9MLmUQDhG6")
  await client.user.player.addItem("spotify:track:3QcuZo6WLcFkqqLmDs0d95");
  await client.user.player.skip();
  // client.
  // const url = "https://api.spotify.com/v1/me/player/queue";
  // const response = await axios.get(url, {
  //   headers: {
  //     Authorization: `Bearer ${user.accessToken}`,
  //   },
  // });
  // console.log(response.data);
});
