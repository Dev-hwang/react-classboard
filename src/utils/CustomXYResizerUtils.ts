import { ControlPosition, NodeOrigin } from "@xyflow/react";
import { CoordinateExtent, getPointerPosition } from "@xyflow/system";

export function getResizeDirection(
  width: number,
  prevWidth: number,
  height: number,
  prevHeight: number,
  affectsX: boolean,
  affectsY: boolean
) {
  const deltaWidth = width - prevWidth;
  const deltaHeight = height - prevHeight;

  const direction = [
    deltaWidth > 0 ? 1 : deltaWidth < 0 ? -1 : 0,
    deltaHeight > 0 ? 1 : deltaHeight < 0 ? -1 : 0,
  ];
  if (deltaWidth && affectsX) {
    direction[0] = direction[0] * -1;
  }
  if (deltaHeight && affectsY) {
    direction[1] = direction[1] * -1;
  }

  return direction;
}

export function getControlDirection(controlPosition: ControlPosition) {
  const isHorizontal =
    controlPosition.includes("right") || controlPosition.includes("left");
  const isVertical =
    controlPosition.includes("bottom") || controlPosition.includes("top");
  const affectsX = controlPosition.includes("left");
  const affectsY = controlPosition.includes("top");

  return {
    isHorizontal,
    isVertical,
    affectsX,
    affectsY,
  };
}

type PrevValues = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type StartValues = PrevValues & {
  pointerX: number;
  pointerY: number;
  aspectRatio: number;
};

function getLowerExtentClamp(lowerExtent: number, lowerBound: number) {
  return Math.max(0, lowerBound - lowerExtent);
}

function getUpperExtentClamp(upperExtent: number, upperBound: number) {
  return Math.max(0, upperExtent - upperBound);
}

function getSizeClamp(size: number, minSize: number, maxSize: number) {
  return Math.max(0, minSize - size, size - maxSize);
}

export function getDimensionsAfterResize(
  startValues: StartValues,
  controlDirection: ReturnType<typeof getControlDirection>,
  pointerPosition: ReturnType<typeof getPointerPosition>,
  boundaries: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  },
  nodeOrigin: NodeOrigin,
  extent?: CoordinateExtent,
  childExtent?: CoordinateExtent,
  aspectRatiosByDirection?: { vertical: number; horizontal: number }
) {
  const { affectsX, affectsY } = controlDirection;
  const { isHorizontal, isVertical } = controlDirection;
  const { xSnapped, ySnapped } = pointerPosition;
  const { minWidth, maxWidth, minHeight, maxHeight } = boundaries;

  const {
    x: startX,
    y: startY,
    width: startWidth,
    height: startHeight,
  } = startValues;
  let distX = Math.floor(isHorizontal ? xSnapped - startValues.pointerX : 0);
  let distY = Math.floor(isVertical ? ySnapped - startValues.pointerY : 0);

  const newWidth = startWidth + (affectsX ? -distX : distX);
  const newHeight = startHeight + (affectsY ? -distY : distY);

  const originOffsetX = -nodeOrigin[0] * startWidth;
  const originOffsetY = -nodeOrigin[1] * startHeight;

  // Check if maxWidth, minWWidth, maxHeight, minHeight are restricting the resize
  let clampX = getSizeClamp(newWidth, minWidth, maxWidth);
  let clampY = getSizeClamp(newHeight, minHeight, maxHeight);

  // Check if extent is restricting the resize
  if (extent) {
    let xExtentClamp = 0;
    let yExtentClamp = 0;

    if (affectsX && distX < 0) {
      xExtentClamp = getLowerExtentClamp(
        startX + distX + originOffsetX,
        extent[0][0]
      );
    } else if (!affectsX && distX > 0) {
      xExtentClamp = getUpperExtentClamp(
        startX + newWidth + originOffsetX,
        extent[1][0]
      );
    }

    if (affectsY && distY < 0) {
      yExtentClamp = getLowerExtentClamp(
        startY + distY + originOffsetY,
        extent[0][1]
      );
    } else if (!affectsY && distY > 0) {
      yExtentClamp = getUpperExtentClamp(
        startY + newHeight + originOffsetY,
        extent[1][1]
      );
    }

    clampX = Math.max(clampX, xExtentClamp);
    clampY = Math.max(clampY, yExtentClamp);
  }

  // Check if the child extent is restricting the resize
  if (childExtent) {
    let xExtentClamp = 0;
    let yExtentClamp = 0;

    if (affectsX && distX > 0) {
      xExtentClamp = getUpperExtentClamp(startX + distX, childExtent[0][0]);
    } else if (!affectsX && distX < 0) {
      xExtentClamp = getLowerExtentClamp(startX + newWidth, childExtent[1][0]);
    }

    if (affectsY && distY > 0) {
      yExtentClamp = getUpperExtentClamp(startY + distY, childExtent[0][1]);
    } else if (!affectsY && distY < 0) {
      yExtentClamp = getLowerExtentClamp(startY + newHeight, childExtent[1][1]);
    }

    clampX = Math.max(clampX, xExtentClamp);
    clampY = Math.max(clampY, yExtentClamp);
  }

  distY = distY + (distY < 0 ? clampY : -clampY);
  distX = distX + (distX < 0 ? clampX : -clampX);

  const x = affectsX ? startX + distX : startX;
  const y = affectsY ? startY + distY : startY;

  let calculatedWidth = startWidth + (affectsX ? -distX : distX);
  let calculatedHeight = startHeight + (affectsY ? -distY : distY);
  let calculatedX = nodeOrigin[0] * distX * (!affectsX ? 1 : -1) + x;
  let calculatedY = nodeOrigin[1] * distY * (!affectsY ? 1 : -1) + y;

  // aspectRatiosByDirection(horizontal, vertical) 값이 주어진 경우 위젯 크기는 일정 비율 이상 늘어나지 않도록 함
  // 비율 유지에 따라 위젯 크기가 달라지면 노드 좌표도 달라지므로 크기 변화량(delta)을 계산하여 노드 좌표 보정 필요
  const ratio = calculatedWidth / calculatedHeight;
  if (
    aspectRatiosByDirection != null &&
    ratio <= aspectRatiosByDirection.vertical
  ) {
    const newWidth = calculatedHeight * aspectRatiosByDirection.vertical;

    // 너비 변화에 따른 X축 보정
    // affectsX(true), affectsY(false): 좌측 하단 컨트롤 사용
    // affectsX(true), affectsY(true): 좌측 상단 컨트롤 사용
    if ((affectsX && !affectsY) || (affectsX && affectsY)) {
      const deltaX = calculatedWidth - newWidth;
      calculatedX += deltaX;
    }

    calculatedWidth = newWidth;
  }
  if (
    aspectRatiosByDirection != null &&
    ratio >= aspectRatiosByDirection.horizontal
  ) {
    const newHeight = calculatedWidth / aspectRatiosByDirection.horizontal;

    // 높이 변화에 따른 Y축 보정
    // affectsX(false), affectsY(true): 우측 상단 컨트롤 사용
    // affectsX(true), affectsY(true): 좌측 상단 컨트롤 사용
    if ((!affectsX && affectsY) || (affectsX && affectsY)) {
      const deltaY = calculatedHeight - newHeight;
      calculatedY += deltaY;
    }

    calculatedHeight = newHeight;
  }

  return {
    width: calculatedWidth,
    height: calculatedHeight,
    x: calculatedX,
    y: calculatedY,
  };
}
