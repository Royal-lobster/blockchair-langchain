import { loadQARefineChain, VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChainTool, RequestsGetTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import axios from "axios";

class CustomRequestGetTool extends RequestsGetTool {
  constructor() {
    super();
  }

  async call(input: string) {
    try {
      const { data } = await axios.get(input);

      // if any nested array or object have more than 50 elements, remove that key from data
      const recurse = (obj: any) => {
        if (!obj) return;
        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key]) && obj[key].length > 50) {
            delete obj[key];
          } else if (typeof obj[key] === "object") {
            recurse(obj[key]);
          }
        });
      };
      recurse(data);

      return JSON.stringify(data);
    } catch (e: any) {
      console.log(e);
      return "Sorry, I couldn't find any data for that request.";
    }
  }
}

const main = async () => {
  // Create the models
  const embeddings = new OpenAIEmbeddings();

  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    modelName: "gpt-4",
  });

  // Load the documents and create the vector store
  const loader = new TextLoader("./input.md");
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 4000 });
  const docs = await loader.loadAndSplit(textSplitter);
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const chain = VectorDBQAChain.fromLLM(model, store);
  console.log("Loaded documents");

  // Setup agent
  const tools = [
    new ChainTool({
      name: "crypto-data-provider",
      description:
        "use this tool to query blockchain data such as transactions, blocks, wallets etc. it can be used to answer questions about any transactions and for many different blockchains. PASS THE QUESTION DIRECTLY TO THIS TOOL. NO NEED FOR MODIFICATION.",
      chain: chain,
    }),
    new CustomRequestGetTool(),
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  // Run the agent
  const response = await executor.call({
    input: `Show all the tokens transferred in this transaction on ethereum : 0x2ee0435d9938a3f3953ba169f464ea38558806e0101afd96549ec090e8fcd075`,
  });

  console.log({ response });
};

try {
  main();
} catch (e: any) {
  console.log(e.response.data);
}
