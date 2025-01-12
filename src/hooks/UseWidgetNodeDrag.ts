import { MouseEvent as ReactMouseEvent, useRef } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { Offset } from "../models/Offset";

/** 항력 계수: 값이 작을수록 감속이 점진적으로 이루어짐 */
const kInteractionEndFrictionCoefficient = 0.0000135;

/** 감속 임계: 값이 작을수록 애니메이션이 부드럽게 작동 */
const kEffectivelyMotionless = 10.0;

function simulatePosition(position: Offset, velocity: Offset): Offset {
  const dragLog = Math.log(kInteractionEndFrictionCoefficient);
  const x = position.x - velocity.x / dragLog;
  const y = position.y - velocity.y / dragLog;
  return { x, y };
}

function simulateDuration(velocity: Offset): number {
  const magnitude = Math.sqrt(
    velocity.x * velocity.x + velocity.y * velocity.y
  );
  const finalTime =
    Math.log(kEffectivelyMotionless / magnitude) /
    Math.log(kInteractionEndFrictionCoefficient / 100);
  return Math.round(finalTime * 1000); // milliseconds
}

function useWidgetNodeDrag() {
  const { updateNode } = useReactFlow();
  const lastTimestamp = useRef(0);
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastVelocity = useRef({ x: 0, y: 0 });
  const requestIdMap = useRef(new Map<string, number>()); // <nodeId, requestId>

  /** ReactFlow onNodeDragStart 이벤트 처리 */
  const onWidgetNodeDragStart = (_: ReactMouseEvent, node: Node) => {
    lastTimestamp.current = Date.now();
    lastPosition.current = node.position;
    lastVelocity.current = { x: 0, y: 0 };
  };

  /** ReactFlow onNodeDrag 이벤트 처리 */
  const onWidgetNodeDrag = (_: ReactMouseEvent, node: Node) => {
    // 평균 가속도 계산
    const timestamp = Date.now();
    const timeDelta = (timestamp - lastTimestamp.current) / 1000;
    if (timeDelta > 0) {
      const position = node.position;
      const dx = position.x - lastPosition.current.x;
      const dy = position.y - lastPosition.current.y;

      lastTimestamp.current = timestamp;
      lastPosition.current = position;
      lastVelocity.current = { x: dx / timeDelta, y: dy / timeDelta };
    }
  };

  /** ReactFlow onNodeDragStop 이벤트 처리 */
  const onWidgetNodeDragEnd = (_: ReactMouseEvent, node: Node) => {
    const endPosition = lastPosition.current;
    const endVelocity = lastVelocity.current;

    // position, duration 시뮬레이션
    const simulatedPosition = simulatePosition(endPosition, endVelocity);
    const simulatedDuration = simulateDuration(endVelocity);

    // animation 요청
    setTimeout(
      () =>
        animateNodePosition(
          node.id,
          endPosition,
          simulatedPosition,
          simulatedDuration
        ),
      0
    );
  };

  /** nodeId에 해당하는 노드를 to 위치로 애니메이션 업데이트를 요청 */
  const animateNodePosition = (
    nodeId: string,
    from: Offset,
    to: Offset,
    duration: number
  ) => {
    // 애니메이션이 이미 실행 중인 경우 애니메이션 취소
    const prevRequestId = requestIdMap.current.get(nodeId);
    if (prevRequestId != null) {
      cancelAnimationFrame(prevRequestId);
    }

    const startTime = performance.now();

    const animate = (time: DOMHighResTimeStamp) => {
      const elapsedTime = time - startTime;
      const t = elapsedTime / duration;

      // animation 완료
      if (t >= 1) {
        updateNode(nodeId, (node) => ({ ...node, position: to }));
        requestIdMap.current.delete(nodeId);
        return;
      }

      // decelerate easing
      const easedT = 1 - Math.pow(1 - t, 3);
      const nextX = from.x + (to.x - from.x) * easedT;
      const nextY = from.y + (to.y - from.y) * easedT;

      updateNode(nodeId, (node) => ({
        ...node,
        position: { x: nextX, y: nextY },
      }));

      const requestId = requestAnimationFrame(animate);
      requestIdMap.current.set(nodeId, requestId);
    };

    const requestId = requestAnimationFrame(animate);
    requestIdMap.current.set(nodeId, requestId);
  };

  return {
    onWidgetNodeDragStart: onWidgetNodeDragStart,
    onWidgetNodeDrag: onWidgetNodeDrag,
    onWidgetNodeDragEnd: onWidgetNodeDragEnd,
  };
}

export default useWidgetNodeDrag;
