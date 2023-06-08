import axios from "axios"

const main = async () => {
    const {data} = await axios.get("https://api.blockchair.com/ethereum/dashboards/transaction/0x2ee0435d9938a3f3953ba169f464ea38558806e0101afd96549ec090e8fcd075?erc_20=true&effects=true")

     // if any nested array or object have more than 50 elements, remove that key from data
     const recurse = (obj: any) => {
        if(!obj) return;
        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key]) && obj[key].length > 50) {
            delete obj[key];
          } else if (typeof obj[key] === "object") {
            recurse(obj[key]);
          }
        });
      }
      recurse(data);
  
      console.log(JSON.stringify(data, null, 2))
}

main()