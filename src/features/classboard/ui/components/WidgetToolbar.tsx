import { ReactNode } from "react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import * as Styled from "./WidgetToolbar.style.tsx";

interface WidgetToolbarProps {
  items?: (ReactNode | "|")[];
  onDeleteClick?: () => void;
  onSettingsClick?: () => void;
}

const WidgetToolbar = (props: WidgetToolbarProps) => {
  const nodeId = useNodeId();
  const { getNode } = useReactFlow();
  const node = nodeId == null ? null : getNode(nodeId);

  const isSelected = node?.selected ?? false;
  const isDragging = node?.dragging ?? false;

  return (
    <Styled.CustomNodeToolbar
      isVisible={isSelected}
      $isSelected={isSelected}
      $isDragging={isDragging}
    >
      {props.items?.map((item) =>
        typeof item === "string" ? <Styled.ToolbarDivider /> : item
      )}
      <button onClick={props.onDeleteClick}>🗑️</button>
      <button onClick={props.onSettingsClick}>⚙️</button>
    </Styled.CustomNodeToolbar>
  );
};

export default WidgetToolbar;
