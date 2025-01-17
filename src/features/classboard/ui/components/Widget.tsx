import { CSSProperties, memo, ReactNode } from "react";
import * as Styled from "./Widget.style.tsx";
import WidgetResizer from "./WidgetResizer.tsx";

interface WidgetProps {
  currentWidth?: number;
  currentHeight?: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatiosByDirection?: { vertical: number; horizontal: number };
  isSelected?: boolean;
  isDragging?: boolean;
  children?: ReactNode;
}

const Widget = memo(function (props: WidgetProps) {
  const isSelected = props.isSelected ?? false;
  const isDragging = props.isDragging ?? false;

  const shouldResize = (): boolean => {
    return isSelected && !isDragging;
  };

  const calculateInlineStyle = (): CSSProperties => {
    const { currentWidth, currentHeight } = props;
    if (currentWidth == null || currentHeight == null) {
      return {};
    }

    const minHeight = props.minHeight;
    const scale = currentHeight / minHeight;
    const width = currentWidth / scale;

    return {
      transform: `scale(${scale})`,
      transformOrigin: "left top",
      display: "inline-block",
      width: width,
      height: minHeight,
    };
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
      <div style={calculateInlineStyle()}>{props.children}</div>
    </Styled.WidgetContainer>
  );
});

export default Widget;
