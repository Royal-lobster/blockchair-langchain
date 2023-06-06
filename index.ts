import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { EtherscanTool } from "./etherscanTool";
import 'dotenv/config'

const model = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "gpt-3.5-turbo",
});

async function main() {
  const tools = [
    new EtherscanTool(),
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
    maxIterations: 10,
  });

  const result = await executor.call({
    input:
      "What is best color to paint a house?",
  });

  console.log(`🗿 Output: ${result.output}`);
}

main();
