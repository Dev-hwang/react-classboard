import type { CSSProperties } from "react";
import {
  type OnResize,
  type OnResizeEnd,
  type OnResizeStart,
  type ShouldResize,
  XY_RESIZER_HANDLE_POSITIONS,
} from "@xyflow/system";
import WidgetResizeControl from "./WidgetResizeControl";

interface WidgetResizerProps {
  nodeId?: string;
  handleClassName?: string;
  handleStyle?: CSSProperties;
  color?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatiosByDirection?: { vertical: number; horizontal: number };
  isVisible?: boolean;
  shouldResize?: ShouldResize;
  onResizeStart?: OnResizeStart;
  onResize?: OnResize;
  onResizeEnd?: OnResizeEnd;
}

const WidgetResizer = ({
  nodeId,
  handleClassName,
  handleStyle,
  color,
  minWidth = 10,
  minHeight = 10,
  maxWidth = Number.MAX_VALUE,
  maxHeight = Number.MAX_VALUE,
  aspectRatiosByDirection,
  isVisible = true,
  shouldResize,
  onResizeStart,
  onResize,
  onResizeEnd,
}: WidgetResizerProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {XY_RESIZER_HANDLE_POSITIONS.map((position) => (
        <WidgetResizeControl
          key={position}
          nodeId={nodeId}
          position={position}
          className={handleClassName}
          style={handleStyle}
          color={color}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          aspectRatiosByDirection={aspectRatiosByDirection}
          shouldResize={shouldResize}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeEnd={onResizeEnd}
        />
      ))}
    </>
  );
};

export default WidgetResizer;
