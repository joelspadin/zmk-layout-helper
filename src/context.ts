import { createContext, Dispatch, SetStateAction } from "react";
import Parser from "web-tree-sitter";

export const ParserContext = createContext<Parser | undefined>(undefined);

export type DeviceTreeState = [string, Dispatch<SetStateAction<string>>];

export const DeviceTreeContext = createContext<DeviceTreeState>(["", () => {}]);
