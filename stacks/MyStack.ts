import {
  Api,
  Auth,
  Config,
  EventBus,
  StackContext,
  Table,
} from "sst/constructs";

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus");
  const spotifyClientId = new Config.Secret(stack, "SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = new Config.Secret(stack, "SPOTIFY_CLIENT_SECRET");
  const table = new Table(stack, "table", {
    fields: {
      pk: "string",
      sk: "string",
      gsi1pk: "string",
      gsi1sk: "string",
      gsi2pk: "string",
      gsi2sk: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
      sortKey: "sk",
    },
    globalIndexes: {
      gsi1: {
        partitionKey: "gsi1pk",
        sortKey: "gsi1sk",
      },
      gsi2: {
        partitionKey: "gsi2pk",
        sortKey: "gsi2sk",
      },
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [bus, table, spotifyClientId, spotifyClientSecret],
      },
    },
    routes: {
      "POST /user/playlists":
        "packages/functions/src/apiRoutes.getAllUserPlaylists",
    },
  });

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/authentication.handler",
      bind: [bus, table, spotifyClientId, spotifyClientSecret],
    },
  });
  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    Bus: bus.eventBusArn,
  });
}
