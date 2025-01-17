import { ReactNode, useMemo } from "react";
import ReactCalendar from "react-calendar";
import WidgetToolbar from "../WidgetToolbar";
import Widget from "../Widget";
import {
  calendarWidgetAspectRatios,
  calendarWidgetMinSize,
} from "../../../../../constants/WidgetSizeConst";
import { WidgetProps } from "../../../types/WidgetProps";
import * as Styled from "./CalendarWidget.style";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CalendarWidget = (props: WidgetProps) => {
  const renderContent = useMemo((): ReactNode => {
    const nodeWidth = props.width ?? calendarWidgetMinSize.width;
    const nodeHeight = props.height ?? calendarWidgetMinSize.height;

    if (nodeWidth > nodeHeight) {
      return <NormalCalendar />;
    }

    return <SimpleCalendar />;
  }, [props.width, props.height]);

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
        {renderContent}
      </Widget>
    </>
  );
};

const NormalCalendar = () => {
  // #. 일(day) 포맷을 numeric 형태로 변환
  const formatDay = (_locale: string | undefined, date: Date): string => {
    return date.toLocaleString("en", { day: "numeric" });
  };

  return (
    <Styled.NormalCalendarContainer>
      <ReactCalendar
        calendarType="iso8601"
        // prevLabel={<img src=""/>}
        // nextLabel={<img src=""/>}
        prev2Label={null}
        next2Label={null}
        formatDay={formatDay}
      />
    </Styled.NormalCalendarContainer>
  );
};

const SimpleCalendar = () => {
  const date = new Date();

  return (
    <Styled.SimpleCalendarContainer>
      <div className={"day"}>Today is {days[date.getDay()]}</div>
      <div className={"date"}>{date.getDate()}</div>
      <div className={"month-year"}>
        {months[date.getMonth()]} {date.getFullYear()}
      </div>
    </Styled.SimpleCalendarContainer>
  );
};

export default CalendarWidget;
