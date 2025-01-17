import { ReactNode } from "react";
import WidgetToolbar from "../WidgetToolbar";
import Widget from "../Widget";
import {
  calendarWidgetAspectRatios,
  calendarWidgetMinSize,
} from "../../../../../constants/WidgetSizeConst";
import { WidgetProps } from "../../../types/WidgetProps";

const CalendarWidget = (props: WidgetProps) => {
  const renderContent = (): ReactNode => {
    // const nodeWidth = props.width ?? minHeight;
    // const nodeHeight = props.height ?? minHeight;
    // console.log(`nodeWidth: ${nodeWidth}, nodeHeight: ${nodeHeight}`);

    return <p>Calendar</p>;
  };

  return (
    <>
      <WidgetToolbar
        isSelected={props.selected}
        isDragging={props.dragging}
        onDeleteClick={props.onDeleteClick}
        onSettingsClick={props.onSettingsClick}
      />
      <Widget
        currentWidth={props.width}
        currentHeight={props.height}
        minWidth={calendarWidgetMinSize.width}
        minHeight={calendarWidgetMinSize.height}
        aspectRatiosByDirection={calendarWidgetAspectRatios}
        isSelected={props.selected}
        isDragging={props.dragging}
      >
        {renderContent()}
      </Widget>
    </>
  );
};

export default CalendarWidget;
