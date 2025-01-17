import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";
import WidgetNode from "../components/WidgetNode";
import useWidgetNodeDrag from "../../hooks/useWidgetNodeDrag";
import { calendarWidgetInitialSize } from "../../../../constants/WidgetSizeConst";

const nodeTypes = {
  widget: WidgetNode,
};

const initialNodes: Node[] = [
  {
    id: "id_1",
    position: { x: 100, y: 100 },
    ...calendarWidgetInitialSize,
    data: { widgetType: "C" },
    type: "widget",
  },
];

const ClassBoardFlow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const { onWidgetNodeDragStart, onWidgetNodeDrag, onWidgetNodeDragEnd } =
    useWidgetNodeDrag();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStart={onWidgetNodeDragStart}
      onNodeDrag={onWidgetNodeDrag}
      onNodeDragStop={onWidgetNodeDragEnd}
    >
      <MiniMap />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

const ClassBoard = () => {
  return (
    <ReactFlowProvider>
      <ClassBoardFlow />
    </ReactFlowProvider>
  );
};

export default ClassBoard;
