import { ReactNode } from "react";
import * as Styled from "./WidgetToolbar.style.tsx";

interface WidgetToolbarProps {
  items?: (ReactNode | "|")[];
  isSelected?: boolean;
  isDragging?: boolean;
  onDeleteClick?: () => void;
  onSettingsClick?: () => void;
}

const WidgetToolbar = (props: WidgetToolbarProps) => {
  const isSelected = props.isSelected ?? false;
  const isDragging = props.isDragging ?? false;

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
