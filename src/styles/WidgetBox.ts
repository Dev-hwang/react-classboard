import { css } from "styled-components";

interface WidgetBoxProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
}

export const WidgetBox = (props?: WidgetBoxProps) => css`
  display: flex;
  flex-direction: ${props?.direction ?? "column"};
  justify-content: flex-start;
  align-items: stretch;
  height: 100%;
`;
