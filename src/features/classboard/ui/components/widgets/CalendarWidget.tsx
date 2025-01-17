import { ReactNode } from "react";
import { NodeProps } from "@xyflow/react";
import WidgetToolbar from "../WidgetToolbar";
import Widget from "../Widget";
import {
  calendarWidgetAspectRatios,
  calendarWidgetMinSize,
} from "../../../../../constants/WidgetSizeConst";

interface CalendarWidgetProps extends NodeProps {
  openSettings?: () => void;
  deleteWidget?: () => void;
}

const CalendarWidget = (props: CalendarWidgetProps) => {
  const renderContent = (): ReactNode => {
    // const nodeWidth = props.width ?? minHeight;
    // const nodeHeight = props.height ?? minHeight;
    // console.log(`nodeWidth: ${nodeWidth}, nodeHeight: ${nodeHeight}`);

    return <p>Calendar</p>;
  };

  return (
    <>
      <WidgetToolbar
        onSettingsClick={props.openSettings}
        onDeleteClick={props.deleteWidget}
      />
      <Widget
        minWidth={calendarWidgetMinSize.width}
        minHeight={calendarWidgetMinSize.height}
        aspectRatiosByDirection={calendarWidgetAspectRatios}
      >
        {renderContent()}
      </Widget>
    </>
  );
};

export default CalendarWidget;
