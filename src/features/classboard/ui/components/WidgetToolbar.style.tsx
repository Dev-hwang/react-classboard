import { NodeToolbar } from "@xyflow/react";
import styled from "styled-components";

export const CustomNodeToolbar = styled(NodeToolbar)<{
  $isSelected: boolean;
  $isDragging: boolean;
}>`
  position: relative;
  ${(props) => props.$isDragging && "display: none;"}
  animation: fadeIn 0.3s forwards;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;

  button {
    padding: 8px;
    background-color: white;

    &:hover {
      background-color: orange;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
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
