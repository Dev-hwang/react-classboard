import { ReactNode } from "react";
import { NodeProps } from "@xyflow/react";
import Widget from "./common/Widget";
import WidgetToolbar from "./common/WidgetToolbar";

const minWidth = 100;
const minHeight = 200;
const aspectRatiosByDirection = { vertical: 8 / 16, horizontal: 16 / 8 };

interface ICalendarWidgetProps extends NodeProps {
  openSettings?: () => void;
  deleteWidget?: () => void;
}

const CalendarWidget = (props: ICalendarWidgetProps) => {
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
        minWidth={minWidth}
        minHeight={minHeight}
        aspectRatiosByDirection={aspectRatiosByDirection}
      >
        {renderContent()}
      </Widget>
    </>
  );
};

export default CalendarWidget;
