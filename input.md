# API DOCUMENTATION FOR BLOCKCHAIR

## Dashboard endpoints for Ethereum

### Block info

**Endpoints:**

-   `https://api.blockchair.com/{:eth_chain}/dashboards/block/{:height}`
-   `https://api.blockchair.com/{:eth_chain}/dashboards/block/{:hash}`
-   `https://api.blockchair.com/{:eth_chain}/dashboards/blocks/{:height},...,{:height}` (up to 10 blocks, comma-separated)
-   `https://api.blockchair.com/{:eth_chain}/dashboards/blocks/{:hash},...,{:hash}` (up to 10 blocks, comma-separated)

**Where:**

-   `{:eth_chain}` can only be: `ethereum` or `ethereum/testnet`
-   `{:height}` is the block height (integer value), also known as block id
-   `{:hash}` is the block hash (regex: `/^0x[0-9a-f]{64}$/i`)

**Possible options:**

-   `?limit={:limit}` limits the number of returned transaction hashes contained in the block. Default is `100`. Maximum is `10000`. In case of `0` returns an empty transaction hashes array
-   `?offset={:offset}` allows to paginate transaction hashes. Default is `0`. Maximum is `1000000`.

**Output:**

`data` contains an associative array where found block heights or block hashes used as keys:

-   `data.{:id}.block` — information about the block (see [Ethereum-like block object](https://blockchair.com/api/docs#link_105) for the field descriptions)
-   `data.{:id}.transactions` — the array of transaction hashes (sorted by position in the block ascending) included in the block (respecting the set limit and offset)
-   `data.{:id}.synthetic_transactions` — array of internal Blockchair ids of synthetic transactions. By synthetic transactions we understand state changes in the blockchain which don't have parental transaction entities, i.e. transferring miner reward (for blocks and uncles), coin generation in the genesis block, etc. This array is not iterable, and always yields the entire result set.
-   `data.{:id}.uncles` — the array of hashes of the block's uncles (in case there are no uncles — an empty array). This array is not iterable as well, and always yields the entire result set.

Where `{:id}` is either `{:height}` or `{:hash}` from the query string.

If there's no `{:id}` has been found in the database, there won't be such key.

Note that the total number of transactions in the block is contained in `data.{:id}.block.transaction_count`, but that doesn't take synthetic transactions into account (use `data.{:id}.block.synthetic_transaction_count` instead)

**Context keys:**

-   `context.results` — number of found blocks
-   `context.limit` — applied limit
-   `context.offset` — applied offset
-   `context.state` — best block height on the `{:eth_chain}` chain (tip: it's possible to calculate the number of confirmation block received using this formula: `confirmations = context.state - data.{:id}.block.id + 1`)

**Example requests:**

-   `https://api.blockchair.com/ethereum/dashboards/block/2345678`
-   `https://api.blockchair.com/ethereum/dashboards/block/0xda214d1b1d458e7ae0e626b69a52a59d19762c51a53ff64813c4d31256282fdf`
-   `context.state`: best block height on the `{:eth_chain}` chain (tip: it's possible to calculate the number of confirmation transaction received using this formula: `confirmations = data.{:id}.transaction.block_id - context.state + 1`, or if `data.{:id}.transaction.block_id` is `-1` it's an unconfirmed transaction)
-   `https://api.blockchair.com/ethereum/dashboards/block/2345678?limit=2`
-   `https://api.blockchair.com/ethereum/dashboards/block/2345678?limit=2&offset=2`

### Uncle info

**Endpoints:**

-   `https://api.blockchair.com/{:eth_chain}/dashboards/uncle/{:hash}`
-   `https://api.blockchair.com/{:eth_chain}/dashboards/uncle/{:hash},...,{:hash}` (up to 10 uncles, comma-separated)

**Where:**

-   `{:eth_chain}` can only be: `ethereum` or `ethereum/testnet`
-   `{:hash}` is the uncle hash (regex: `/^0x[0-9a-f]{64}$/i`)

**Output:**

`data` contains an associative array where uncle hashes used as keys:

-   `data.{:hash}.uncle` — information about the block (see [Ethereum-like uncle object](https://blockchair.com/api/docs#link_402) for the field descriptions)

If there's no `{:hash}` has been found in the database, there won't be such key.

**Context keys:**

-   `context.results`: number of found uncles
-   `context.limit`: applied limit
-   `context.offset`: applied offset
-   `context.state`: best block height on the `{:eth_chain}` chain

**Example requests:**

-   `https://api.blockchair.com/ethereum/dashboards/uncle/0x5cd50096dbb856a6d1befa6de8f9c20decb299f375154427d90761dc0b101109`
-   `https://api.blockchair.com/ethereum/dashboards/uncles/0x5cd50096dbb856a6d1befa6de8f9c20decb299f375154427d90761dc0b101109,0xedc7a92c2a8aa140b0afa26db4ce8e05994a67d6fc3d736ddd77210b0ba565bb`

### Transaction info

**Endpoints:**

-   `https://api.blockchair.com/{:eth_chain}/dashboards/transaction/{:hash}`
-   `https://api.blockchair.com/{:eth_chain}/dashboards/transactions/{:hash},...,{:hash}` (up to 10 transactions, comma-separated)

**Where:**

-   `{:eth_chain}` can only be: `ethereum` or `ethereum/testnet`
-   `{:hash}` is the transaction hash (regex: `/^0x[0-9a-f]{64}$/i`), also known as txid

**Possible options:**

-   `?erc_20=true` shows information about ERC-20 token transfers in this transaction
-   `?effects=true` shows state changes for the transaction
-   `?trace_mempool=true` — this option tries to retrieve a list of internall calls for mempool transactions. In conjunction with `&erc_20=true` it also shows the list of ERC-20 transfers. This is an experimental feature. Please note that internal transfers may get invalidated when transaction gets confirmed.
-   `?assets_in_usd=true` — adds `value_usd_now` to all `layer_2.erc_20` items yielding the current (not at the moment of the transaction!) USD value of tokens (`null` if the price is unknown)
-   `?events=true` — this option costs `1` additional request point to use. When enabled, it adds an array of event logs to the output. Every log contains `topics`, `data`, `contract`, `log_index`, and `decoded_event`. Depending on how much our API knows about the event signature, there are 3 detalization levels for `decoded_event` (example transaction with all 3: `https://api.blockchair.com/ethereum/dashboards/transaction/0x7d52cf58fe78403e8816dae6e900baff92b35760b4ed81cecd2590eafcde3dad?events=true`):
    -   Full data: `decoded_event` contains both the full event name with its argument names (`name_full`, example: `Approval(address owner, address spender, uint256 value)`), and the argument values in the `arguments` array;
    -   Partial data: only `name_with_types` is known (example: `Withdrawal(address, uint256)`), `arguments` yields `null`;
    -   No data: `decoded_event` yields `null`.

**Output:**

`data` contains an associative array where found transaction hashes are used as keys:

-   `data.{:hash}.transaction` — information about the transaction (see [Ethereum-like transaction object](https://blockchair.com/api/docs#link_206))
-   `data.{:hash}.calls` — the array of all calls made during the execution of the transaction (always `null` for mempool transactions and the last 6 blocks)

Additional data:

-   `data.{:hash}.layer_2.erc_20` (only if `?erc_20=true` is set) — an array of ERC-20 transfers (or an empty array if there are none), Each array element contains the following keys: `token_address`, `token_name`, `token_symbol`, `token_decimals`, `sender`, `recipient`, `value` — field descriptions are available [here](https://blockchair.com/api/docs#link_506).
-   `data.{:hash}.effects` (only if `?effects=true` is set) — yields all ETH ad ERC-20 balance changes for the transaction in a neat format. Keys are `0x0000000000000000000000000000000000000000` for ETH or token address for ERC-20's. Each array element contains the following keys: `asset_type`, `asset_name`, `asset_symbol`, `asset_decimals`, `changes`. `changes` is an array containing all the changes for the asset (keys are Ethereum addresses, and values are balance changes). Please note this option is experimental. Example request: `https://api.blockchair.com/ethereum/dashboards/transaction/0xd9a24f57c713207c39c58e8ef3cb44e115fcc8bd0f85eb4ea82c78bc065a723f?effects=true&erc_20=true`. If `?erc_20=true` option is not used, `?effects=true` won't yield ERC-20 data.

In case transaction is confirmed on the blockchain, `data.{:hash}.transaction.block_id` contains the block number it's included in. If the transaction is in the mempool, `data.{:hash}.transaction.block_id` yields `-1`. If the transaction is neither present in the blockchain, nor in the mempool, there won't be `data.{:hash}` key with data.

**Context keys:**

-   `context.results` — number of found transactions
-   `context.state` — best block height on the `{:eth_chain}` chain (tip: it's possible to calculate the number of confirmation transaction received using this formula: `confirmations = data.{:id}.transaction.block_id - context.state + 1`, or if `data.{:id}.transaction.block_id` is `-1` it's an unconfirmed transaction)
-   `context.state_layer_2` — the latest block number for which our engine has processed second layer (e.g. ERC-20) transactions. If it's less than the block id in your current environment (e.g. block id of a transaction you requested), it makes sense to repeat the request after some time to retrieve second layer data

**Example requests:**

-   `https://api.blockchair.com/ethereum/dashboards/transaction/0xc132a422513e39038269e091847319a14029feb42c66bd1424c57dfc0e4f8d08`
-   `https://api.blockchair.com/ethereum/dashboards/transactions/0xc132a422513e39038269e091847319a14029feb42c66bd1424c57dfc0e4f8d08,0x502bc6fe1f39738f0fd3223a2f125433b8ec7e80acd11ef514f6909536cc9e66`
-   `https://api.blockchair.com/ethereum/dashboards/transaction/0xc132a422513e39038269e091847319a14029feb42c66bd1424c57dfc0e4f8d08?erc_20=true`
-   `https://api.blockchair.com/ethereum/dashboards/transaction/0x77025c5c7ff5eeb4bb164a4be84dd49192e12086cc321199f73888830c3ecd9e?erc_20=true&assets_in_usd=true`

**Bonus endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/dashboards/transaction/{:hash}/priority`

For mempool transactions shows priority (`position`) by `gas_price` over other transactions (`out_of` mempool transactions). `position` is `null` if the transaction is not in the mempool. `eta_seconds` returns an approximate time for the transaction to confirm (in seconds, exprimental). Cost: `1`.

**Request cost formula:**

-   `1` for `https://api.blockchair.com/{:eth_chain}/dashboards/transaction/{:hash}` endpoint
-   `1 + (0.1 * (entity count - 1))` for `https://api.blockchair.com/{:eth_chain}/dashboards/transactions/{:hash},...,{:hash}` endpoint (e.g. it's `1 + (0.1 * (10 - 1)) = 1.9` for requesting 10 transactions)
-   Using `?erc_20=true` adds `1` for each requested transaction
-   Using `?effects=true` adds `1` for each requested transaction
-   Using `?events=true` adds `1` for each requested transaction
-   Using `?trace_mempool=true` adds `1` for each requested transaction

**Endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/dashboards/address/{:address}`

**Where:**

-   `{:eth_chain}` can only be: `ethereum` or `ethereum/testnet`
-   `{:address}` is an Ethereum address (either an account or a contract, the address should start with `0x`)

**Possible options:**

-   `?limit={:call_limit}` — limits the number of returned latest calls associated with the address. Default is `100`. Maximum is `10000`.
-   `?offset={:call_offset}` — allows to paginate calls. Default is `0`, and the maximum is `1000000`.
-   `?erc_20={...}` — returns information about ERC-20 token balances of the address (tokens are sorted by market capitalization descending):
    -   `?erc_20=approximate` (or `?erc_20=true`, default) — yields all token balances from our database. These values may miss some non-standard transfers in tokens that don't follow the ERC-20 standard in full. Please double-check if this option returns correct values for the tokens you'd want to get information about. Using this option costs `1`.
    -   `?erc_20=precise` — yields all token balances from our node. The process is the following: we gather information from our database about potential ERC-20 tokens the address may hold, and then for each token we call `getBalance` function using our node to get precise balances. Please note that if for some reason some contract doesn't follow the ERC-20 standard, our database may still miss records about the address holding this token, and there will be no request to the node about this token. So while balances yielded with this option are precise, some non-standard tokens may still be missed. Using this option costs `2`.
    -   `?erc_20={:token_address},...,{:token_address}` (recommended) — yields balances for the enlisted ERC-20 tokens from our node. That's the recommended way if you have an exact list of tokens you'd like to check. Even if some token doesn't follow the ERC-20 standard, but still has `getBalance` function implemented, the correct balance will be returned. Using this option costs `0.75` + `0.01` for each contract checked (the cheapest option!)
-   `?nonce=true` — returns current account nonce (mempool transactions are taken in account)
-   `?output=type` — this option scrubs all the output data except for the address type (`account` or `contract`). This may be a very fast handy way to retrieve address type instead of requesting full address data
-   `?assets_in_usd=true` — adds `asset_balance_usd` to the output yielding the total USD value of all (excluding ETH) account assets (currently it's most popular ERC-20 tokens only), as well as `balance_usd` to all `layer_2.erc_20` items. If the exchange rate for a particular token is unknown, returns `null` for this token.
-   `?state=latest` — if this option is enabled, `balance` will yield the confirmed balance, and the `calls` array won't include unconfirmed data
-   `?contract_details=true` — if applied, it adds additional data on the address if it's a contract. At the moment, it works with ERC-20 contracts only yielding `token_name`, `token_symbol`, and `token_decimals`. It also yields some additional fields for all contracts: `creating_transaction_hash`, `creating_address`, and `creating_transaction_time`. The additional cost of using this option is `0.5`

**Output:**

In case the address has been found, `data.{:address}` returns an array consisting of the following elements:

-   `address`
    -   `address.type` — address type (`account` — for a simple address, `contract` — for a contract)
    -   `address.contract_code_hex` — hex code of the contract at the moment of creation (for a contract), or `null` for an address
    -   `address.contract_created` — for contracts only — if the contact was indeed created then `true`, if not (i.e. with a failed `create` call) — `false`, for a simple address yields `null`
    -   `address.contract_destroyed` — for contracts only — if the contact was successfully destroyed (`SELFDESCTRUCT`) then `true`, if not — `false`; for a simple address yields `null`
    -   `address.balance` — exact address balance in wei (here and below values in wei returned as strings as they don't fit into integers)
    -   `address.balance_usd` — address balance in USD (float)
    -   `address.received_approximate` — total received in wei (approximately) †
    -   `address.received_usd` — total received in USD (approximately) †
    -   `address.spent_approximate` — total spent in wei (approximately) †
    -   `address.spent_usd` — total spent in USD (approximately) †
    -   `address.fees_approximate` — total spent in transaction fees in wei (approximately) †
    -   `address.fees_usd` — total spent in transaction fees in USD (approximately) †
    -   `address.receiving_call_count` — number of calls the address has received, where value transfer occured ‡
    -   `address.spending_call_count` — number of calls that has been made by this address where value transfer occured ‡
    -   `address.call_count` — total number of calls the address participated in (may be greater than `receiving_call_count` + `spending_call_count`, because it also takes failed calls into account)
    -   `address.transaction_count` — number of transactions the address participated in
    -   `address.first_seen_receiving` — timestamp (UTC) when the address received a successful incoming call for the first time
    -   `address.last_seen_receiving` — timestamp (UTC) when the address received a successful incoming call for the last time
    -   `address.first_seen_spending` — timestamp (UTC) when the address sent a successful call for the first time
    -   `address.last_seen_spending` — timestamp (UTC) when the address sent a successful call for the last time
    -   `address.nonce` — current account nonce (only if `?nonce=true` is set, `null` otherwise)
-   `calls` — an array of the latest address call, each element of an array containing the following elements: `block_id`, `transaction_hash`, `index`, `time`, `sender`, `recipient`, `value`, `value_usd`, `transferred` (see the description [here](https://blockchair.com/api/docs#link_403))
-   `layer_2.erc_20` (only if `?erc_20=true` is set) — the array of ERC-20 token balances of the address, each element contains the following fields: `token_address`, `token_name`, `token_symbol`, `token_decimals`, `balance_approximate` (number of tokens), `balance` (exact number of tokens in the smallest denomination). Note that `balance ≈ balance_approximate * 10 ^ token_decimals`.

Additional data:

-   `data.{:hash}.layer_2.erc_20` (or an empty array if there are none), Each array element contains the following keys: `token_address`, `token_name`, `token_symbol`, `token_decimals`, `sender`, `recipient`, `value` — field descriptions are available [here](https://blockchair.com/api/docs#link_506).

`context.results` contains the number of found addresses (0 or 1).

Notes:

-   † — for these fields the wei value can be rounded. For a million of calls, the rounding error can be more than 1 ether.
-   ‡ — only those calls are counted that fit the following condition: `transferred = true`, i.e. calls that do not change state (including `staticcall`, failed calls, etc.) are not taken into account

**Context keys:**

-   `context.results` — number of found addresses
-   `context.limit` — applied limit
-   `context.offset` — applied offset
-   `context.state` — best block height on the `{:eth_chain}` chain (tip: it's possible to calculate the number of confirmation block received using this formula: `confirmations = block_id - context.state + 1`)
-   `context.state_layer_2` — the latest block number for which our engine has processed second layer (e.g. ERC-20) transactions. If it's less than the block id in your current environment (e.g. block id of a transaction you requested), it makes sense to repeat the request after some time to retrieve second layer data

**Example requests:**

-   `https://api.blockchair.com/ethereum/dashboards/address/0x3282791d6fd713f1e94f4bfd565eaa78b3a0599d`
-   `https://api.blockchair.com/ethereum/dashboards/address/0x3282791d6fd713f1e94f4bfd565eaa78b3a0599d?limit=1&offset=0`
-   `https://api.blockchair.com/ethereum/dashboards/address/0x3282791d6fd713f1e94f4bfd565eaa78b3a0599d?erc_20=true&nonce=true`

## Infinitable endpoints (SQL-like queries)

These endpoints allow you to filter, sort, and aggregate blockchain data. The output is database rows. Unlike dashboard and raw endpoints, all infinitable endpoints listed in this section can be considered as just one endpoint as it has the same options and the same output structure across different blockchains and entities. Here it is: `https://api.blockchair.com/{:table}{:query}`.

Just don't ask why do we call that `infinitables`… Infinite tables? Maybe.

**List of tables (`{:table}`) our engine supports:**

-   `{:btc_chain}/blocks`
-   `{:btc_chain}/transactions`
-   `{:btc_chain}/mempool/transactions`
-   `{:btc_chain}/outputs`
-   `{:btc_chain}/mempool/outputs`
-   `{:btc_chain}/addresses`
-   `{:eth_chain}/blocks`
-   `{:eth_chain}/uncles`
-   `{:eth_chain}/transactions`
-   `{:eth_chain}/mempool/transactions`
-   `{:eth_chain}/calls`
-   `{:xin_chain}/raw/snapshots`
-   `{:xin_chain}/raw/mintings`
-   `{:xin_chain}/raw/nodes`
-   `{:xtz_chain}/raw/blocks`
-   `bitcoin/omni/properties`
-   `ethereum/erc-20/tokens`
-   `ethereum/erc-20/transactions`

Where:

-   `{:btc_chain}` can be one of these: `bitcoin`, `bitcoin-cash`, `litecoin`, `bitcoin-sv`, `dogecoin`, `dash`, `groestlcoin`, `zcash`, `ecash`, or `bitcoin/testnet`
-   `{:eth_chain}` can be only `ethereum`
-   `{:xin_chain}` can be only `mixin`
-   `{:xtz_chain}` can be only `tezos`

Note on mempool tables: to speed up some requests, our architecture have separate tables (`{:chain}/mempool/{:entity}`) for unconfirmed transactions. Unlike with dashboard endpoints which search entities like transactions in both the blockchain and the mempool, infinitable endpoints don't do that.

The `{:query}` is optional; in case it's not included in the request, the default sorting applied to the table (for most of the tables it's descending by some id) and the 10 top results are returned.

Here are some example queries without using `{:query}`:

-   `https://api.blockchair.com/bitcoin/blocks`
-   `https://api.blockchair.com/bitcoin-cash/mempool/transactions`

Further documentation sections describe fields returned for different tables. Some of the dashboard endpoints are using the same fields as well.

**How to build a query**

The process is somewhat similar to constructing an SQL query, but there are less possibilities of course.

Here are the possible options:

-   Setting filters — the `?q=` section — allows you to set a number of filters (SQL "`WHERE`")
-   Setting sortings — the `?s=` section — allows you to sort the table (SQL "`ORDER BY` ")
-   Setting the limit — the `?limit=` section — limits the number of output results (SQL "`LIMIT`")
-   Setting the offset — the `?offset=` section — offsets the result set (SQL "`OFFSET`")
-   Aggregating data — the `?a=` sections — allows to group by some columns and calculate using function (SQL "`GROUP BY`" and functions such as `count`, `max`, etc.)
-   The table (SQL "`FROM`") is set in the `{:table}` section of the API request

The order of applying various sections is irrelevant.

A quick example: `https://api.blockchair.com/bitcoin/blocks?q=time(2019-01),guessed_miner(AntPool)&s=size(desc)&limit=1`. This request:

-   Makes a query to the `bitcoin/blocks` table
-   Filters the table by time (finds all blocks mined in January 2019) and miner (AntPool)
-   Sorts the table by block size descending
-   Limits the number of results to 1

What this example does is finding the largest block mined by AntPool in January 2019.

Another example using aggregation: `https://api.blockchair.com/bitcoin/blocks?q=time(2019-01-01..2019-01-31)&a=guessed_miner,count()&s=count()(desc)`. This request:

-   As the previous one, makes a query to the `bitcoin/blocks` table
-   Filters the table by time (in a bit different way, but it's an invariant of `time(2019-01)`)
-   Groups the table by miner, and calculating the number of rows for each miner using the `count()` function
-   Sorts the result set by the number of blocks each miner has found

**The `?q=` section (filters)**

You can use filters as follows: `?q=field(expression)[,field(expression)]...`, where `field` is the column which is going to be filtered, and `expression` is a filtering expression. These are possilble filtering expressions:

-   `equals` — equality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(0)` finds information about block 0
-   `left..` — non-strict inequality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(1..)` finds information about block 1 and above
-   `left...` — strict inequality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(1...)` finds information about block 2 and above
-   `..right` — non-strict inequality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(..1)` finds information about blocks 0 and 1
-   `...right` — strict inequality — example: `https://api.blockchair.com/ bitcoin/blocks?q=id(...1)` finds information only about block 0
-   `left..right` — non-strict inequality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(1..3)` finds information about blocks 1, 2 and 3
-   `left...right` — strict inequality — example: `https://api.blockchair.com/bitcoin/blocks?q=id(1...3)` finds information about block 2 only
-   `~like` — occurrence in a string (SQL `LIKE '%str%'` operator) — example: `https://api.blockchair.com/bitcoin/blocks?q=coinbase_data_bin(~hello)` finds all blocks which contain `hello` in `coinbase_data_bin`
-   `^like` — occurrence at the beginning of a string (SQL `LIKE 'str%'` operator, also further mentioned as the `STARTS WITH` operator) — example: `https://api.blockchair.com/bitcoin/blocks?q=coinbase_data_hex(^00)` finds all blocks for which `coinbase_data_hex` begins with `00`

For timestamp type fields, values can be specified in the following formats:

-   `YYYY-MM-DD HH:ii:ss`
-   `YYYY-MM-DD` (converted to the `YYYY-MM-DD 00:00:00..YYYY-MM-DD 23:59:59` range)
-   `YYYY-MM` (converted to the `YYYY-MM-01 00:00:00..YYYY-MM-31 23:59:59` range)

Inequalities are also supported for timestamps, the left and right values must be in the same format, e.g.: `https://api.blockchair.com/bitcoin/blocks?q=time(2009-01-03..2009-01-31)`.

Ordinarilly if there's `time` column in the table, there should also be `date`, but there won't be possible to search over the `date` column directly, but you can search by date using the `time` column as follows: `?q=time(YYYY-MM-DD)`

If the left value in an inequality is larger than the right, they switch places.

If you want to list several filters, you need to separate them using commas like this: `https://api.blockchair.com/bitcoin/blocks?q=id(500000..),coinbase_data_bin(~hello)`

We're currently testing support for `NOT` and `OR` operators (this is an alpha test feature, so we don't guarantee there won't be sudden changes):

-   The `NOT` operator is added before the expression for it to be inverted, e.g., `https://api.blockchair.com/bitcoin/blocks?q=not,id(1..)` returns the block `0`
-   The `OR` operator can be put between two expressions and takes precedence (like it's when two expressions around `OR` are wrapped in parentheses), e.g., `https://api.blockchair.com/bitcoin/blocks?q=id(1),or,id(2)` returns information about blocks 1 and 2.

Maximum guaranteed supported number of filters in one query: 5.

**The `?s=` section (sortings)**

Sorting can be used as follows: `?s=field(direction)[,field(direction)]...`, where `direction` can be either `asc` for sorting in ascending order, or `desc` for sorting in descending order.

Here's a basic example: `https://api.blockchair.com/bitcoin/blocks?s=id(asc)` — sorts blocks by id ascending

If you need to apply several sortings, you can list them separating with commas. The maximum guaranteed number of sortings is 2.

**The `?limit=` section (limit)**

Limit is used like this: `?limit=N`, where N is a natural number from 1 to 100. The default is 10. `context.limit` takes the value of the set limit. In some cases (when using some specific "increased efficiency" filters described below) `LIMIT` may be ignored, and in such cases the API returns the entire result set, and `context.limit` will be set to `NULL`.

A basic example: `https://api.blockchair.com/bitcoin/blocks?limit=1` — returns the latest block data (as the default sorting for this table is by block height descending)

Note that increasing the limit leads to an increase in the request cost (see the formula below).

**The `?offset=` section (offset)**

Offset can be used as a paginator, e.g., `?offset=10` returns the next 10 rows. `context.offset` takes the value of the set offset. The maximum value is 10000. If you need just the last page, it's easier and quicker to change the direction of the sorting to the opposite.

**Important**: while iterating through the results, it is quite likely that the number of rows in the database will increase because new blocks had found while you were paginating. To avoid that, you may, for example, add an additional condition that limits the block id to the value obtained in `context.state` in the first query.

Here's an example. Suppose we would like to receive all the latest transactions from the Bitcoin blockchain with amount more than $1M USD. The following request should be perfomed for this:

-   `https://api.blockchair.com/bitcoin/transactions?q=output_total_usd(10000000..)&s=id(desc)`

Now, the script with this request to the API for some reason did not work for a while, or a huge amount of transactions worth more than $1 million appeared. With the standard limit of 10 results, the script skipped some transactions. Then firstly we should make the same request once again:

-   `https://api.blockchair.com/bitcoin/transactions?q=output_total_usd(10000000..)&s=id(desc)`

From the response we put `context.state` in a variable `{:state}`, and further to obtain next results we apply `offset` and set a filter to "fix" the blockchain state:

-   `https://api.blockchair.com/bitcoin/transactions?q=output_total_usd(10000000..),block_id(..{:state})&s=id(desc)&offset=10`

Next we increase the offset value until getting a data set with the transaction that we already knew about.

**The `?a=` section (data aggregation)**

_Warning_: data aggregation is currently in beta stage on our platform.

To use aggregation, put the fields by which you'd like to group by (zero, one, or several), and fields (at least one) which you'd like to calculate using some aggregate function under the `?a=` section. You can also sort the results by one of the fields included in the `?a=` section (`asc` or `desc`) using the `?s=` section, and apply additional filters using the `?q=` section.

Let's start with some examples:

-   `https://api.blockchair.com/bitcoin/blocks?a=year,count()` — get the total number of Bitcoin blocks by year
-   `https://api.blockchair.com/bitcoin/transactions?a=month,median(fee_usd)` — get the median Bitcoin transaction fees by month
-   `https://api.blockchair.com/ethereum/blocks?a=miner,sum(generation)&s=sum(generation)(desc)` — get the list of Ethereum miners (except uncle miners) and sort it by the total amount of coins minted
-   `https://api.blockchair.com/bitcoin-cash/blocks?a=sum(fee_total_usd)&q=id(478559..)` — calculate how much miners have collected in fees since the fork

In case the table you're aggregating over has a `time` column, it's always possible to group by the following virtual columns:

-   `date`
-   `week` (yields `YYYY-MM-DD` corresponding to Mondays)
-   `month` (yields `YYYY-MM` )
-   `year` (yields `YYYY` )

Supported functions:

-   `avg({:field})`
-   `median({:field})`
-   `min({:field})`
-   `max({:field})`
-   `sum({:field})`
-   `count()`

There are also two special functions:

-   `price({:ticker1}_{:ticker2})`— yields the price; works only if you group by `date` (or one of: `week`, `month`, `year`). For example, it makes it possible to build a chart showing correlation between price and transaction count: `https://api.blockchair.com/bitcoin/blocks?a=month,sum(transaction_count),price(btc_usd)`. Supported tickers: `usd`, `btc`, `bch`, `eth`, `ltc`, `bsv`, `doge`, `dash`, `grs`
-   `f({:expression})` where `{:expression}` is `{:function_1}{:operator}{:function_2}`, where `{:function_1}` and `{:function_2}` are the supported functions from the above list, and `{:operator}` is one of the following: `+`, `-`, `/`, `*` (basic math operators). It's useful to calculate percentages. Example: `https://api.blockchair.com/bitcoin/blocks?a=date,f(sum(witness_count)/sum(transaction_count))&q=time(2017-08-24..)` — calculates SegWit adoption (by dividing the SegWit transaction count by the total transaction count)

There's also a special `?aq=` section which have the following format: `?aq={:i}:{:j}` — it applies `i`th filter to `j`th function (special functions don't count); after that `i`th filter has no effect on filtering the table. It's possible to have multiple conditions by separating them with a `;`. Here's an example: `https://api.blockchair.com/bitcoin/outputs?a=date,f(count()/count())&q=type(nulldata),time(2019-01)&aq=0:0` — calculates the percentage of nulldata outputs in January 2019 by day. The 0th condition (`type(nulldata)`) is applied to the 0th function (`count()`) and removed afterwards.

If you use the `?a=` section, the default limit is 10000 instead of 10.

It's possible to export aggregated data to TSV or CSV format using `&export=tsv` or `&export=csv` accordingly. Example: `https://api.blockchair.com/bitcoin/transactions?a=date,avg(fee_usd)&q=time(2019-01-01..2019-04-01)&export=tsv`. Please note that data export is only available for aggregated data. If you need to export the whole table or its part, please use [Database dumps](https://blockchair.com/dumps#database).

_Warning_: the `f({:expression})` special function, the `?aq=` section, and TSV/CSV export are currently in alpha stage on our platform. Special function `price({:ticker1}_{:ticker2})` can't be used within special function `f({:expression})`. There are some known issues when sorting if `f({:expression})` is present. There are some known issues when applying the `?aq=` section to inequality filters.

**Fun example**

The following requests return the same result:

-   `https://api.blockchair.com/bitcoin/blocks?a=sum(reward)`
-   `https://api.blockchair.com/bitcoin/transactions?a=sum(output_total)&q=is_coinbase(true)`
-   `https://api.blockchair.com/bitcoin/outputs?a=sum(value)&q=is_from_coinbase(true)`

**Export data to TSV or CSV**

Please use our Database dumps feature instead of the API (see [https://blockchair.com/dumps](https://blockchair.com/dumps) for documentation)

**Front-end visualizations**

-   Filters and sortings: [https://blockchair.com/bitcoin/blocks](https://blockchair.com/bitcoin/blocks)
-   Data aggregation: [https://blockchair.com/charts](https://blockchair.com/charts)

**Request cost formula for infinitables**

Cost is calculated by summing up the following values:

-   The base cost for the table (see the table below): `2`, `5`, or `10`
-   Applying a filter costs `1`
-   Applying a sorting costs `0`
-   Applying an offset costs `0`
-   Applying an aggregation costs `10`

Applying a limit over the default multiplies the summed cost by `1 + 0.01 * number_of_rows_over_the_default_limit`. If the defaut limit is 10 and the base cost is 2, requesting 100 rows will cost `2 * (1 + 0.01 * 90) = 3.8`.

| Table | Base cost |
| --- | --- |
| `{:btc_chain}/blocks` | `2` |
| `{:btc_chain}/transactions` | `5` |
| `{:btc_chain}/mempool/transactions` | `2` |
| `{:btc_chain}/outputs` | `10` |
| `{:btc_chain}/mempool/outputs` | `2` |
| `{:btc_chain}/addresses` | `2` |
| `{:eth_chain}/blocks` | `2` |
| `{:eth_chain}/uncles` | `2` |
| `{:eth_chain}/transactions` | `5` |
| `{:eth_chain}/mempool/transactions` | `2` |
| `{:eth_chain}/calls` | `10` |
| `{:eth_chain}/addresses` | `2` |
| `{:xin_chain}/raw/snapshots` | `1` |
| `{:xin_chain}/raw/mintings` | `1` |
| `{:xin_chain}/raw/nodes` | `1` |
| `bitcoin/omni/properties` | `10` |
| `ethereum/erc-20/tokens` | `2` |
| `ethereum/erc-20/transactions` | `5` |

**Table descriptions**

Further the documentation describes each of the supported tables. Each documentation section contains a general description, and a table listing the table columns (fields) in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| _Column name_ | _Column type_ | _Column description_ | _Is it possible to filter by this column?_ | _Is it possible to sort by this column?_ | _Is it possible to group by this column?_ | _Is it possible to apply aggregation functions (like `sum`) to this column?_ |

The following marks are possible for the `Q?` column:

-   `=` — possible to use equalities only
-   `*` — possible to use both equalities and inequalities
-   `⌘` — possible to use special format (applies to timestamp fields)
-   `~` — possible to use the `LIKE` operator
-   `^` — possible to use the `STARTS WITH` operator
-   `*≈` — possible to use both equalities and inequalities, may return some results which are a bit out of the set range (this is used to swiftly search over the Ethereum blockchain that uses too long wei numbers for transfer amounts)

For the `S?`, `A?`, and `C?` columns it's either `+` (which means "yes") or nothing. `⌘` means some additional options may be available (in case of aggregation it may either mean additional fields like `year` are available, or in case of functions — only `min` and `max` are available).

There can also be synthetic columns which aren't shown in the response, but you can still filter or sort by them. If there are any, they will be listed in a separate table.

## Inifinitable endpoints for Bitcoin-like blockchains (Bitcoin, Bitcoin Cash, Litecoin, Bitcoin SV, Dogecoin, Dash, Groestlcoin, Zcash, eCash, Bitcoin Testnet)

### `blocks` table

**Endpoint:**

-   `https://api.blockchair.com/{:btc_chain}/blocks?{:query}`

**Where:**

-   `{:btc_chain}` can be one of these: `bitcoin`, `bitcoin-cash`, `litecoin`, `bitcoin-sv`, `dogecoin`, `dash`, `groestlcoin`, `zcash`, `ecash`, `bitcoin/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

`data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | Block height | `*` | `+` |  | `⌘` |
| hash | string `[0-9a-f]{64}` | Block hash | `=` | `+` |  |  |
| date | string `YYYY-MM-DD` | Block date (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Block time (UTC) | `⌘` | `+` |  |  |
| median\_time | string `YYYY-MM-DD HH:ii:ss` | Block median time (UTC) |  | `+` |  |  |
| size | int | Block size in bytes | `*` | `+` |  | `+` |
| stripped\_size † | int | Block size in bytes without taking witness information into account | `*` | `+` |  | `+` |
| weight † | int | Block weight in weight units | `*` | `+` |  | `+` |
| version | int | Version field | `*` | `+` | `+` |  |
| version\_hex | string `[0-9a-f]*` | Version field in hex |  |  |  |  |
| version\_bits | string `[01]{30}` | Version field in binary format |  |  |  |  |
| merkle\_root | `[0-9a-f]{64}` | Merkle root hash |  |  |  |  |
| final\_sapling\_root § | `[0-9a-f]{64}` | Sapling root hash |  |  |  |  |
| nonce | int | Nonce value | `*` | `+` |  |  |
| solution § | `[0-9a-f]*` | Solution value |  |  |  |  |
| anchor § | `[0-9a-f]*` | Anchor value |  |  |  |  |
| bits | int | Bits field | `*` | `+` |  |  |
| difficulty | float | Difficulty | `*` | `+` |  | `+` |
| chainwork | string `[0-9a-f]{64}` | Chainwork field |  |  |  |  |
| coinbase\_data\_hex | string `[0-9a-f]*` | Hex information contained in the input of the coinbase transaction | `^` |  |  |  |
| transaction\_count | int | Number of transactions in the block | `*` | `+` |  | `+` |
| witness\_count † | int | Number of transactions in the block containing witness information | `*` | `+` |  | `+` |
| input\_count | int | Number of inputs in all block transactions | `*` | `+` |  | `+` |
| output\_count | int | Number of outputs in all block transactions | `*` | `+` |  | `+` |
| input\_total | int | Sum of inputs in satoshi | `*` | `+` |  | `+` |
| input\_total\_usd | float | Sum of outputs in USD | `*` | `+` |  | `+` |
| output\_total | int | Sum of outputs in satoshi | `*` | `+` |  | `+` |
| output\_total\_usd | float | Sum of outputs in USD | `*` | `+` |  | `+` |
| fee\_total | int | Total fee in Satoshi | `*` | `+` |  | `+` |
| fee\_total\_usd | float | Total fee in USD | `*` | `+` |  | `+` |
| fee\_per\_kb | float | Fee per kilobyte (1000 bytes of data) in satoshi | `*` | `+` |  | `+` |
| fee\_per\_kb\_usd | float | Fee for kilobyte of data in USD | `*` | `+` |  | `+` |
| fee\_per\_kwu † | float | Fee for 1000 weight units of data in satoshi | `*` | `+` |  | `+` |
| fee\_per\_kwu\_usd † | float | Fee for 1000 weight units of data in USD | `*` | `+` |  | `+` |
| cdd\_total | float | Number of coindays destroyed by all transactions of the block | `*` | `+` |  | `+` |
| generation | int | Miner reward for the block in satoshi | `*` | `+` |  | `+` |
| generation\_usd | float | Miner reward for the block in USD | `*` | `+` |  | `+` |
| reward | int | Miner total reward (reward + total fee) in satoshi | `*` | `+` |  | `+` |
| reward\_usd | float | Miner total reward (reward + total fee) in USD | `*` | `+` |  | `+` |
| guessed\_miner | string `.*` | The supposed name of the miner who found the block (the heuristic is based on `coinbase_data_bin` and the addresses to which the reward goes) | `=` | `+` | `+` |  |
| is\_aux ‡ | boolean | Whether a block was mined using AuxPoW | `=` |  | `+` |  |
| cbtx ※ | string `.*` | Coinbase transaction data (encoded JSON) |  |  |  |  |
| shielded\_value\_delta\_total § | int | Amount transferred into the shielded pool | `*` | `+` |  | `+` |

Additional synthetic columns

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| coinbase\_data\_bin | string `.*` | Text (UTF-8) representation of coinbase data. Allows you to use the `LIKE` operator: `?q=coinbase_data_bin(~hello)` | `~` |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `id` and `hash` columns using the `equals` operator
-   † — only for Bitcoin, Litecoin, Groestlcoin, and Bitcoin Testnet (SegWit data)
-   ‡ — only for Dogecoin
-   ※ — only for Dash
-   § — only for Zcash
-   The default sorting — `id DESC`

### `transactions` table

**Endpoints:**

-   `https://api.blockchair.com/{:btc_chain}/transactions?{:query}` (for blockchain transactions)
-   `https://api.blockchair.com/{:btc_chain}/mempool/transactions?{:query}` (for mempool transactions)

**Where:**

-   `{:btc_chain}` can be one of these: `bitcoin`, `bitcoin-cash`, `litecoin`, `bitcoin-sv`, `dogecoin`, `dash`, `groestlcoin`, `zcash`, `ecash`, `bitcoin/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

`data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| block\_id | int | The height (id) of the block containing the transaction | `*` | `+` | `+` |  |
| id | int | Internal Blockchair transaction id (not related to the blockchain, used for internal purposes) | `*` | `+` |  |  |
| hash | string `[0-9a-f]{64}` | Transaction hash | `=` |  |  |  |
| date | string `YYYY-MM-DD` | The date of the block containing the transaction (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Timestamp of the block containing the transaction (UTC) | `⌘` | `+` |  |  |
| size | int | Transaction size in bytes | `*` | `+` |  | `+` |
| weight † | int | Weight of transaction in weight units | `*` | `+` |  | `+` |
| version | int | Transaction version field | `*` | `+` | `+` |  |
| lock\_time | int | Lock time — can be either a block height, or a unix timestamp | `*` | `+` |  |  |
| is\_coinbase | boolean | Is it a coinbase (generating new coins) transaction? (For such a transaction `input_count` is equal to `1` and means there's a synthetic coinbase input) | `=` |  | `+` |  |
| has\_witness † | boolean | Is there a witness part in the transaction (using SegWit)? | `=` |  | `+` |  |
| input\_count | int | Number of inputs | `*` | `+` | `+` | `+` |
| output\_count | int | Number of outputs | `*` | `+` | `+` | `+` |
| input\_total | int | Input value in satoshi | `*` | `+` |  | `+` |
| input\_total\_usd | float | Input value in USD | `*` | `+` |  | `+` |
| output\_total | int | Output value in satoshi | `*` | `+` |  | `+` |
| output\_total\_usd | float | Total output value in USD | `*` | `+` |  | `+` |
| fee | int | Fee in satoshi | `*` | `+` |  | `+` |
| fee\_usd | float | Fee in USD | `*` | `+` |  | `+` |
| fee\_per\_kb | float | Fee per kilobyte (1000 bytes) of data in satoshi | `*` | `+` |  | `+` |
| fee\_per\_kb\_usd | float | Fee for kilobyte of data in USD | `*` | `+` |  | `+` |
| fee\_per\_kwu † | float | Fee for 1000 weight units of data in satoshi | `*` | `+` |  | `+` |
| fee\_per\_kwu\_usd † | float | Fee for 1000 weight units of data in USD | `*` | `+` |  | `+` |
| cdd\_total | float | The number of destroyed coindays | `*` | `+` |  | `+` |

Additional Dash-specific columns:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| type ※ | string (enum) | Transaction type, one of the following: `simple`, `proregtx`, `proupservtx`, `proupregtx`, `prouprevtx`, `cbtx`, `qctx`, `subtxregister`, `subtxtopup`, `subtxresetkey`, `subtxcloseaccount` | `=` |  | `+` |  |
| is\_instant\_lock ※ | boolean | Is instant lock? | `=` |  |  |  |
| is\_special ※ | boolean | `true` for all transaction types except `simple` | `=` |  |  |  |
| special\_json ※ | string `.*` | Special transaction data (encoded JSON string) |  |  |  |  |

Additional Zcash-specific columns:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| shielded\_value\_delta § | int | Amount transferred into the shielded pool | `*` | `+` |  | `+` |
| version\_group\_id § | string `[0-9a-f]*` | Special version field | `=` |  | `+` |  |
| is\_overwintered § | boolean | Is overwintered? | `=` |  | `+` |  |
| expiry\_height § | int | Expiry height | `*` | `+` |  |  |
| join\_split\_raw § | json | Raw 'v\_join\_split' value |  |  |  |  |
| shielded\_input\_raw § | json | Raw 'v\_shielded\_spend' value |  |  |  |  |
| shielded\_output\_raw § | json | Raw 'v\_shielded\_output' value |  |  |  |  |
| binding\_signature § | string `[0-9a-f]*` | Binding signature |  |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `id` and `hash` columns using the `equals` operator
-   † — only for Bitcoin, Litecoin, Groestlcoin, and Bitcoin Testnet (SegWit data)
-   ※ — only for Dash
-   § — only for Zcash
-   The default sorting — `id DESC`
-   `block_id` for mempool transactions is `-1`

### `outputs` table

**Endpoints:**

-   `https://api.blockchair.com/{:btc_chain}/outputs?{:query}` (input and output data for blockchain transactions)
-   `https://api.blockchair.com/{:btc_chain}/mempool/outputs?{:query}` (input and output data for mempool transactions)

**Where:**

-   `{:btc_chain}` can be one of these: `bitcoin`, `bitcoin-cash`, `litecoin`, `bitcoin-sv`, `dogecoin`, `dash`, `groestlcoin`, `zcash`, `ecash`, `bitcoin/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

`data` contains an array of database rows. Rows represent transaction outputs (that also become transaction inputs when they are spent). Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| block\_id | int | Id of the block containing the transaction cointaining the output | `*` | `+` | `+` |  |
| transaction\_id | int | Internal Blockchair transaction id (not related to the blockchain, used for internal purposes) | `*` | `+` |  |  |
| index | int | Output index in the transaction (from 0) | `*` | `+` |  |  |
| transaction\_hash | string `[0-9a-f]{64}` | Transaction hash |  |  |  |  |
| date | string `YYYY-MM-DD` | Date of the block containing the output (UTC) |  |  |  |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Timestamp of the block containing the output (UTC) | `⌘` | `+` |  |  |
| value | int | Monetary value of the output | `*` | `+` |  | `+` |
| value\_usd | float | Monetary value of the output in USD | `*` | `+` |  | `+` |
| recipient | string `[0-9a-zA-Z\-]*` | Address or synthetic address of the output recipient (see [address types description](https://blockchair.com/api/docs#link_300)) | `=` | `+` | `+` |  |
| type | string (enum) | Output type, one of the following: `pubkey`, `pubkeyhash`, `scripthash`, `multisig`, `nulldata`, `nonstandard`, `witness_v0_scripthash`, `witness_v0_keyhash`, `witness_unknown` | `=` | `+` | `+` |  |
| script\_hex | string `[0-9a-f]*` | Hex value of the output script. Filtering using the `STARTS WITH` operator is performed for `nulldata` outputs only. | `^` |  |  |  |
| is\_from\_coinbase | boolean | Is it a coinbase transaction output? | `=` |  | `+` |  |
| is\_spendable | null or boolean | Is it theoretically possible to spend this output? For `pubkey` and `multisig` outputs, the existence of the corresponding private key is tested, in that case `true` and `false` are the possible values depending on the result of the check. For `nulldata` outputs it is always `false`. For other types it is impossible to check trivially, in that case `null` is yielded. | `=` |  | `+` |  |
| is_spent | boolean | Has this output been spent? \*\*(\`spending_\* `fields below yield` null `if it is not)** |` \= `| |` +\` |  |
| spending\_block\_id | null or int | Id of the block containing the spending transaction | `*` | `+` | `+` |  |
| spending\_transaction\_id | null or int | Internal Blockchair transaction id where the output was spent | `*` | `+` |  |  |
| spending\_index | null or int | Input index in the spending transaction (from 0) | `*` | `+` |  |  |
| spending\_transaction\_hash | null or string `[0-9a-f]{64}` | Spending transaction hash |  |  |  |  |
| spending\_date | null or string `YYYY-MM-DD` | Date of the block, in which the output was spent |  |  | `⌘` |  |
| spending\_time | null or string `YYYY-MM-DD HH:ii:ss` | Timestamp of the block in which the output was spent | `⌘` | `+` |  |  |
| spending\_value\_usd | null or float | Monetary value of the output in USD at the time of `spending_date` | `*` | `+` |  | `+` |
| spending\_sequence | null or int | Sequence field | `*` | `+` |  |  |
| spending\_signature\_hex | null or string `[0-9a-f]*` | Hex value of the spending script (signature) |  |  |  |  |
| spending\_witness † | null or string | Witness information (comma-separated, may start with a comma if the first witness element is empty) |  |  |  |  |
| lifespan | null or int | The number of seconds from the time of the output creation (`time`) to its spending (`spending_time`), `null` if the output hasn't been spent | `*` | `+` |  | `+` |
| cdd | null or float | The number of coindays destroyed spending the output, `null` if the output hasn't been spent | `*` | `+` |  | `+` |

Additional synthetic columns

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| script\_bin | string `.*` | Text (UTF-8) representation of `script_hex`. Allows you to use the `LIKE` operator: `?q=script_bin(~hello)`. Filtering using the `LIKE` operator is performed for `nulldata` outputs only. | `~` |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `transaction_id` and `spending_transaction_id` columns using the `equals` operator
-   † — only for Bitcoin, Litecoin, Groestlcoin, and Bitcoin Testnet (SegWit data)
-   The default sorting — `transaction_id DESC`
-   `spending_*` columns yield `null` for outputs that haven't been spent yet
-   `block_id` for mempool transactions is `-1`
-   `spending_block_id` is `-1` for outputs being spent by an unconfirmed transaction
-   This particular table is in beta test mode on our platform. It's possible to receive duplicate rows for outputs which have just been spent. Sometimes duplicates are removed automatically, but in that case the number of rows may be less than the set limit on the number of rows. There's an additional context key `context.pre_rows` which contains the number of rows that should've been returned before the duplicate removal process.

### `addresses` view

**Endpoints:**

-   `https://api.blockchair.com/{:btc_chain}/addresses?{:query}`

**Where:**

-   `{:btc_chain}` can be one of these: `bitcoin`, `bitcoin-cash`, `litecoin`, `bitcoin-sv`, `dogecoin`, `dash`, `groestlcoin`, `zcash`, `ecash`, `bitcoin/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

The `addresses` view contains the list of all addresses and their confirmed balances. Unlike other infinitables (`blocks`, `transactions`, `outputs`) this table isn't live, it's automatically updated every 5 minutes with new data, thus we classify it as a "view". `data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| address | string `[0-9a-zA-Z\-]*` | Bitcoin address or synthetic address |  |  |  |  |
| balance | int | Its confirmed balance | `*` | `+` |  | `+` |

Notes:

-   the default sorting — `balance DESC`

**Explore visualizations on our front-end:**

-   [https://blockchair.com/bitcoin/addresses](https://blockchair.com/bitcoin/addresses)
-   [https://blockchair.com/bitcoin-cash/addresses](https://blockchair.com/bitcoin-cash/addresses)
-   [https://blockchair.com/litecoin/addresses](https://blockchair.com/litecoin/addresses)
-   [https://blockchair.com/bitcoin-sv/addresses](https://blockchair.com/bitcoin-sv/addresses)
-   [https://blockchair.com/dogecoin/addresses](https://blockchair.com/dogecoin/addresses)
-   [https://blockchair.com/dash/addresses](https://blockchair.com/dash/addresses)
-   [https://blockchair.com/groestlcoin/addresses](https://blockchair.com/groestlcoin/addresses)
-   [https://blockchair.com/zcash/addresses](https://blockchair.com/zcash/addresses)
-   [https://blockchair.com/bitcoin/testnet/addresses](https://blockchair.com/bitcoin/testnet/addresses)

## Inifinitable endpoints for Ethereum and Ethereum Goerli Testnet

### `blocks` table

**Endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/blocks?{:query}`

**Where:**

-   `{:eth_chain}` can only be `ethereum` or `ethereum/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

`data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | Block id | `*` | `+` |  | `⌘` |
| hash | string `0x[0-9a-f]{64}` | Block hash | `=` |  |  |  |
| date | string `YYYY-MM-DD` | Block date (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Block time (UTC) | `⌘` | `+` |  |  |
| size | int | Block size in bytes | `*` | `+` |  | `+` |
| miner | string `0x[0-9a-f]{40}` | Address the miner who found the block | `=` |  | `+` |  |
| extra\_data\_hex | string `[0-9a-f]*` | Additional data included by the miner | `^` |  |  |  |
| difficulty | int | Difficulty | `*` | `+` |  | `+` |
| gas\_used | int | Gas amount used by block transactions | `*` | `+` |  | `+` |
| gas\_limit | int | Gas limit for the block set by the miner | `*` | `+` |  | `+` |
| logs\_bloom | string `[0-9a-f]*` | Logs bloom field |  |  |  |  |
| mix\_hash | string `[0-9a-f] {64}` | Mix hash |  |  |  |  |
| nonce | string `[0-9a-f]*` | Nonce value |  |  |  |  |
| receipts\_root | string `[0-9a-f] {64}` | Receipts root |  |  |  |  |
| sha3\_uncles | string `[0-9a-f] {64}` | SHA3 Uncles |  |  |  |  |
| state\_root | string `[0-9a-f] {64}` | State root |  |  |  |  |
| total\_difficulty | numeric string | Total difficulty at the `id` point |  |  |  |  |
| transactions\_root | string `[0-9a-f] {64}` | Transactions root |  |  |  |  |
| uncle\_count | int | Number of block uncles | `*` | `+` |  | `+` |
| transaction\_count | int | Number of transactions in the block | `*` | `+` |  | `+` |
| synthetic\_transaction\_count | int | Number of synthetic transactions (they do not exist as separate transactions on the blockchain, but they change the state, e.g., genesis block transactions, miner rewards, DAO-fork transactions, etc.) | `*` | `+` |  | `+` |
| call\_count | int | Total number of calls spawned by transactions | `*` | `+` |  | `+` |
| synthetic\_call\_count | int | Number of synthetic calls (same as synthetic transactions) | `*` | `+` |  | `+` |
| value\_total | numeric string | Monetary value of all block transactions in wei, hereinafter `numeric string` - numeric (integer or float in some cases) value passed as a string, as values in wei do not fit into integer | `*≈` | `+` |  | `+` |
| value\_total\_usd | float | Monetary value of all block transactions in USD | `*` | `+` |  | `+` |
| internal\_value\_total | numeric string | Monetary value of all internal calls in the block in wei | `*≈` | `+` |  | `+` |
| internal\_value\_total\_usd | float | Monetary value of all internal calls in a block in USD | `*` | `+` |  | `+` |
| generation | numeric string | The reward of a miner for the block generation in wei | `*≈` | `+` |  | `+` |
| generation\_usd | float | The reward of a miner for the block generation in USD | `*` | `+` |  | `+` |
| uncle\_generation | numeric string | Total reward of uncle miners in wei | `*≈` | `+` |  | `+` |
| uncle\_generation\_usd | float | Total reward of uncle miners in USD | `*` | `+` |  | `+` |
| fee\_total | numeric string | Total fee in wei | `*≈` | `+` |  | `+` |
| fee\_total\_usd | float | Total fee in USD | `*` | `+` |  | `+` |
| reward | numeric string | Total reward of the miner in the wei (reward for finding the block + fees) | `*≈` | `+` |  | `+` |
| reward\_usd | float | Total reward of the miner in USD | `*` | `+` |  | `+` |

Additional synthetic columns

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| extra\_data\_bin | string `.*` | Text representation (UTF-8) of extra data. Allows you to use the `LIKE` operator: `?q=extra_data_bin(~hello)` | `~` |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `id` and `hash` columns using the `equals` operator
-   Search by fields that contain values in wei (`value_total`, `internal_value_total`, `generation`, `uncle_generation`, `fee_total`, `reward`) may be with some inaccuracies
-   The difference between `value_total` and `internal_value_total`: e.g., a transaction itself sends 0 eth, but this transaction is a call of a contract that sends someone, let's say, 10 eth. Then `value` will be 0 eth, and `internal_value` - 10 eth
-   The default sorting is `id DESC`

**Explore visualizations on our front-end:**

-   [https://blockchair.com/ethereum/blocks](https://blockchair.com/ethereum/blocks)

### `uncles` table

**Endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/uncles?{:query}`

**Where:**

-   `{:eth_chain}` can only be `ethereum` or `ethereum/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

Returns information about uncles. `data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| parent\_block\_id | int | Parent block id | `*` | `+` | `+` |  |
| index | int | Uncle index in the block | `*` | `+` |  |  |
| id | int | Uncle id | `*` | `+` |  |  |
| hash | string `0x[0-9a-f]{64}` | Uncle hash (with 0x) | `=` |  |  |  |
| date | string `YYYY-MM-DD` | Date of generation (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Timestamp of generation (UTC) | `⌘` | `+` |  |  |
| size | int | Uncle size in bytes | `*` | `+` |  | `+` |
| miner | string `0x[0-9a-f]{40}` | Address of the rewarded miner (with 0x) | `=` |  | `+` |  |
| extra\_data\_hex | string `[0-9a-f]*` | Additional data included by the miner | `^` |  |  |  |
| difficulty | int | Difficulty | `*` | `+` |  | `+` |
| gas\_used | int | Amount of gas used by transactions | `*` | `+` |  | `+` |
| gas\_limit | int | Gas limit for the block set up by the miner | `*` | `+` |  | `+` |
| logs\_bloom | string `[0-9a-f]*` | Logs bloom field |  |  |  |  |
| mix\_hash | string `[0-9a-f]{64}` | Hash mix |  |  |  |  |
| nonce | string `[0-9a-f]*` | Nonce value |  |  |  |  |
| receipts\_root | string `[0-9a-f]{64}` | Receipts root |  |  |  |  |
| sha3\_uncles | string `[0-9a-f]{64}` | Uncles hash |  |  |  |  |
| state\_root | string `[0-9a-f]{64}` | State root |  |  |  |  |
| transactions\_root | string `[0-9a-f]{64}` | Transactions root |  |  |  |  |
| generation | numeric string | The reward of the miner who generated the uncle, in wei | `*≈` | `+` |  | `+` |
| generation\_usd | float | The award of the miner who generated uncle, in USD | `*` | `+` |  | `+` |

Additional synthetic columns

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| extra\_data\_bin | string `.*` | Text (UTF-8) representation of extra data. Allows you to use the `LIKE` operator:`?Q=extra_data_bin(~hello)` | `~` |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `parent_block_id` and `hash` columns using the `equals` operator
-   Search by fields that contain values in wei (`generation`) may be with some inaccuracies
-   The difference between `value_total` and `internal_value_total`: a transaction itself may send, say, 0 eth, but this transaction may call a contract which sends someone 10 eth. In that case `value` will be 0 eth, and `internal_value` will be 10 eth
-   The default sorting is `parent_block_id DESC`

### `transactions` table

**Endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/transactions?{:query}` (for blockchain transactions)
-   `https://api.blockchair.com/{:eth_chain}/mempool/transactions?{:query}` (for mempool transactions)

**Where:**

-   `{:eth_chain}` can only be `ethereum` or `ethereum/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

`data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| block\_id | int | Id of the block containing the transaction | `*` | `+` | `+` |  |
| id | int | Internal Blockchair transaction id (not related to the blockchain, used for internal purposes) | `*` | `+` |  |  |
| index †‡ | int | The transaction index number in the block | `*` | `+` |  |  |
| hash ‡ | string `0x[0-9a-f]{64}` | Transaction hash | `=` |  |  |  |
| date | string `YYYY-MM-DD` | Date of the block containing the transaction (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Time of the block containing the transaction (UTC) | `⌘` | `+` |  |  |
| failed † | bool | Failed transaction or not? | `=` |  | `+` |  |
| type † | string (enum) | Transaction type with one of the following values: `call`, `create`, `call_tree`, `create_tree`, `synthetic_coinbase`. Description in the note below. | `=` | `+` | `+` |  |
| sender ‡ | string `0x[0-9a-f]{40}` | Address of the transaction sender | `=` |  | `+` |  |
| recipient | string `0x[0-9a-f]{40}` | Address of the transaction recipient | `=` |  | `+` |  |
| call\_count † | int | Number of calls in the transaction | `*` | `+` |  | `+` |
| value | numeric string | Monetary value of transaction in wei | `*≈` | `+` |  | `+` |
| value\_usd | float | Value of transaction in USD | `*` | `+` |  | `+` |
| internal\_value † | numeric string | Value of all internal calls in the transaction in wei | `*≈` | `+` |  | `+` |
| internal\_value\_usd † | float | Value of all internal calls in the transaction in USD | `*` | `+` |  | `+` |
| fee †‡ | numeric string | Fee in wei | `*≈` | `+` |  | `+` |
| fee\_usd †‡ | float | Fee in USD | `*` | `+` |  | `+` |
| gas\_used †‡ | int | Amount of gas used by a transaction | `*` | `+` |  | `+` |
| gas\_limit ‡ | int | Gas limit for transaction set by the sender | `*` | `+` |  | `+` |
| gas\_price ‡ | int | Price for gas set by the sender | `*` | `+` |  | `+` |
| input\_hex ‡ | string `[0-9a-f]*` | Transaction input data (hex) | `^` |  |  |  |
| nonce ‡ | int | Nonce value |  |  |  |  |
| v ‡ | string `[0-9a-f]*` | V value |  |  |  |  |
| r ‡ | string `[0-9a-f]*` | R value |  |  |  |  |
| s ‡ | string `[0-9a-f]*` | S value |  |  |  |  |

Additional synthetic columns

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| input\_bin | string `.*` | Text (UTF-8) representation of input data. Allows you to use the `LIKE` operator: `?q=input_bin(~hello)` | `~` |  |  |  |

Possible types (`type`) of transactions:

-   `call` — the transaction transfers the value, but there are no more calls (a simple ether sending, not in favor of a contract, or the call to a contract that does nothing)
-   `create` — create a new contract
-   `call_tree` — the transaction calls a contract that makes some other calls
-   `create_tree` — create a new contract that create contracts or starts making calls
-   `synthetic_coinbase` — a synthetic transaction for awarding a reward to the miner (block or uncle)

Notes:

-   `increased efficiency` method applies if querying `id` and `hash` columns using the `equals` operator
-   † — value is `null` for transactions in the mempool
-   ‡ — value is `null` if `type` is `synthetic_coinbase`
-   Search by fields that contain values in wei (`value_total`, `internal_value_total`, `generation`, `uncle_generation`, `fee_total`, `reward`) may be with some inaccuracies
-   The difference between `value_total` and `internal_value_total`: e.g., a transaction itself sends 0 eth, but this transaction is a call of a contract that sends someone, let's say, 10 eth. Then `value` will be 0 eth, and `internal_value` - 10 eth
-   The default sorting — `id DESC`
-   `block_id` for mempool transactions is `-1`

### `calls` table

**Endpoint:**

-   `https://api.blockchair.com/{:eth_chain}/calls?{:query}`

**Where:**

-   `{:eth_chain}` can only be `ethereum` or `ethereum/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

Returns information about internal transaction calls. `data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| block\_id | int | Block id containing a call | `*` | `+` | `+` |  |
| transaction\_id | int | Transaction id containing the call | `*` | `+` |  |  |
| transaction\_hash † | string `0x[0-9a-f]{64}` | Transaction hash (with 0x) containing the call | `=` |  |  |  |
| index | string | Call index within the transaction (tree-like, e.g., "0.8.1") | `=` | `+` |  |  |
| depth | int | Call depth within the call tree (starting at 0) | `*` | `+` |  |  |
| date | string `YYYY-MM-DD` | Date of the block that contains the call (UTC) |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Time of the block that contains the call (UTC) | `⌘` | `+` |  |  |
| failed | bool | Failed call or not | `=` |  | `+` |  |
| fail\_reason | string `.*` or null | If failed, then the failure description, if not, then `null` | `~` |  | `+` |  |
| type | string (enum) | The call type, one of the following values: `call`, `delegatecall`, `staticcall`, `callcode`, `selfdestruct`, `create`, `synthetic_coinbase`, `create2` | `=` | `+` | `+` |  |
| sender † | string `0x[0-9a-f]{40}` | Sender's address (with 0x) | `=` |  | `+` |  |
| recipient | string `0x[0-9a-f]{40}` | Recipient's address (with 0x) | `=` |  | `+` |  |
| child\_call\_count | int | Number of child calls | `*` | `+` |  | `+` |
| value | numeric string | Call value in wei, hereinafter `numeric string` - is a numeric string passed as a string, because wei-values do not fit into uint64 | `*≈` | `+` |  | `+` |
| value\_usd | float | Call value in USD | `*` | `+` |  | `+` |
| transferred | bool | Has ether been transferred? (`false` if `failed`, or if the type of transaction does not change the state, e.g., `staticcall` | `=` |  | `+` |  |
| input\_hex † | string `[0-9a-f]*` | Input call data |  |  |  |  |
| output\_hex † | string `[0-9a-f]*` | Output call data |  |  |  |  |

Notes:

-   `increased efficiency` method applies if querying `transction_id` column using the `equals` operator
-   † — value is `null` if `type` is `synthetic_coinbase`
-   Search by fields that contain values in wei (`value`) may be with some inaccuracies
-   The default sorting is `transaction_id DESC`
-   sorting by `index` respects the tree structure (i.e. "0.2" comes before "0.11") instead of being alphabetical

### `addresses` view

**Endpoints:**

-   `https://api.blockchair.com/{:eth_chain}/addresses?{:query}`

**Where:**

-   `{:eth_chain}` can only be: `ethereum` or `ethereum/testnet`
-   `{:query}` is the query against the table ([how to build a query](https://blockchair.com/api/docs#link_05))

**Output:**

The `addresses` view contains the list of all addresses and their confirmed balances. Unlike other infinitables (`blocks`, `transactions`, `outputs`) this table isn't live, it's automatically updated **every day** with new data, thus we classify it as a "view". `data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| address | string `0x[0-9a-zA-Z\-]*` | Ethereum account or contract address |  |  |  |  |
| balance | numeric string | Its balance | `*` | `+` |  | `+` |
| nonce | int | Its nonce value | `*` | `+` |  | `+` |
| is\_contract | boolean | Is it a contract (`true`) or an account (`false`)? | `=` |  | `+` |  |

Notes:

-   the default sorting — `balance DESC`

## Inifinitable endpoints for Mixin

Please note that our Mixin API outputs raw node data for these endpoints.

### `snapshots` table

Note: this particular table doesn't support advanced querying. The only query section it supports are `?offset=` and sorting/filtering by `topology`.

**Endpoint:**

-   `https://api.blockchair.com/{:xin_chain}/raw/snapshots?{:query}`

**Where:**

-   `{:xin_chain}` can be only `mixin`

**Example requests:**\`

-   `https://api.blockchair.com/mixin/raw/snapshots`
-   `https://api.blockchair.com/mixin/raw/snapshots?q=topology(..18629737)&offset=10`
-   `https://api.blockchair.com/mixin/raw/snapshots?s=topology(asc)`

### `mintings` table

Note: this particular table doesn't support advanced querying. The only query section it supports are `?offset=` and sorting/filtering by `batch`.

**Endpoint:**

-   `https://api.blockchair.com/{:xin_chain}/raw/mintings?{:query}`

**Where:**

-   `{:xin_chain}` can be only `mixin`

**Output:**

`data` contains an array of database rows.

**Example requests:**\`

-   `https://api.blockchair.com/mixin/raw/mintings`
-   `https://api.blockchair.com/mixin/raw/mintings?q=batch(..400)&offset=10`
-   `https://api.blockchair.com/mixin/raw/mintings?s=batch(asc)`

### `nodes` table

Note: this particular table doesn't support querying. It outputs all the entries (so there's no standard limit of 10 rows). Nodes are sorted by their `state`, and then by `timestamp`.

**Endpoint:**

-   `https://api.blockchair.com/{:xin_chain}/raw/nodes`

**Where:**

-   `{:xin_chain}` can be only `mixin`

**Example requests:**\`

-   `https://api.blockchair.com/mixin/raw/nodes`

## Inifinitable endpoints for Tezos

Please note that our Tezos API outputs raw node data for this endpoint.

### `blocks` table

Note: this particular table doesn't support advanced querying. The only query section it supports are `?offset=` and sorting/filtering by `id` (height).

**Endpoint:**

-   `https://api.blockchair.com/{:xtz_chain}/raw/blocks?{:query}`

**Where:**

-   `{:xtz_chain}` can be only `tezos`

**Example requests:**\`

-   `https://api.blockchair.com/tezos/raw/blocks`
-   `https://api.blockchair.com/tezos/raw/blocks?q=id(..100000)&offset=10`
-   `https://api.blockchair.com/tezos/raw/blocks?s=id(asc)`

## Inifinitable endpoints for second layers

### `properties` table (Omni Layer)

Note: this particular table doesn't support querying. The only query section it supports is `?offset=`. Note that this endpoint is in the Alpha stage.

**Endpoint:**

-   `https://api.blockchair.com/bitcoin/omni/properties?{:query}`

, the only supported query section for this table is `?offset=`

**Output:**

`data` contains an array of database rows. Each row is in the format which accords with Omni Layer specification ([https://github.com/OmniLayer/spec](https://github.com/OmniLayer/spec))

**Explore visualization on our front-end:**

-   [https://blockchair.com/bitcoin/omni/properties](https://blockchair.com/bitcoin/omni/properties)

### `tokens` table (ERC-20)

**Endpoint:**

-   `https://api.blockchair.com/ethereum/erc-20/tokens?{:query}`
-   `https://api.blockchair.com/ethereum/testnet/erc-20/tokens?{:query}` (Goerli Testnet)

**Output:**

Returns information about ERC-20 tokens indexed by our engine. `data` contains an array of database rows. Each row is in the following format:

| Column | Type | Description | Q? | S? | A? | C? |
| --- | --- | --- | --- | --- | --- | --- |
| address | string `0x[0-9a-f]{40}` | Address of the token contract | `=` |  |  |  |
| id | int | Internal Blockchair id of the token | `*` | `+` |  |  |
| date | string `YYYY-MM-DD` | Creation date |  |  | `⌘` |  |
| time | string `YYYY-MM-DD HH:ii:ss` | Creation timestamp | `⌘` | `+` |  |  |
| name | string `.*` (or an empty string) | Token name (e.g. `My New Token`) | `=` | `+` |  |  |
| symbol | string `.*` (or an empty string) | Token symbol (e.g. `MNT`) | `=` | `+` |  |  |
| decimals | int | Number of decimals | `=` | `+` |  |  |
| creating\_block\_id | int | Creating block height | `*` | `+` |  |  |
| creating\_transaction\_hash | string `0x[0-9a-f]{64}` | Creating transaction hash |  |  |  |  |

Notes:

-   for the columns `address`, `id` increased efficiency when uploading one record is applied
-   there is no possibility to search over `date` column, use searching `?q=time(YYYY-MM-DD)` instead
-   the default sort is `id DESC`
-   when using `offset`, it is reasonable to add to the filters the maximum block number (`?q=block_id(..N)`), since it is very likely that during the iteration new rows will be added to the table. For convenience, you can take the value of `context.state` from the first result of any query containing the number of the latest block at the query time and use this result later on.

**Endpoint:**

-   `https://api.blockchair.com/ethereum/erc-20/transactions?{:query}`
-   `https://api.blockchair.com/ethereum/testnet/erc-20/transactions?{:query}` (Goerli Testnet)