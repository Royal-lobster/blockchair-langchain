import axios from "axios";
import { RequestsGetTool } from "langchain/tools";

export class CustomRequestGetTool extends RequestsGetTool {
    constructor() {
      super();
    }
  
    async call(input: string) {
      try {
        const { data } = await axios.get(input);
  
        // if any nested array or object have more than 50 elements, remove that key from data
        const recurse = (obj: any) => {
          if (!obj) return;
          Object.keys(obj).forEach((key) => {
            if (Array.isArray(obj[key]) && obj[key].length > 50) {
              delete obj[key];
            } else if (typeof obj[key] === "object") {
              recurse(obj[key]);
            }
          });
        };
        recurse(data);
  
        return JSON.stringify(data);
      } catch (e: any) {
        console.log(e);
        return "Sorry, I couldn't find any data for that request.";
      }
    }
  }