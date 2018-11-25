# Google Assistant -> Crypto Currency Prices

## Getting Started

1. Install command line tools necessary for development.
    ```bash
    npm install -g firebase-tools ts-node
    ```
1. Install Node modules
    ```bash
    cd functions
    npm install
    ```

## Deploying

```bash
cd functions
npm run deploy
```

## Running

The scripts under `scripts/` are for trying out some of the scripts.

```bash
ts-node scripts/tickersRunner.ts bitflyer BTC/JPY
```
