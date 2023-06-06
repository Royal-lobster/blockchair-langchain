import { loadQARefineChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import "dotenv/config"

const main = async () => {
  // Create the models and chain
  const embeddings = new OpenAIEmbeddings();
  const model = new OpenAI({ temperature: 0 });
  const chain = loadQARefineChain(model);

  // Load the documents and create the vector store
  const loader = new PDFLoader("./input.pdf", {
    splitPages: false,
  });
  const docs = await loader.load();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // Select the relevant documents
  const question = "Create a query that returns last 5 transactions on ethereum chain and list the involving wallet addresses";
  const relevantDocs = await store.similaritySearch(question);

  // Call the chain
  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  console.log(res);
};

main();
