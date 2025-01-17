import styled from "styled-components";

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
  background-color: orange;
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .react-flow__resize-control.handle {
    ${(props) => props.$isDragging && "display: none;"}
    animation: fadeIn 0.3s forwards;
    width: 10px;
    height: 10px;
    background-color: #ffffff;
    border: 1px solid #9e86ed;
    border-radius: 50%;
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
