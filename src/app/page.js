import { createSchedules } from "@/lib/schedule";

export default async function Home() {
  const schedules = await createSchedules(["EEL3000", "EGS1006", "HUM2930", "MAC3474", "REL2240"]);

  return (
    <>
      {schedules.map((scheduleData) => (
        <Schedule data={scheduleData} key={scheduleData.id} />
      ))}
    </>
  );
}

const Schedule = ({ data: { id, credits, classes } }) => {
  return (
    <div className="m-3 p-2 bg-slate-950">
      <h1 className="p-2 text-3xl">
        Schedule #{id} ({credits} credits)
      </h1>

      <WeekCalendar classes={classes} />

      {/* <div>
        {classes.map((classData) => (
          <ClassCard key={`${classData.classNumber}`} data={classData} />
        ))}
      </div> */}
    </div>
  );
};

const WeekCalendar = ({ classes }) => {
  let minPeriod = 11;
  let maxPeriod = 1;
  classes.forEach((section) =>
    section.meetTimes.forEach(({ meetPeriodBegin, meetPeriodEnd }) => {
      minPeriod = Math.min(minPeriod, parseInt(meetPeriodBegin));
      maxPeriod = Math.max(maxPeriod, parseInt(meetPeriodEnd));
    })
  );
  const periods = maxPeriod - minPeriod + 1;
  return (
    <div className="grid m-2 max-w-[1000px] border-gray-500 border-dashed border-r-[1px] border-b-[1px]">
      {["MON", "TUE", "WED", "THU", "FRI"].map((dayLable, i) => (
        <div
          className="text-center bg-gray-800 row-start-1 border-gray-500 border-l-[1px] border-dashed"
          style={{ gridColumnStart: i + 2 }}
        >
          {dayLable}
        </div>
      ))}

      {Array(periods)
        .fill(0)
        .map((_, i) => (
          <div
            className="bg-gray-800 col-start-1 text-center align-middle flex items-center justify-center border-gray-500 border-t-[1px] border-dashed min-h-14"
            style={{ gridRowStart: i + 2 }}
          >
            {minPeriod + i}
          </div>
        ))}

      {classes.reduce(
        (arr, section) => [
          ...arr,
          ...section.meetTimes.map((meetTime) =>
            meetTime.meetDays.map((dayLetter) => (
              <div
                className=" bg-black/45 border-slate-500 p-1 border-[1px] border-l-8"
                style={{
                  borderLeftColor: section.color,
                  gridColumnStart: ["M", "T", "W", "R", "F"].indexOf(dayLetter) + 2,
                  gridRowStart: parseInt(meetTime.meetPeriodBegin) - minPeriod + 2,
                  gridRowEnd: parseInt(meetTime.meetPeriodEnd) - minPeriod + 3,
                }}
              >
                <p>
                  <span className="font-bold">{section.course.code}</span>{" "}
                  <span className=" font-light text-s">#{section.classNumber}</span>
                </p>
                <p>
                  {meetTime.meetTimeBegin} - {meetTime.meetTimeEnd}
                </p>
                <p className="">
                  {meetTime.meetBldgCode == "WEB" ? (
                    <span className="">🖥️Online</span>
                  ) : meetTime.meetBldgCode ? (
                    <a className="link" href={`http://campusmap.ufl.edu/?loc=${meetTime.meetBldgCode}`} target="_blank">
                      📍{meetTime.meetBuilding} {meetTime.meetRoom}
                    </a>
                  ) : (
                    <span className="">❓TBA</span>
                  )}
                </p>
              </div>
            ))
          ),
        ],
        []
      )}
    </div>
  );
};

const ClassCard = async ({
  data: {
    color,
    instructors,
    credits,
    classNumber,
    course: { code, name },
    meetTimes,
  },
}) => {
  return (
    <div className=" p-2 m-2 rounded border-slate-500 border-[1px]  border-l-8" style={{ borderLeftColor: color }}>
      <h1 className=" font-bold">
        {code} - {name}
      </h1>
      <p className=" pb-2">Class #{classNumber}</p>
      <p>
        Instructor:{" "}
        {instructors.map((prof, i) => (
          <span key={prof.name}>
            {prof.rating ? (
              <a className="link" href={prof.rating.pageUrl} target="_blank">
                {prof.name}
              </a>
            ) : (
              <span>{prof.name}</span>
            )}
          </span>
        ))}
      </p>
      <p>Credits: {credits}</p>
      <div className="mt-2">
        {meetTimes.map(({ meetDays, meetPeriodBegin, meetPeriodEnd }) => (
          <p key={meetDays.join("") + meetPeriodBegin + meetPeriodEnd}>
            {meetDays.join(",")} |{" "}
            {meetPeriodBegin === meetPeriodEnd
              ? `Period ${meetPeriodBegin}`
              : `Periods ${meetPeriodBegin}-${meetPeriodEnd}`}
          </p>
        ))}
      </div>
    </div>
  );
};
