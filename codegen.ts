import { CodegenConfig } from "@graphql-codegen/cli";
import { urls } from "./shared/config/urls";
import { DEFAULT_CHAIN_ID } from "./shared/types/chain.types";

// NOTE: Read https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
const config: CodegenConfig = {
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./shared/gql/types/nft/": {
      schema: urls[DEFAULT_CHAIN_ID].NFT_GRAPH_URL,
      documents: ["./shared/gql/queries/nft.ts"],
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
