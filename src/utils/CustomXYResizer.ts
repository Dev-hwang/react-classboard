import {
  ControlPosition,
  NodeOrigin,
  OnResizeEnd,
  OnResizeStart,
  ResizeDragEvent,
  ShouldResize,
  Transform,
} from "@xyflow/react";
import {
  CoordinateExtent,
  getPointerPosition,
  InternalNodeBase,
  NodeBase,
  NodeLookup,
  OnResize,
  XYPosition,
} from "@xyflow/system";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import {
  getControlDirection,
  getDimensionsAfterResize,
  getResizeDirection,
} from "./CustomXYResizerUtils";

const initPrevValues = { width: 0, height: 0, x: 0, y: 0 };

const initStartValues = {
  ...initPrevValues,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1,
};

export type CustomXYResizerChange = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type CustomXYResizerChildChange = {
  id: string;
  position: XYPosition;
  extent?: "parent" | CoordinateExtent;
};

export type CustomXYResizerParams = {
  domNode: HTMLDivElement;
  nodeId: string;
  getStoreItems: () => {
    nodeLookup: NodeLookup;
    transform: Transform;
    snapGrid?: [number, number];
    snapToGrid: boolean;
    nodeOrigin: NodeOrigin;
    paneDomNode: HTMLDivElement | null;
  };
  onChange: (
    changes: CustomXYResizerChange,
    childChanges: CustomXYResizerChildChange[]
  ) => void;
  onEnd?: () => void;
};

export type CustomXYResizerUpdateParams = {
  controlPosition: ControlPosition;
  boundaries: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  aspectRatiosByDirection: { vertical: number; horizontal: number } | undefined;
  shouldResize: ShouldResize | undefined;
  onResizeStart: OnResizeStart | undefined;
  onResize: OnResize | undefined;
  onResizeEnd: OnResizeEnd | undefined;
};

export type CustomXYResizerInstance = {
  update: (params: CustomXYResizerUpdateParams) => void;
  destroy: () => void;
};

function nodeToParentExtent(node: NodeBase): CoordinateExtent {
  return [
    [0, 0],
    [node.measured!.width!, node.measured!.height!],
  ];
}

function nodeToChildExtent(
  child: NodeBase,
  parent: NodeBase,
  nodeOrigin: NodeOrigin
): CoordinateExtent {
  const x = parent.position.x + child.position.x;
  const y = parent.position.y + child.position.y;
  const width = child.measured!.width! ?? 0;
  const height = child.measured!.height! ?? 0;
  const originOffsetX = nodeOrigin[0] * width;
  const originOffsetY = nodeOrigin[1] * height;

  return [
    [x - originOffsetX, y - originOffsetY],
    [x + width - originOffsetX, y + height - originOffsetY],
  ];
}

