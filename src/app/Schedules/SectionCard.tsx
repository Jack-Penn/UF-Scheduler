import { InstructorsList } from "@/components/InstructorsList";
import MeetTimesList from "@/components/MeetTimesList";
import { Section } from "@/lib/definitions";

type Props = {
  section: Section;
};
const SectionCard = ({ section }: Props) => {
  return (
    <div
      className="my-2 rounded border-l-8 p-2"
      style={{
        borderLeftColor: section.course.color,
        background: `linear-gradient(135deg, color-mix(in srgb, ${section.course.color} 40%, black) 10%, transparent 90%)`,
      }}
    >
      <h1 className="font-bold">
        {section.course.code} - {section.course.name}
      </h1>
      <p className="pb-2">Class #{section.classNumber}</p>
      <InstructorsList instructors={section.instructors} />
      <p>Credits: {section.credits}</p>
      <div className="mt-2">
        <MeetTimesList meetTimes={section.meetTimes} />
      </div>
    </div>
  );
};

export default SectionCard;
