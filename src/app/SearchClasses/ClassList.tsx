import { InstructorsList } from "@/components/InstructorsList";
import { ClassSearchParams, searchClasses } from "@/lib/schedule";

interface ClassListProps {
  query: ClassSearchParams;
}

const ClassList: React.FC<ClassListProps> = async ({ query }) => {
  try {
    const classData = await searchClasses(query);

    return (
      <div className="space-y-2">
        {classData.map((course) => (
          <div className="p-3" key={course.courseId}>
            <h1 className="font-bold">
              {course.code} - {course.name}
            </h1>
            <p>{course.description}</p>
            <div className="space-y-2">
              {course.sections.map((section) => (
                <div className="p-2" key={section.classNumber}>
                  <p className="underline decoration-gray-300 decoration-dotted underline-offset-2">
                    Class #{section.classNumber}
                  </p>
                  <InstructorsList instructors={section.instructors} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return <h1>Error Fetching Courses</h1>;
  }
};

export default ClassList;
