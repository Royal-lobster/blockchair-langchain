import { Tool } from "langchain/tools";
import axios from "axios";
import chalk from "chalk";

const etherscanBaseUrl = "https://api.etherscan.io/api";

export class EtherscanTransactionDetails extends Tool {
  name = "etherscan-transaction-details";
  description =
    "Use this tool if you want to get the transaction details of a transaction hash";

  async _call(txhash: string): Promise<string> {
    const { data } = await axios.get(
      makeUrl(etherscanBaseUrl, {
        method: "proxy",
        action: "eth_getTransactionByHash",
        txhash,
      })
    );

    if (data.status == 0) {
      return `The transaction hash ${txhash} is not valid.`;
    }

    const transaction = data.result;

    return `The result for transaction hash ${txhash} is: \n ${JSON.stringify(
      transaction,
      null,
      2
    )} \n convert hex units to decimal and format it in clean sentence before giving output to user.`;
  }
}

export class EtherscanContractDetails extends Tool {
  name = "etherscan-contract-details";
  description =
    "use this tool if you want to get details about a contract and token details.";

  async _call(input: string): Promise<string> {
    return ""
  }
}

/*============= UTILITY FUNCTIONS ===============*/

const makeUrl = (baseURL: string, params: Record<string, string>) => {
  const url = new URL(baseURL);
  const searchParams = { apikey: process.env.ETHERSCAN_API_KEY!, ...params };
  url.search = new URLSearchParams(searchParams).toString();
  console.log(chalk.bgYellow("REQUEST TO:") + chalk.cyan(` ${url.toString()}`));
  return url.toString();
};
