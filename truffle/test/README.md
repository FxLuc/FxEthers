## Compile contract before run any test

```bash

truffle compile

```


## To clone a node

```bash

ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0

```


## To run all test

```bash

truffle test --network development --compile-none --migrations_directory migrations_null

```


