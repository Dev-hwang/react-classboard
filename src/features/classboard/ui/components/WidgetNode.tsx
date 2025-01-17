import { NodeProps } from "@xyflow/react";
import { ReactNode } from "react";
import { WidgetType } from "../../types/WidgetType";
import CalendarWidget from "./widgets/CalendarWidget";

interface WidgetNodeProps extends NodeProps {
  data: {
    widgetType: WidgetType;
  };
}

const WidgetNode = (props: WidgetNodeProps) => {
  const handleSettingsClick = () => {
    console.log("openSettings");
  };

  const handleDeleteClick = async () => {
    console.log("deleteWidget");
  };

  const renderContent = (): ReactNode => {
    const commonProps = {
      ...props,
      onSettingsClick: handleSettingsClick,
      onDeleteClick: handleDeleteClick,
    };

    switch (props.data.widgetType) {
      case "C":
        return CalendarWidget(commonProps);
    }
  };

  return <>{renderContent()}</>;
};

export default WidgetNode;
