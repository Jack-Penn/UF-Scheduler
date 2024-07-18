import SectionTabs from "@/components/SectionTabs";
import { Schedule } from "@/lib/definitions";
import SectionCard from "./SectionCard";
import WeekCalendar from "./WeekCalendar";

type Props = {
  schedule: Schedule;
};
const ScheduleCard = ({ schedule }: Props) => {
  return (
    <div className="m-3 p-3 rounded bg-slate-950">
      <h1 className="py-2 text-3xl">
        Schedule #{schedule.id} ({schedule.credits} credits)
      </h1>

      <SectionTabs
        tabs={[
          <div>
            {schedule.classes.map((sectionData) => (
              <SectionCard key={sectionData.classNumber} section={sectionData} />
            ))}
          </div>,
          <WeekCalendar classes={schedule.classes} />,
        ]}
        tabLabels={["List", "Week"]}
      />
    </div>
  );
};
export default ScheduleCard;
