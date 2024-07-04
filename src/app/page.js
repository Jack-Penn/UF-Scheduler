import { createSchedules } from "@/lib/schedule";

export default async function Home() {
  const schedules = await createSchedules(["EEL3000", "EGS1006", "HUM2930", "MAC3474"]);

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
    <div className=" m-3">
      <p>
        id:{id}
        {"\t"}credits: {credits}
      </p>
      {classes.map(({ credits, classNumber, course: { code, name } }) => (
        <div key={classNumber}>
          <p>
            [{credits}] {code} #{classNumber}
            {"\t"}
            {name}
          </p>
        </div>
      ))}
    </div>
  );
};
