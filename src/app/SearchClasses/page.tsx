import { ClassSearchParams, getClassFilters } from "@/lib/schedule";
import ClassList from "./ClassList";
import SearchClasses from "./SearchClasses";
import Link from "next/link";
import { DropdownReveal } from "@/components/DropdownReveal";
import { RemoveSectionButton } from "./RemoveSectionButton";

interface PageProps {
  searchParams?: SearchParams;
}
interface SearchParams extends Partial<ClassSearchParams> {
  sections?: string;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const query = {
    term: searchParams?.term,
    category: searchParams?.category,
    "course-code": searchParams?.["course-code"],
    "course-title": searchParams?.["course-title"],
    "class-num": searchParams?.["class-num"],
    instructor: searchParams?.instructor,
  };

  const sectionGroups: string[][] =
    searchParams?.sections && JSON.parse(searchParams.sections);
  const scheduleQueryParams = new URLSearchParams({
    "section-groups": searchParams?.sections ?? "[]",
    term: searchParams?.term ? `${searchParams.term}` : "",
    category: searchParams?.category ?? "",
  });

  const filters = await getClassFilters();

  return (
    <div className="m-2 flex flex-row space-x-6">
      <div>
        <h1 className="text-xl">Search Classes 🔎</h1>
        <SearchClasses filters={filters} />
        {searchParams?.sections && (
          <div className="p-3">
            {/* <Link
              className="link"
              href={`/SearchClasses${(new URLSearchParams(searchParams))}`}
            >
              Remove All Sections
            </Link> */}
            <h1 className="text-xl">My Classes 📚</h1>
            {sectionGroups.map((sectionGroup, i) =>
              sectionGroup.length > 1 ? (
                <DropdownReveal
                  key={i}
                  header={
                    <div className="mr-4 flex justify-between">
                      <div className="space-x-2">
                        <RemoveSectionButton sectionNumbers={sectionGroup} />
                        <span>
                          {sectionGroup.slice(0, 4).join(", ") +
                            (sectionGroup.length > 4 ? "..." : "")}
                        </span>
                      </div>
                      <span>({sectionGroup.length})</span>
                    </div>
                  }
                >
                  <div>
                    {sectionGroup.map((sectionCode, i) => (
                      <div className="space-x-2 pl-2" key={i}>
                        <RemoveSectionButton sectionNumbers={[sectionCode]} />
                        <span>{sectionCode}</span>
                      </div>
                    ))}
                  </div>
                </DropdownReveal>
              ) : (
                <div className="space-x-2" key={i}>
                  <RemoveSectionButton sectionNumbers={sectionGroup} />
                  <span>{sectionGroup[0]}</span>
                </div>
              ),
            )}
            <Link
              className="link"
              href={`/Schedules?${scheduleQueryParams.toString()}`}
            >
              Generate Schedules
            </Link>
          </div>
        )}
      </div>
      <div>
        <h1 className="text-xl">Schedule of Courses 📓</h1>
        <ClassList query={query} />
      </div>
    </div>
  );
};

export default Page;
