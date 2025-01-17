import { NodeProps } from "@xyflow/react";

export type WidgetProps = NodeProps & {
  onSettingsClick: () => void;
  onDeleteClick: () => void;
};
