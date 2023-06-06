import { Tool } from "langchain/tools";
import axios from "axios";

export class EtherscanTransactionDetails extends Tool {
    name = "etherscan-transaction-details";
    description = "Use this tool if you want to get the transaction details of a transaction hash";

    async _call(input: string): Promise<string>{
        const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${input}&apikey=IF9GS3DP38DRQABR5KH5V7ZUZUSIJRH8BE`;
        const {data} = await axios.get(url);

        console.log(data)

        if(data.status == 0){
            return `The transaction hash ${input} is not valid.`
        }

        const transaction = data.result;

        return `The result for transaction hash ${input} is: \n ${JSON.stringify(transaction, null, 2)} \n convert hex units to decimal and format it in clean sentence before giving output to user.`
    }
}