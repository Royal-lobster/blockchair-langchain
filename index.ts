import { loadQARefineChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const main = async () => {
  // Create the models and chain
  const embeddings = new OpenAIEmbeddings();
  const model = new OpenAI({temperature: 0});
  const chain = loadQARefineChain(model);

  // Load the documents and create the vector store
  const loader = new TextLoader("./input.md");
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await loader.loadAndSplit(textSplitter);

  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  // Select the relevant documents
  const question = "How to build a query to get latest transaction on ethereum ?";
  const relevantDocs = await store.similaritySearch(question);

  // Call the chain
  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  console.log(res.output_text);
};

try {
  main();
} catch (e: any) {
  console.log(e.response.data);
}
