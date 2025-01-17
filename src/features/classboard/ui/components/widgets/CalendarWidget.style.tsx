import styled from "styled-components";
import { fadeIn } from "../../../../../styles/animation/fade";
import { WidgetBox } from "../../../../../styles/WidgetBox";
import { FlexBox } from "../../../../../styles/flexbox";

export const NormalCalendarContainer = styled.div`
  ${WidgetBox()};
  animation: ${fadeIn} 0.3s;
  padding: 16px;

  // 라이브러리: https://github.com/wojtekmaj/react-calendar?tab=readme-ov-file
  .react-calendar {
    ${WidgetBox()};

    // 버튼 공통
    button {
      padding: 0;
      margin: 0;

      &:hover {
        cursor: pointer;
      }
    }

    // 달력 네비게이션
    &__navigation {
      display: flex;
      flex-direction: row;

      // CalendarWidget.tsx > NormalCalendar > ReactCalendar > prevLabel, nextLabel 옵션으로 버튼 이미지 커스터마이징 가능
      &__prev-button,
      &__next-button {
        width: 18px;
      }

      // year-month 라벨
      &__label {
        pointer-events: none; // 라벨 누름 이벤트 무시
        font-size: 10px;
      }
    }

    // 달력 컨테이너
    &__viewContainer {
      flex: 1;
      ${FlexBox({ direction: "column" })};
      pointer-events: none; // 날짜 누름 이벤트 무시

      // 월 달력
      .react-calendar__month-view {
        flex: 1;
        ${FlexBox({ direction: "column" })};

        // wrapper 태그 flex 적용
        > div,
        > div > div {
          flex: 1;
          ${FlexBox({ direction: "column", alignItem: "stretch" })};
        }

        // 주(weekday) 목록
        .react-calendar__month-view__weekdays {
          padding: 4px 0;
          margin-top: 8px;
          font-size: 8px;
          text-align: center;
          overflow: hidden;

          abbr {
            text-decoration: none;
          }
        }

        // 일(days) 목록
        .react-calendar__month-view__days {
          flex: 1;
          font-size: 10px;
          text-align: center;
          overflow: hidden;

          // 주말(토, 일) 타일
          .react-calendar__month-view__days__day--weekend {
            //color: red;
          }

          // 이웃 month 타일
          .react-calendar__month-view__days__day--neighboringMonth {
            background: #f3f3f3;
            color: #cccccc;
          }

          // 오늘 타일
          .react-calendar__tile--now {
            background: #6466ed;
            color: white;
          }
        }
      }
    }
  }
`;

export const SimpleCalendarContainer = styled.div`
  ${WidgetBox()};
  animation: ${fadeIn} 0.3s;
  padding: 16px;

  div {
    ${FlexBox({ justify: "center", alignItem: "center" })};
    text-align: center;
    word-break: break-word;
    font-size: 14px;
    font-weight: bold;

    &.day {
      flex: 3;
    }

    &.date {
      flex: 7;
      font-size: 68px;
      color: #6466ed;
    }

    &.month-year {
      flex: 2;
    }
  }
`;
