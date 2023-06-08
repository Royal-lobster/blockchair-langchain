import { VectorDBQAChain, loadQARefineChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {ChainTool, RequestsGetTool} from "langchain/tools";
import {initializeAgentExecutorWithOptions} from "langchain/agents";

const main = async () => {
  // Create the models
  const embeddings = new OpenAIEmbeddings();
  const model = new OpenAI({temperature: 0, modelName: "gpt-4"});
  console.log("Loaded models");

  // Load the documents and create the vector store
  const loader = new TextLoader("./input.md");
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 4000 });
  const docs = await loader.loadAndSplit(textSplitter);
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const chain = VectorDBQAChain.fromLLM(model, store);
  console.log("Loaded documents")


  // Setup agent 
  const tools = [
    new ChainTool({
      name: "crypto-data-provider",
      description:
        "use this tool to query blockchain data such as transactions, blocks, wallets etc. it can be used to answer questions about any transactions and for many different blockchains. PASS THE QUESTION DIRECTLY TO THIS TOOL. NO NEED FOR MODIFICATION.",
      chain: chain,
    }),
    new RequestsGetTool()
  ];
  
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  // Run the agent
  const response = await executor.call({
    input: `Is this a transaction 0x2ee0435d9938a3f3953ba169f464ea38558806e0101afd96549ec090e8fcd075 batched multiple token transfers ? if so show all the tokens transferred by breaking down each transfer to show what tokens went to whom and how much. and show how much the person paid in gas fees in usd ?`,
  })

  console.log({response})
};

try {
  main();
} catch (e: any) {
  console.log(e.response.data);
}
