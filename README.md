# Goblins DEX Frontend v2

A decentralized exchange (DEX) frontend built with Next.js, TypeScript, and various modern web technologies. This platform allows users to interact with decentralized finance protocols.

## Core Features
*   **Swap**: Exchange one cryptocurrency for another.
*   **Liquidity Provision**: Add or remove liquidity from pools.
*   **Farming**: Stake LP tokens to earn rewards.
*   **Staking/Locking**: Stake or lock native tokens for governance rights and/or rewards.
*   **Voting**: Participate in governance by voting on proposals.
*   **Relaying**: Support for relaying transactions.
*   **Dashboard**: An overview of user balances, positions, and platform statistics.

## For Users - How to Use
1.  **Connect Wallet**: Click the "Connect Wallet" button and select a compatible cryptocurrency wallet (e.g., MetaMask, WalletConnect). Ensure your wallet is connected to the appropriate network.
2.  **Navigate Features**: Use the navigation menu (typically at the top or side of the page) to access different sections:
    *   **Swap**: Select input and output tokens, enter an amount, and confirm the swap.
    *   **Liquidity**: Choose a pool, and opt to add or remove liquidity by specifying token amounts.
    *   **Farm**: Browse available farms, select one, and deposit your LP tokens to start earning rewards.
    *   **Stake/Lock (`/stake`, `/lock`, `/locks`)**: Go to the staking or locking section, choose a token, specify the amount and duration (if applicable), and confirm to stake/lock your tokens.
    *   **Vote (`/vote`)**: View active proposals and cast your vote using your staked/locked tokens.
    *   **Relay (`/relay`)**: Access relaying services if available.
    *   **Dashboard (`/dashboard`)**: View your overall portfolio, including staked assets, LP positions, and claimable rewards.

## For Developers - Getting Started

### Prerequisites
*   **Node.js**: Latest LTS version is recommended. (e.g., v18.x, v20.x)
*   **npm**: Node Package Manager (usually comes with Node.js).

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/example/goblins-dex-v2.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd goblins-dex-v2
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
    Alternatively, to ensure a clean install based on the lockfile:
    ```bash
    npm ci
    ```

### Running the Development Server
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Environment Variables
For local development and deployment, you may need to configure environment-specific variables. Create a `.env.local` file in the root of the project. Common variables might include:

*   `NEXT_PUBLIC_RPC_URL`: The URL for the blockchain RPC endpoint.
*   `NEXT_PUBLIC_CHAIN_ID`: The chain ID of the target network.

**Note**: No `.env.example` file was found in the repository. You may need to consult with the team or existing configurations for a full list of required environment variables.

## Project Structure Overview
*   `src/app/`: Contains the application's pages and routing structure (e.g., `src/app/swap/page.tsx`, `src/app/liquidity/page.tsx`). Each subdirectory often represents a distinct feature or section of the DEX.
*   `src/components/`: Reusable UI components used across various pages (e.g., buttons, modals, layout elements).
*   `src/abi/`: JSON files representing the Application Binary Interfaces (ABIs) for interacting with smart contracts.
*   `src/config/`: Application-wide configuration settings, such as supported chains, token lists, or feature flags.
*   `src/hooks/`: Custom React hooks to encapsulate and reuse stateful logic or side effects (e.g., `useEthersSigner.ts`).
*   `src/utils/`: Utility functions and helpers for various tasks like data formatting, calculations, or API interactions.
*   `src/ContextApi/` (and `src/context/`): Implementations of React Context for global state management or sharing data across components.
*   `public/`: Static assets like images, fonts, and icons that are served directly.

## Key Technologies & Libraries
*   **Framework**: Next.js (v15.1.3)
*   **Language**: TypeScript (v5.7.3)
*   **Blockchain Interaction**:
    *   Ethers.js (v6.14.1)
    *   Viem (v2.17.5)
    *   Wagmi (v2.11.2)
*   **State Management**:
    *   Zustand (v4.5.5)
    *   React Context
*   **UI & Styling**:
    *   Tailwind CSS (v3.4.1)
    *   DaisyUI (v5.0.9)
    *   Styled Components (v6.1.14)
    *   Headless UI (v2.2.3)
    *   React-Slick (v0.30.3) (for carousels)
    *   Recharts (v2.15.1) (for charts)
*   **Routing & Data Fetching**:
    *   TanStack React Query (v5.51.5)
*   **Utilities**:
    *   Lodash (v4.17.21)
    *   Axios (v1.7.9)

## Available Scripts
The following scripts are defined in `package.json`:

*   `npm run dev`:
    *   Starts the Next.js development server on `http://localhost:3000`.
    *   Enables features like hot module replacement for a better development experience.
*   `npm run build`:
    *   Creates an optimized production build of the application.
*   `npm run start`:
    *   Starts a Next.js production server (requires a build to be created first with `npm run build`).
*   `npm run lint`:
    *   Runs ESLint to identify and report on patterns in the codebase, ensuring code quality and consistency.
*   `npm run postinstall`:
    *   Automatically runs `patch-package` after `npm install`.
    *   `patch-package` is used to apply and manage patches to third-party dependencies in `node_modules`, allowing for quick fixes or customizations without waiting for upstream updates.

## Contributing
We welcome contributions to enhance Goblins DEX Frontend v2! Please follow these general guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix (e.g., `feature/new-swap-analytics` or `bugfix/fix-liquidity-calculation`).
3.  Make your changes and commit them with clear and descriptive messages.
4.  Push your changes to your forked repository.
5.  Open a Pull Request to the main repository, detailing the changes you've made.

## License
This project is licensed under the MIT License. See the `LICENSE.md` file for details.
