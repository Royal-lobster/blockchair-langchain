import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { EtherscanTransactionDetails } from "./etherscanTool";
import 'dotenv/config'

const model = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "gpt-3.5-turbo",
});

async function main() {
  const tools = [
    new EtherscanTransactionDetails(),
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
    maxIterations: 10,
  });

  const result = await executor.call({
    input:
      "Tell me details about this transaction 0x877138c790a4914aeafdacaa43ffe90f119c0fc06a33005add2e9b6b706c5f0a",
  });

  console.log(`🗿 Output: ${result.output}`);
}

main();
