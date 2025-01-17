import styled from "styled-components";
import { fadeIn } from "../../../../styles/animation/fade";

export const WidgetContainer = styled.div<{
  $minWidth: number;
  $minHeight: number;
  $isSelected: boolean;
  $isDragging: boolean;
}>`
  min-width: ${(props) => props.$minWidth}px;
  min-height: ${(props) => props.$minHeight}px;
  width: 100%;
  height: 100%;
  ${(props) => props.$isSelected && "border: 1px solid #9E86ED;"}
  background-color: white;
  border-radius: 5px;
  box-sizing: border-box;
  overflow: hidden;

  .react-flow__resize-control.handle {
    ${(props) => props.$isDragging && "display: none;"}
    animation: ${fadeIn} 0.3s;
    width: 10px;
    height: 10px;
    background-color: #ffffff;
    border: 1px solid #9e86ed;
    border-radius: 50%;
  }
`;
