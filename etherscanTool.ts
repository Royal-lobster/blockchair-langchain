import { Tool } from "langchain/tools";
import axios from "axios";

export class EtherscanTool extends Tool{
    name = "etherscan";
    description = "Get the balance of an Ethereum address";
    
    async _call(input: string): Promise<string> {
        const url = `https://api.etherscan.io/api?module=account&action=balancemulti&address=${input}&tag=latest&apikey=YourApiKeyToken`;
        const {data} = await axios.get(url);
        const balances = data.result.map((result: any) => {
            return {
                address: result.account,
                balance: result.balance,
            };
        });
        return JSON.stringify(balances, null, 2);
    }
}