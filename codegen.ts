import { CodegenConfig } from "@graphql-codegen/cli";
import { urls } from "./shared/config/urls";
import { SupportedChainID } from "./shared/types/chain.types";
// import { DEFAULT_CHAIN_ID } from "./shared/types/chain.types";

const DEFAULT_CHAIN_ID = (
  process.env.NEXT_PUBLIC_CHAIN_ID === "17777" ? "17777" : "15557"
) as SupportedChainID;

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
    "./shared/gql/types/factory/": {
      schema: urls[DEFAULT_CHAIN_ID].FACTORY_GRAPH_URL,
      documents: ["./shared/gql/queries/factory.ts"],
      preset: "client",
      plugins: [],
    },
    "./shared/gql/types/launchpad/": {
      schema: urls[DEFAULT_CHAIN_ID].LAUNCHPAD_GRAPH_URL,
      documents: ["./shared/gql/queries/launchpad.ts"],
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
