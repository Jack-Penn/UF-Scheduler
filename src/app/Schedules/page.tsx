import { Programs, Section } from "@/lib/definitions";
import { createSchedules, getLatestTerm, searchClasses } from "@/lib/schedule";
import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";
import ScheduleCard from "./ScheduleCard";

type PageProps = {
  searchParams: {
    "section-groups"?: string;
    "required-sections"?: string;
    term?: string;
    program?: string;
  };
};

// http://localhost:3000/Schedules?section-groups=%5B%5B14622%5D%2C%5B28425%5D%2C%5B11578%5D%2C%5B12714%5D%2C%5B13926%5D%5D&term=2248&category=CWSP
export default async function Page({ searchParams }: PageProps) {
  if (searchParams?.["section-groups"]) {
    searchParams.term ??= (await getLatestTerm()).CODE;
    searchParams.program ??= "CWSP";

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
              category: searchParams.program as Programs,
              term: searchParams.term as string,
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

    const searchClassesQueryParams = new URLSearchParams({
      sections: searchParams["section-groups"],
      term: `${searchParams.term}`,
      category: searchParams.program,
    });

    return (
      <>
        <h1 className="text-xl">
          {schedules.length} Matching Schedule{schedules.length > 1 ? "s" : ""}
        </h1>
        <Link
          className="link"
          href={`/SearchClasses?${searchClassesQueryParams.toString()}`}
        >
          Add More Classes
        </Link>
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
          <Link className="link" href="/SearchClasses${}">
            /SearchClasses Page
          </Link>
        </h1>
      </>
    );
  }
}
