import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useNodeId, useStoreApi } from "@xyflow/react";
import {
  type ControlPosition,
  evaluateAbsolutePosition,
  handleExpandParent,
  type NodeChange,
  type NodeDimensionChange,
  type NodePositionChange,
  type OnResize,
  type OnResizeEnd,
  type OnResizeStart,
  ParentExpandChild,
  ResizeControlVariant,
  type ShouldResize,
  XYPosition,
  type XYResizerChange,
  type XYResizerChildChange,
} from "@xyflow/system";
import cc from "classcat";
import CustomXYResizer, {
  CustomXYResizerInstance,
} from "../../../utils/CustomXYResizer";

interface IWidgetResizeControlProps {
  nodeId?: string;
  position?: ControlPosition;
  variant?: ResizeControlVariant;
  className?: string;
  style?: CSSProperties;
  color?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatiosByDirection?: { vertical: number; horizontal: number };
  shouldResize?: ShouldResize;
  onResizeStart?: OnResizeStart;
  onResize?: OnResize;
  onResizeEnd?: OnResizeEnd;
  children?: ReactNode;
}

const WidgetResizeControl = ({
  nodeId,
  position,
  variant = ResizeControlVariant.Handle,
  className,
  style = {},
  children,
  color,
  minWidth = 10,
  minHeight = 10,
  maxWidth = Number.MAX_VALUE,
  maxHeight = Number.MAX_VALUE,
  aspectRatiosByDirection,
  shouldResize,
  onResizeStart,
  onResize,
  onResizeEnd,
}: IWidgetResizeControlProps) => {
  const contextNodeId = useNodeId();
  const id = typeof nodeId === "string" ? nodeId : contextNodeId;
  const store = useStoreApi();
  const resizeControlRef = useRef<HTMLDivElement>(null);
  const defaultPosition =
    variant === ResizeControlVariant.Line ? "right" : "bottom-right";
  const controlPosition = position ?? defaultPosition;

  const resizer = useRef<CustomXYResizerInstance | null>(null);

  useEffect(() => {
    if (!resizeControlRef.current || !id) {
      return;
    }

    if (!resizer.current) {
      resizer.current = CustomXYResizer({
        domNode: resizeControlRef.current,
        nodeId: id,
        getStoreItems: () => {
          const {
            nodeLookup,
            transform,
            snapGrid,
            snapToGrid,
            nodeOrigin,
            domNode,
          } = store.getState();
          return {
            nodeLookup,
            transform,
            snapGrid,
            snapToGrid,
            nodeOrigin,
            paneDomNode: domNode,
          };
        },
        onChange: (
          change: XYResizerChange,
          childChanges: XYResizerChildChange[]
        ) => {
          const { triggerNodeChanges, nodeLookup, parentLookup, nodeOrigin } =
            store.getState();
          const changes: NodeChange[] = [];
          const nextPosition = { x: change.x, y: change.y };
          const node = nodeLookup.get(id);

          if (node && node.expandParent && node.parentId) {
            const origin = node.origin ?? nodeOrigin;
            const width = change.width ?? node.measured.width!;
            const height = change.height ?? node.measured.height!;

            const child: ParentExpandChild = {
              id: node.id,
              parentId: node.parentId,
              rect: {
                width,
                height,
                ...evaluateAbsolutePosition(
                  {
                    x: change.x ?? node.position.x,
                    y: change.y ?? node.position.y,
                  },
                  { width, height },
                  node.parentId,
                  nodeLookup,
                  origin
                ),
              },
            };

            const parentExpandChanges = handleExpandParent(
              [child],
              nodeLookup,
              parentLookup,
              nodeOrigin
            );
            changes.push(...parentExpandChanges);

            // when the parent was expanded by the child node, its position will be clamped at
            // 0,0 when node origin is 0,0 and to width, height if it's 1,1
            nextPosition.x = change.x
              ? Math.max(origin[0] * width, change.x)
              : undefined;
            nextPosition.y = change.y
              ? Math.max(origin[1] * height, change.y)
              : undefined;
          }

          if (nextPosition.x !== undefined && nextPosition.y !== undefined) {
            const positionChange: NodePositionChange = {
              id,
              type: "position",
              position: { ...(nextPosition as XYPosition) },
            };
            changes.push(positionChange);
          }

          if (change.width !== undefined && change.height !== undefined) {
            const dimensionChange: NodeDimensionChange = {
              id,
              type: "dimensions",
              resizing: true,
              setAttributes: true,
              dimensions: {
                width: change.width,
                height: change.height,
              },
            };
            changes.push(dimensionChange);
          }

          for (const childChange of childChanges) {
            const positionChange: NodePositionChange = {
              ...childChange,
              type: "position",
            };
            changes.push(positionChange);
          }

          triggerNodeChanges(changes);
        },
        onEnd: () => {
          const dimensionChange: NodeDimensionChange = {
            id: id,
            type: "dimensions",
            resizing: false,
          };
          store.getState().triggerNodeChanges([dimensionChange]);
        },
      });
    }

    resizer.current.update({
      controlPosition,
      boundaries: {
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
      },
      aspectRatiosByDirection,
      shouldResize,
      onResizeStart,
      onResize,
      onResizeEnd,
    });

    return () => {
      resizer.current?.destroy();
    };
  }, [
    controlPosition,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    shouldResize,
    onResizeStart,
    onResize,
    onResizeEnd,
  ]);

  const positionClassNames = controlPosition.split("-");
  const colorStyleProp =
    variant === ResizeControlVariant.Line ? "borderColor" : "backgroundColor";
  const controlStyle = color ? { ...style, [colorStyleProp]: color } : style;

  return (
    <div
      className={cc([
        "react-flow__resize-control",
        "nodrag",
        ...positionClassNames,
        variant,
        className,
      ])}
      ref={resizeControlRef}
      style={controlStyle}
    >
      {children}
    </div>
  );
};

export default WidgetResizeControl;