const CustomXYResizer = (
  params: CustomXYResizerParams
): CustomXYResizerInstance => {
  const { domNode, nodeId, getStoreItems, onChange, onEnd } = params;
  const selection = select(domNode);

  function update(params: CustomXYResizerUpdateParams) {
    const {
      controlPosition,
      boundaries,
      aspectRatiosByDirection,
      shouldResize,
      onResizeStart,
      onResize,
      onResizeEnd,
    } = params;
    let prevValues = { ...initPrevValues };
    let startValues = { ...initStartValues };

    const controlDirection = getControlDirection(controlPosition);

    let node: InternalNodeBase | undefined = undefined;
    let containerBounds: DOMRect | null = null;
    let childNodes: CustomXYResizerChildChange[] = [];
    let parentNode: InternalNodeBase | undefined = undefined; // Needed to fix expandParent
    let parentExtent: CoordinateExtent | undefined = undefined;
    let childExtent: CoordinateExtent | undefined = undefined;

    const dragHandler = drag<HTMLDivElement, unknown>()
      .on("start", (event: ResizeDragEvent) => {
        const {
          nodeLookup,
          transform,
          snapGrid,
          snapToGrid,
          nodeOrigin,
          paneDomNode,
        } = getStoreItems();
        node = nodeLookup.get(nodeId);

        if (!node) {
          return;
        }

        containerBounds = paneDomNode?.getBoundingClientRect() ?? null;

        const { xSnapped, ySnapped } = getPointerPosition(event.sourceEvent, {
          transform,
          snapGrid,
          snapToGrid,
          containerBounds,
        });

        prevValues = {
          width: node.measured.width ?? 0,
          height: node.measured.height ?? 0,
          x: node.position.x ?? 0,
          y: node.position.y ?? 0,
        };

        startValues = {
          ...prevValues,
          pointerX: xSnapped,
          pointerY: ySnapped,
          aspectRatio: prevValues.width / prevValues.height,
        };

        parentNode = undefined;

        if (node.parentId && (node.extent === "parent" || node.expandParent)) {
          parentNode = nodeLookup.get(node.parentId);
          parentExtent =
            parentNode && node.extent === "parent"
              ? nodeToParentExtent(parentNode)
              : undefined;
        }

        // Collect all child nodes to correct their relative positions when top/left changes
        // Determine the largest minimal extent the parent node is allowed to resize to
        childNodes = [];
        childExtent = undefined;

        for (const [childId, child] of nodeLookup) {
          if (child.parentId === nodeId) {
            childNodes.push({
              id: childId,
              position: { ...child.position },
              extent: child.extent,
            });

            if (child.extent === "parent" || child.expandParent) {
              const extent = nodeToChildExtent(
                child,
                node,
                child.origin ?? nodeOrigin
              );

              if (childExtent) {
                childExtent = [
                  [
                    Math.min(extent[0][0], childExtent[0][0]),
                    Math.min(extent[0][1], childExtent[0][1]),
                  ],
                  [
                    Math.max(extent[1][0], childExtent[1][0]),
                    Math.max(extent[1][1], childExtent[1][1]),
                  ],
                ];
              } else {
                childExtent = extent;
              }
            }
          }
        }

        onResizeStart?.(event, { ...prevValues });
      })
      .on("drag", (event: ResizeDragEvent) => {
        const {
          transform,
          snapGrid,
          snapToGrid,
          nodeOrigin: storeNodeOrigin,
        } = getStoreItems();

        const pointerPosition = getPointerPosition(event.sourceEvent, {
          transform,
          snapGrid,
          snapToGrid,
          containerBounds,
        });
        const childChanges: CustomXYResizerChildChange[] = [];

        if (!node) {
          return;
        }

        const {
          x: prevX,
          y: prevY,
          width: prevWidth,
          height: prevHeight,
        } = prevValues;
        const change: CustomXYResizerChange = {};
        const nodeOrigin = node.origin ?? storeNodeOrigin;

        const { width, height, x, y } = getDimensionsAfterResize(
          startValues,
          controlDirection,
          pointerPosition,
          boundaries,
          nodeOrigin,
          parentExtent,
          childExtent,
          aspectRatiosByDirection
        );

        const isWidthChange = width !== prevWidth;
        const isHeightChange = height !== prevHeight;

        const isXPosChange = x !== prevX && isWidthChange;
        const isYPosChange = y !== prevY && isHeightChange;

        if (
          !isXPosChange &&
          !isYPosChange &&
          !isWidthChange &&
          !isHeightChange
        ) {
          return;
        }

        if (
          isXPosChange ||
          isYPosChange ||
          nodeOrigin[0] === 1 ||
          nodeOrigin[1] === 1
        ) {
          change.x = isXPosChange ? x : prevValues.x;
          change.y = isYPosChange ? y : prevValues.y;

          prevValues.x = change.x;
          prevValues.y = change.y;

          // when top/left changes, correct the relative positions of child nodes
          // so that they stay in the same position
          if (childNodes.length > 0) {
            const xChange = x - prevX;
            const yChange = y - prevY;

            for (const childNode of childNodes) {
              childNode.position = {
                x:
                  childNode.position.x -
                  xChange +
                  nodeOrigin[0] * (width - prevWidth),
                y:
                  childNode.position.y -
                  yChange +
                  nodeOrigin[1] * (height - prevHeight),
              };
              childChanges.push(childNode);
            }
          }
        }

        if (isWidthChange || isHeightChange) {
          change.width = isWidthChange ? width : prevValues.width;
          change.height = isHeightChange ? height : prevValues.height;
          prevValues.width = change.width;
          prevValues.height = change.height;
        }

        // Fix expandParent when resizing from top/left
        if (parentNode && node.expandParent) {
          const xLimit = nodeOrigin[0] * (change.width ?? 0);
          if (change.x && change.x < xLimit) {
            prevValues.x = xLimit;
            startValues.x = startValues.x - (change.x - xLimit);
          }

          const yLimit = nodeOrigin[1] * (change.height ?? 0);
          if (change.y && change.y < yLimit) {
            prevValues.y = yLimit;
            startValues.y = startValues.y - (change.y - yLimit);
          }
        }

        const direction = getResizeDirection(
          prevValues.width,
          prevWidth,
          prevValues.height,
          prevHeight,
          controlDirection.affectsX,
          controlDirection.affectsY
        );

        const nextValues = { ...prevValues, direction };

        const callResize = shouldResize?.(event, nextValues);
        if (callResize === false) {
          return;
        }

        onResize?.(event, nextValues);
        onChange(change, childChanges);
      })
      .on("end", (event: ResizeDragEvent) => {
        onResizeEnd?.(event, { ...prevValues });
        onEnd?.();
      });
    selection.call(dragHandler);
  }

  function destroy() {
    selection.on(".drag", null);
  }

  return { update, destroy };
};

export default CustomXYResizer;
