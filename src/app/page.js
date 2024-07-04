import { createSchedules, searchRateMyProfessor } from "@/lib/schedule";

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
    <div className="m-3 p-2 bg-slate-800/35">
      <h1 className=" text-3xl">
        Schedule #{id} ({credits} credits)
      </h1>

      <div>
        {classes.map((classData) => (
          <ClassCard key={`${classData.classNumber}`} data={classData} />
        ))}
      </div>
    </div>
  );
};

const ClassCard = async ({
  data: {
    instructors,
    credits,
    classNumber,
    course: { code, name },
    meetTimes,
  },
}) => {
  return (
    <div className=" p-2 m-2 rounded border-slate-500 border-[1px] border-l-8">
      <h1 className=" font-bold">
        {code} - {name}
      </h1>
      <p className=" pb-2">Class #{classNumber}</p>
      <p>
        Instructor:{" "}
        {instructors.map((prof, i) => (
          <span key={prof.name}>
            {prof.rating ? (
              <a className="underline" href={prof.rating.pageUrl} target="_blank">
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
