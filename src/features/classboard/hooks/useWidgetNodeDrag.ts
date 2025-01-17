import { MouseEvent as ReactMouseEvent, useRef } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { Offset } from "../interfaces/Offset";
import VelocityTracker from "../utils/VelocityTracker";

/** 항력 계수: 값이 작을수록 감속이 점진적으로 이루어짐 */
const kInteractionEndFrictionCoefficient = 0.0000135;

/** 감속 임계 */
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
  const velocityTracker = useRef(VelocityTracker());
  const requestIdMap = useRef(new Map<string, number>()); // <nodeId, requestId>

  /** ReactFlow onNodeDragStart 이벤트 처리 */
  const onWidgetNodeDragStart = (_: ReactMouseEvent, node: Node) => {
    velocityTracker.current.reset();
    velocityTracker.current.addPosition(Date.now(), node.position);
  };

  /** ReactFlow onNodeDrag 이벤트 처리 */
  const onWidgetNodeDrag = (_: ReactMouseEvent, node: Node) => {
    velocityTracker.current.addPosition(Date.now(), node.position);
  };

  /** ReactFlow onNodeDragStop 이벤트 처리 */
  const onWidgetNodeDragEnd = (_: ReactMouseEvent, node: Node) => {
    const endPosition = node.position;
    const endVelocity = velocityTracker.current.getVelocity();
    if (!endVelocity) {
      return;
    }

    // position, duration 시뮬레이션
    const simulatedPosition = simulatePosition(endPosition, endVelocity);
    const simulatedDuration = simulateDuration(endVelocity);
    if (simulatedDuration < 0) {
      return;
    }

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
