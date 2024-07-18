import { ClassSearchParams, getClassFilters } from "@/lib/schedule";
import ClassList from "./ClassList";
import SearchClassesForm from "./SearchClassesForm";

type PageProps = {
  searchParams: ClassSearchParams;
};

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const query: ClassSearchParams = {
    term: searchParams["term"],
    category: searchParams["category"],
    "course-code": searchParams["course-code"],
    "course-title": searchParams["course-title"],
    "class-num": searchParams["class-num"],
    instructor: searchParams["instructor"],
  };

  const filters = await getClassFilters();

  return (
    <div className="m-2 flex flex-row space-x-6">
      <div>
        <h1 className="text-xl">Search Classes</h1>
        <SearchClassesForm filters={filters} />
      </div>
      <div>
        <h1 className="text-xl">Schedule of Courses</h1>
        <ClassList query={query} />
      </div>
    </div>
  );
};

export default Page;
