import { NodeToolbar } from "@xyflow/react";
import styled from "styled-components";
import { fadeIn } from "../../../../styles/animation/fade";

export const CustomNodeToolbar = styled(NodeToolbar)<{
  $isSelected: boolean;
  $isDragging: boolean;
}>`
  position: relative;
  ${(props) => props.$isDragging && "display: none;"}
  animation: ${fadeIn} 0.3s;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;

  button {
    padding: 8px;

    &:hover {
      background-color: orange;
    }
  }
`;

export const ToolbarDivider = styled.div`
  position: absolute;
  display: inline-block;
  width: 1px;
  height: 100%;
  background-color: lightgray;
`;
