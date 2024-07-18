import { Programs, Section } from "@/lib/definitions";
import { createSchedules, getLatestTerm, searchClasses } from "@/lib/schedule";
import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";
import ScheduleCard from "./ScheduleCard";

type HomePageProps = {
  searchParams: {
    "section-groups"?: string;
    "required-sections"?: string;
    term?: string;
    program?: string;
  };
};

// http://localhost:3001/?section-groups=[[14391,14393,14394],[11812,11813]]
export default async function Home({ searchParams }: HomePageProps) {
  if (searchParams?.["section-groups"]) {
    //Retrieves all Class Section data
    //TODO: use cookies/caching for data
    const sectionGroups: number[][] = JSON.parse(
      searchParams["section-groups"],
    );
    const sectionGroupsData: Section[][] = await Promise.all(
      sectionGroups.map(async (sectionGroup) =>
        Promise.all(
          sectionGroup.map(async (classNum) => {
            const [{ sections }] = await searchClasses({
              "class-num": classNum,
              category: (searchParams.program as Programs) ?? "CWSP",
              term: searchParams.term ?? (await getLatestTerm()).CODE,
            });
            return sections[0];
          }),
        ),
      ),
    );

    let schedules = createSchedules(sectionGroupsData);
    if (searchParams?.["required-sections"]) {
      const requiredSectionCodes: number[][] = JSON.parse(
        searchParams?.["required-sections"],
      );
      //Filters schedules for only those that contain at least one section from each required section group
      schedules = schedules.filter((schedule) => {
        for (const requiredCodeGroup of requiredSectionCodes) {
          const hasSectionFromGroup = requiredCodeGroup.some((requiredCode) =>
            schedule.classes.some(
              (section) => section.classNumber == requiredCode,
            ),
          );
          if (!hasSectionFromGroup) return false;
        }
        return true;
      });
    }

    return (
      <>
        <h1>{schedules.length} Generated Scheduels</h1>
        {schedules.map((scheduleData) => (
          <ScheduleCard schedule={scheduleData} key={scheduleData.id} />
        ))}
      </>
    );
  } else {
    return (
      <>
        <h1>
          There are no class sections specified in the URL. Try adding classes
          from the{" "}
          <Link className="link" href="/SearchClasses">
            /SearchClasses Page
          </Link>
        </h1>
      </>
    );
  }
}
