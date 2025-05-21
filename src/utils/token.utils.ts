import tokenListRaw from "@myswap/token-list"; // Changed import
import { stableTokens } from "./constant.utils";

// Assuming tokenListRaw.tokens is the array of token objects
type Token = typeof tokenListRaw.tokens[0];

const TokenMap: Record<string, Token> = [...tokenListRaw.tokens, ...stableTokens(56)].reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {} as Record<string, Token>);


export const getToken = (address: string): Token | undefined => {
  return TokenMap[address.toLowerCase()];
}
