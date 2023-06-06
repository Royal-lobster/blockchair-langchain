import { Tool } from "langchain/tools";
import axios from "axios";
import chalk from "chalk";

export class EtherscanTransactionDetails extends Tool {
  name = "etherscan-transaction-details";
  description =
    "Use this tool if you want to get the transaction details of a transaction hash";

  async _call(input: string): Promise<string> {
    const { data } = await axios.get(makeUrl({action: "eth_getTransactionByHash", txhash: input}))
    

    console.log(data);

    if (data.status == 0) {
      return `The transaction hash ${input} is not valid.`;
    }

    const transaction = data.result;

    return `The result for transaction hash ${input} is: \n ${JSON.stringify(
      transaction,
      null,
      2
    )} \n convert hex units to decimal and format it in clean sentence before giving output to user.`;
  }
}

/*============= UTILITY FUNCTIONS ===============*/

const makeUrl = (params: Record<string, string>) => {
  const url = new URL("https://api.etherscan.io/api");
  const searchParams = {...params, module: "proxy", apikey: process.env.ETHERSCAN_API_KEY!}
  url.search = new URLSearchParams(searchParams).toString();
  console.log(chalk.bgYellow("REQUEST TO:") + chalk.cyan(` ${url.toString()}`))
  return url.toString();
};
