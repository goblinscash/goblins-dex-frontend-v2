import { tokens } from "@myswap/token-list"
import { stableTokens } from "./constant.utils"

type Token = typeof tokens[0];

const TokenMap: Record<string, Token> = [...tokens, ...stableTokens(56)].reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {} as Record<string, Token>);


export const getToken = (address: string): Token | undefined => {
  return TokenMap[address.toLowerCase()];
}
