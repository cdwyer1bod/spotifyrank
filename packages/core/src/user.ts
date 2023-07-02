import DynamoDB from "aws-sdk/clients/dynamodb";
import { randomUUID } from "crypto";
import { Entity, EntityItem } from "electrodb";
import { Table } from "sst/node/table";
import { Spotify } from "./spotify";
import { Config } from "sst/node/config";

export * as User from "./user";

const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "sptRank",
    },
    attributes: {
      userID: {
        type: "string",
        required: true,
      },
      spotifyID: {
        type: "string",
        required: true,
      },
      refreshToken: {
        type: "string",
        required: true,
      },
      accessToken: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      bySpotifyID: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["spotifyID"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
    },
  },
  {
    client: new DynamoDB.DocumentClient(),
    table: Table.table.tableName,
  }
);


export type User = EntityItem<typeof UserEntity>;

export async function getByUserId(userID: string): Promise<User> {
  const user = (
    await UserEntity.get({
      userID,
    }).go()
  ).data;
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getBySpotifyId(spotifyID: string): Promise<User[]> {
  return (
    await UserEntity.query
      .bySpotifyID({
        spotifyID,
      })
      .go()
  ).data;
}

export async function login(input: Spotify.Credentials): Promise<User> {
  const client = await Spotify.client(input);
  const existing = await getBySpotifyId(client.user.id);
  let loggedInUser: User;
  if (existing.length === 0) {
    loggedInUser = (
      await UserEntity.create({
        userID: randomUUID(),
        spotifyID: client.user.id,
        refreshToken: input.refresh,
        accessToken: input.access,
      }).go()
    ).data;
  } else {
    await UserEntity.update({
      userID: existing[0].userID,
    })
      .set({
        refreshToken: input.refresh,
        accessToken: input.access,
      })
      .go();
    loggedInUser = await getByUserId(existing[0].userID);
  }
  console.log("Logged in the user with ID", loggedInUser.userID);
  return loggedInUser;
}
