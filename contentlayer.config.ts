import { defineDocumentType, defineNestedType, makeSource } from 'contentlayer/source-files'

export const STEP_STATUS = ['upcoming', 'current', 'complete'] as const;
export const FUNDING_TOKEN = ['USDC', 'ETH'] as const;

const Content = defineDocumentType(() => ({
  name: 'Content',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the project',
      required: true,
    },
    symbol: {
      type: 'string',
      description: 'The symbol of the token',
      required: true,
    },
    logo: {
      type: 'string',
      description: 'The logo of the token',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
    thumbnail: {
      type: 'string',
      description: 'The thumbnail of the project',
      required: true,
    },
    description: {
      type: 'string',
      description: 'Description of the project',
      required: true,
    },
    hasEnded: {
      type: 'boolean',
      description: 'An indicator on whether the website should put this in the upcoming launch, or the past launch',
      required: true,
    },
    contract: {
      type: 'string',
      description: 'The contract address of this project funding pool',
      required: true,
    },
    whitelistMode: {
      type: 'boolean',
      description: 'Related how the phases would rended in the browser',
      default: false,
      required: true,
    },
    raise: {
      type: 'json',
      required: true
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/launchpad/${doc._raw.flattenedPath}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'contents',
  documentTypes: [Content],
})
