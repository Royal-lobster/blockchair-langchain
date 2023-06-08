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
  const model = new OpenAI({temperature: 0, modelName: "gpt-4"});
  const chain = loadQARefineChain(model);
  console.log("Loaded chain");

  // Load the documents and create the vector store
  const loader = new TextLoader("./input.md");
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await loader.loadAndSplit(textSplitter);
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  console.log("Loaded documents")

  // Select the relevant documents
  const question = "Is this a transaction 0x2ee0435d9938a3f3953ba169f464ea38558806e0101afd96549ec090e8fcd075 batched multiple token transfers ? if so break down each transfer and show how much the person paid in gas fees";
  const relevantDocs = await store.similaritySearch(question);
  console.log("Selected relevant documents")

  // Call the chain
  const res = await chain.call({
    input_documents: relevantDocs,
    question: `Only output the blockchair api url for the question. 
    nothing more or less. so the answer should be a url or list of urls separated by newlines. 
    construct urls to get related to the question. make sure to also include base url. 
    try to add arguments true as needed minimally to get least amount of data with the most amount of information 
    to answer the question. (by adding arguments to turn off certain fields)

    NOTE: Make sure to create correct url for the question by following the blockchair api documentation. 
    use /dashboard/... path if constructing url from dashboard section.

    Question: ${question}`,
  });

  console.log(res.output_text);
};

try {
  main();
} catch (e: any) {
  console.log(e.response.data);
}
