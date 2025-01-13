import { Offset } from "../models/Offset";

/** 포인터가 도중에 멈췄는지 확인하기 위한 상수 */
const kAssumePointerMoveStoppedMilliseconds = 40;

/** 버퍼 사이즈 */
const kSampleBufferSize = 20;

/** velocity 계산을 위한 최소 샘플 수 */
const kMinSampleSize = 3;

interface PositionAtTime {
  time: number;
  position: Offset;
}

const VelocityTracker = () => {
  let _sampleBuffer: Array<PositionAtTime | null> =
    Array(kSampleBufferSize).fill(null);
  let _index = 0;

  // #. position 추가
  const addPosition = (time: number, position: Offset) => {
    // 순환 버퍼: 버퍼는 kSampleBufferSize 크기를 가지며 버퍼 크기를 넘어서는 경우 0 인덱스부터 replace 시킴
    _index += 1;
    if (_index === kSampleBufferSize) {
      _index = 0;
    }
    _sampleBuffer[_index] = { time: time, position: position };
  };

  // #. velocity 계산
  const getVelocity = (): Offset | null => {
    let sampleCount = 0;
    let index = _index;

    const newestSample = _sampleBuffer[index];
    if (!newestSample) {
      return null;
    }

    // 마지막 position 업데이트가 너무 오래되었음
    const elapsedTimeSinceLastUpdate = Date.now() - newestSample.time;
    if (elapsedTimeSinceLastUpdate > kAssumePointerMoveStoppedMilliseconds) {
      return null;
    }

    let previousSample = newestSample;
    let timeDeltaSum = 0;
    let dxSum = 0;
    let dySum = 0;

    do {
      const sample = _sampleBuffer[index];
      if (!sample) break;

      const timeDelta = (sample.time - previousSample.time) / 1000;
      const dx = sample.position.x - previousSample.position.x;
      const dy = sample.position.y - previousSample.position.y;

      timeDeltaSum += timeDelta;
      dxSum += dx;
      dySum += dy;

      previousSample = sample;

      index = (index === 0 ? kSampleBufferSize : index) - 1;
      sampleCount++;
    } while (sampleCount < kSampleBufferSize);

    // 최소 3개 이상의 샘플이 있을 때 velocity 계산
    if (sampleCount >= kMinSampleSize) {
      return {
        x: dxSum / timeDeltaSum,
        y: dySum / timeDeltaSum,
      };
    }

    return null;
  };

  // #. VelocityTracker 데이터 초기화
  const reset = () => {
    _sampleBuffer = Array(kSampleBufferSize).fill(null);
    _index = 0;
  };

  return {
    addPosition: addPosition,
    getVelocity: getVelocity,
    reset: reset,
  };
};

export default VelocityTracker;
