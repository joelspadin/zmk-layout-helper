import { useContext } from "react";
import Parser from "web-tree-sitter";
import { ParserContext } from "./context";

export function useParser(): Parser {
  const result = useContext(ParserContext);
  if (!result) {
    throw Error("Parser not loaded!");
  }
  return result;
}
