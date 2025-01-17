import { NodeProps } from "@xyflow/react";
import { ReactNode } from "react";
import { WidgetType } from "../../types/WidgetType";
import CalendarWidget from "./widgets/CalendarWidget";

interface IWidgetNodeProps extends NodeProps {
  data: {
    widgetType: WidgetType;
  };
}

const WidgetNode = (props: IWidgetNodeProps) => {
  const openSettings = () => {
    console.log("openSettings");
  };

  const deleteWidget = () => {
    console.log("deleteWidget");
  };

  const renderContent = (): ReactNode => {
    const commonProps = {
      ...props,
      openSettings: openSettings,
      deleteWidget: deleteWidget,
    };

    switch (props.data.widgetType) {
      case "C":
        return CalendarWidget(commonProps);
    }
  };

  return <>{renderContent()}</>;
};

export default WidgetNode;
