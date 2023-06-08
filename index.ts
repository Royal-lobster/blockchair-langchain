import "dotenv/config";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { blockchairTool } from "./blockchair";
import { CustomRequestGetTool } from "./customRequestTool";

const main = async () => {
  const model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
 
  const tools = [await blockchairTool({ model }), new CustomRequestGetTool()]

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

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
