import "dotenv/config";
import { BaseLanguageModel } from "langchain/base_language";
import { VectorDBQAChain } from "langchain/chains";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChainTool } from "langchain/tools";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

interface BlockchairToolProps {
  model: BaseLanguageModel;
}

export const blockchairTool = async ({ model }: BlockchairToolProps) => {
  const loader = new TextLoader("./input.md");
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 4000 });
  const docs = await loader.loadAndSplit(textSplitter);
  const embeddings = new OpenAIEmbeddings();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const chain = VectorDBQAChain.fromLLM(model, store);

  return new ChainTool({
    name: "crypto-data-provider",
    description:
      "use this tool to query blockchain data such as transactions, blocks, wallets etc. it can be used to answer questions about any transactions and for many different blockchains. PASS THE QUESTION DIRECTLY TO THIS TOOL. NO NEED FOR MODIFICATION.",
    chain: chain,
  });
};
