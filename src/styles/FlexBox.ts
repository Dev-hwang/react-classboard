import { css } from "styled-components";

interface FlexboxProps {
  display?: "flex" | "inline-flex";
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItem?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
}

export const FlexBox = (props?: FlexboxProps) => css`
  display: ${props?.display ?? "flex"};
  flex-direction: ${props?.direction ?? "row"};
  justify-content: ${props?.justify ?? "flex-start"};
  align-items: ${props?.alignItem ?? "flex-start"};
`;
