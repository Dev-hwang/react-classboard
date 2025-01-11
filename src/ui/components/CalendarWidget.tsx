import { ReactNode } from "react";
import { NodeProps } from "@xyflow/react";
import Widget from "./common/Widget";

const minWidth = 100;
const minHeight = 200;

interface ICalendarWidgetProps extends NodeProps {
  delete?: () => void;
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
      <Widget
        minWidth={minWidth}
        minHeight={minHeight}
        aspectRatiosByDirection={{ vertical: 8 / 16, horizontal: 16 / 8 }}
      >
        {renderContent()}
      </Widget>
    </>
  );
};

export default CalendarWidget;
