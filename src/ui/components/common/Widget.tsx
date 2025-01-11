import { ReactNode } from "react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import * as Styled from "./Widget.style.tsx";
import WidgetResizer from "./WidgetResizer.tsx";

interface IWidgetProps {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatiosByDirection?: { vertical: number; horizontal: number };
  children?: ReactNode;
}

const Widget = (props: IWidgetProps) => {
  const nodeId = useNodeId();
  const { getNode } = useReactFlow();
  const node = nodeId == null ? null : getNode(nodeId);

  const isSelected = node?.selected ?? false;
  const isDragging = node?.dragging ?? false;

  const shouldResize = (): boolean => {
    return isSelected && !isDragging;
  };

  return (
    <Styled.WidgetContainer
      $minWidth={props.minWidth}
      $minHeight={props.minHeight}
      $isSelected={isSelected}
      $isDragging={isDragging}
    >
      <WidgetResizer
        minWidth={props.minWidth}
        minHeight={props.minHeight}
        maxWidth={props.maxWidth}
        maxHeight={props.maxHeight}
        aspectRatiosByDirection={props.aspectRatiosByDirection}
        isVisible={isSelected}
        shouldResize={shouldResize}
      />
      {props.children}
    </Styled.WidgetContainer>
  );
};

export default Widget;
