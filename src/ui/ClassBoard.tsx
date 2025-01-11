import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";
import CalendarWidget from "./components/CalendarWidget";

const nodeTypes = {
  calender: CalendarWidget,
};

const initialNodes: Node[] = [
  {
    id: "id_calendar",
    position: { x: 100, y: 100 },
    data: {},
    type: "calender",
  },
];

const ClassBoard = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);

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
    >
      <MiniMap />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export default ClassBoard;
