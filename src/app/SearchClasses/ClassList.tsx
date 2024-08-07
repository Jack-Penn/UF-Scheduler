import { DropdownReveal } from "@/components/DropdownReveal";
import { InstructorsList } from "@/components/InstructorsList";
import MeetTimesList from "@/components/MeetTimesList";
import { ClassSearchParams, searchClasses } from "@/lib/schedule";
import { AddSectionButton } from "./AddSectionButton";

interface ClassListProps {
  query: Partial<ClassSearchParams>;
}

const ClassList: React.FC<ClassListProps> = async ({ query }) => {
  if (query.term && query.category) {
    const classData = await searchClasses(query as ClassSearchParams);

    return (
      <div className="space-y-2">
        {classData.map((course) => (
          <div
            className="rounded-xl p-3 shadow-lg"
            style={
              {
                "--tw-shadow-color": `color-mix(in srgb, ${course.color} 50%, black)`,
                "--tw-shadow": "var(--tw-shadow-colored)",
              } as React.CSSProperties
            }
            key={
              course.courseId +
              course.sections.map(({ classNumber }) => classNumber).join()
            }
          >
            <DropdownReveal
              header={
                <>
                  <div className="mb-2 flex justify-between">
                    <h1 className="font-bold">
                      {course.code} - {course.name} - {course.courseId}
                    </h1>
                    <AddSectionButton
                      text="+ Add Course"
                      sectionNumbers={course.sections.map(
                        ({ classNumber }) => classNumber,
                      )}
                    />
                  </div>
                  <p>{course.description}</p>
                </>
              }
            >
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <div
                    className="my-2 flex justify-between rounded border-l-8 p-2 pr-0"
                    style={{
                      borderLeftColor: section.course.color,
                      background: `linear-gradient(135deg, color-mix(in srgb, ${section.course.color} 40%, black) 10%, transparent 90%)`,
                    }}
                    key={section.classNumber}
                  >
                    <div className="space-y-2">
                      <p className="underline decoration-gray-300 decoration-dotted underline-offset-2">
                        Class #{section.classNumber}
                      </p>
                      <InstructorsList instructors={section.instructors} />
                      <MeetTimesList meetTimes={section.meetTimes} />
                      <p>Credits: {section.credits}</p>
                    </div>
                    <AddSectionButton
                      text="+ Add Section"
                      sectionNumbers={[section.classNumber]}
                    />
                  </div>
                ))}
              </div>
            </DropdownReveal>{" "}
          </div>
        ))}
      </div>
    );
  } else {
    return <h1>Error Fetching Courses</h1>;
  }
};

export default ClassList;
