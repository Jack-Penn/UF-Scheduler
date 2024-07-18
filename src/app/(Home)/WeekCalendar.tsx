import { DAY_ORDER, PERIOD_ORDER, Section } from "@/lib/definitions";

type Props = {
  classes: Section[];
};
const WeekCalendar = ({ classes }: Props) => {
  //Finds min and max period to display on calendar
  let minPeriodIndex = Infinity;
  let maxPeriodIndex = -Infinity;
  classes.forEach((section) =>
    section.meetTimes.forEach(({ beginPeriodIndex, endPeriodIndex }) => {
      minPeriodIndex = Math.min(minPeriodIndex, beginPeriodIndex);
      maxPeriodIndex = Math.max(maxPeriodIndex, endPeriodIndex);
    }),
  );
  const periods = maxPeriodIndex - minPeriodIndex + 1;

  //Generates data for each class meetTime to display on calendar
  const meetTimesData = classes
    .map(
      (section) =>
        section.meetTimes.map((meetTime) =>
          meetTime.meetDays.map((dayLetter) => ({
            dayLetter,
            meetTime,
            section,
          })),
        ),
      [],
    )
    .flat(2);

  return (
    <div className="my-2 grid max-w-[1000px] border-b-[1px] border-r-[1px] border-dashed border-gray-500">
      <div className="bg-gray-800" /> {/*Left Corner Box*/}
      {/*Column Day Labels*/}
      {["MON", "TUE", "WED", "THU", "FRI"].map((dayLabel, i) => (
        <div
          className="row-start-1 border-l-[1px] border-dashed border-gray-500 bg-gray-800 p-1 text-center"
          style={{ gridColumnStart: i + 2 }}
          key={dayLabel}
        >
          {dayLabel}
        </div>
      ))}
      {/*Row Period Labels*/}
      {Array(periods)
        .fill(0)
        .map((_, i) => (
          <div
            className="col-start-1 flex min-h-14 items-center justify-center border-t-[1px] border-dashed border-gray-500 bg-gray-800 p-1 text-center align-middle"
            style={{ gridRowStart: i + 2 }}
            key={i}
          >
            {PERIOD_ORDER[minPeriodIndex + i]}
          </div>
        ))}
      {/*Calendar Class Meeting Labels*/}
      {meetTimesData.map(({ dayLetter, meetTime, section }) => (
        <div
          className="border-l-8 p-2 pt-1"
          style={{
            borderLeftColor: section.course.color,
            gridColumnStart: DAY_ORDER.indexOf(dayLetter) + 2,
            gridRowStart: meetTime.beginPeriodIndex - minPeriodIndex + 2,
            gridRowEnd: meetTime.endPeriodIndex - minPeriodIndex + 3,
            background: `linear-gradient(135deg, color-mix(in srgb, ${section.course.color} 40%, black) 10%, transparent 90%)`,
          }}
          key={section.classNumber}
        >
          <p>
            <span className="font-bold">{section.course.code}</span>{" "}
            <span className="text-s font-light">#{section.classNumber}</span>
          </p>
          <p>
            {meetTime.meetTimeBegin} - {meetTime.meetTimeEnd}
          </p>
          <p className="">
            {meetTime.meetBldgCode ? (
              meetTime.meetBldgCode == "WEB" ? (
                <span>🖥️Online</span>
              ) : (
                <a
                  className="link"
                  href={`http://campusmap.ufl.edu/?loc=${meetTime.meetBldgCode}`}
                  target="_blank"
                >
                  📍{meetTime.meetBuilding} {meetTime.meetRoom}
                </a>
              )
            ) : (
              <span className="">❓TBA</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default WeekCalendar;
