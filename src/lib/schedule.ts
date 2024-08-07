import axios, { AxiosResponse } from "axios";
import { Bitmask, timeslotBitmask } from "./bitmask";
import stc from "string-to-color";
import {
  Course,
  PERIOD_ORDER,
  ProgramLevels,
  Programs,
  Schedule,
  Section,
  TeacherRating,
} from "./definitions";
import { arrayIntersection } from "./utils";

//Creates Maximal Schedules from groups of class sections
//only one section from each group is permitted in each schedule
export function createSchedules(classes: Section[][]): Schedule[] {
  interface SectionNode extends Section {
    neighbors: SectionNode[];
  }

  //creates graph connections by comparing each section bitmask only once
  let graph: SectionNode[] = []; //stores list of all graph nodes
  //copies and converts Sections to Section Nodes
  const classNodes = classes.reduce<SectionNode[][]>(
    (arr, sectionGroup) => [
      ...arr,
      sectionGroup.map(
        (section) => ({ ...section, neighbors: [] }) as SectionNode,
      ),
    ],
    [],
  );
  classNodes.forEach((sectionGroup, i) => {
    sectionGroup.forEach((section) => {
      //iterates through remaining next section groups
      for (let j = i + 1; j < classes.length; j++) {
        classNodes[j].forEach((otherSection) => {
          if (section.bitmask.notCollides(otherSection.bitmask)) {
            //records sections as mutual connected neighbors
            section.neighbors.push(otherSection);
            otherSection.neighbors.push(section);
          }
        });
      }
      graph.push(section); //adds connected section to graph
    });
  });

  //Bron-Kerbosch Maximal Clique Algorithm for generating schedules
  //TODO: possiblly implement BK pivoting
  //https://www.youtube.com/watch?v=j_uQChgo72I
  let cliques: SectionNode[][] = [];
  //r is current clique, p is potential nodes, x is excluded nodes
  function bronKerbosch(r: SectionNode[], p: SectionNode[], x: SectionNode[]) {
    if (p.length === 0 && x.length === 0) {
      //branch end condition
      //x condition prevents duplicate cliques
      cliques.push(r);
    }

    //iterates through all nodes in p
    while (p.length > 0) {
      const v = p.shift() as SectionNode;
      //recursively compounding set AND opperations ensures subsequent nodes are part of current clique
      bronKerbosch(
        [...r, v],
        arrayIntersection(p, v.neighbors),
        arrayIntersection(x, v.neighbors),
      );
      x.push(v);
    }
  }
  bronKerbosch([], graph, []);

  //creates schedules from cliques
  const schedules: Schedule[] = cliques.map((sections) => ({
    classes: sections.sort(
      (section1, section2) => section1.credits - section2.credits,
    ), //sorts sections by credits in descending order
    credits: sections.reduce<number>(
      (total, section) => total + section.credits,
      0,
    ),
    bitmask: sections.reduce<Bitmask>(
      (total, section) => total.OR(section.bitmask),
      new Bitmask(),
    ),
    id: sections.reduce<number>(
      (total, section) => total + section.classNumber ** 2,
      0,
    ),
  }));
  schedules.sort(
    (schedule1, schedule2) => schedule1.credits - schedule2.credits,
  ); //sorts schedules by credits in descending order

  return schedules;
}

//Queries UF schedule of courses based on search parameters
export type ClassSearchParams = {
  category: Programs;
  "course-code"?: string;
  "course-title"?: string;
  "class-num"?: number | string;
  term: number | string;
  instructor?: string;
  hons?: boolean;
};
export async function searchClasses(
  params: ClassSearchParams,
): Promise<Course[]> {
  type ClassSearchResponse = [
    {
      COURSES: Course[];
      LASTCONTROLNUMBER: number; //TODO: handle pagination
      RETRIEVEDROWS: number;
      TOTALROWS: number;
    },
  ];

  try {
    const data = (
      await axios.get("https://one.uf.edu/apix/soc/schedule", {
        params,
      })
    ).data as ClassSearchResponse;

    const courses = data?.[0]?.COURSES;

    //Adds additional data to Course Section data
    //waits for all courses
    await Promise.all(
      courses.map(async (course) => {
        //waits for all course sections to be parsed
        course.color = stc(course.code); //generates color based on code
        return await Promise.all(
          course.sections.map(async (section) => {
            //Adds Extra Properties to Section Data
            //waits for all instructor data to be retrieved
            await Promise.all(
              section.instructors.map(async (instructor) => {
                instructor.rating = await searchRateMyProfessor(
                  instructor.name,
                );
              }),
            );
            section.bitmask = timeslotBitmask(section.meetTimes);
            section.isWeb = section.meetTimes.some(
              ({ meetBldgCode }) => meetBldgCode == "WEB",
            ); //if any time meets online
            section.meetTimes.forEach((meetTime) => {
              meetTime.beginPeriodIndex = PERIOD_ORDER.indexOf(
                meetTime.meetPeriodBegin,
              );
              meetTime.endPeriodIndex = PERIOD_ORDER.indexOf(
                meetTime.meetPeriodEnd,
              );
            });
            section.course = course;
          }),
        );
      }),
    );

    return courses;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.status);
      console.log(params);
      console.error(error.response);
    } else {
      console.error(error);
    }
    return new Promise((resolve) => {
      resolve([]);
    });
  }
}

//Gets Class Filters
export type ClassFilterData = {
  categories: {
    CODE: "CWSP" | "UFOL" | "IA";
    DESC: string;
  }[];
  progLevels: {
    CODE: ProgramLevels;
    DESC: string;
  };
  terms: {
    CODE: string;
    DESC: string;
    SORT_TERM: number;
  }[];
  departments: {
    CODE: number;
    DESC: string;
  }[];
};
export async function getClassFilters(): Promise<ClassFilterData> {
  const { data }: AxiosResponse<ClassFilterData> = await axios.get(
    "https://one.uf.edu/apix/soc/filters",
  );
  return data;
}

export async function getLatestTerm() {
  return (await getClassFilters()).terms[0];
}

//Gets Rate My Professor Data on Teacher
type RateMyProfessorResult = {
  data: {
    school: {
      id: string;
      name: string;
    };
    search: {
      teachers: {
        edges: {
          node: TeacherRating;
        }[];
      };
    };
  };
};
let searchRateMyProfessorMemoization: { [key: string]: TeacherRating | null } =
  {};
export async function searchRateMyProfessor(
  teacherName: string,
): Promise<TeacherRating | null> {
  if (searchRateMyProfessorMemoization.hasOwnProperty(teacherName)) {
    return searchRateMyProfessorMemoization[teacherName];
  }
  const UF_SCHOOL_CODE = 1100;
  const data = JSON.stringify({
    query: `query TeacherSearchResultsPageQuery(
  $query: TeacherSearchQuery!
  $schoolID: ID
  $includeSchoolFilter: Boolean!
) {
  search: newSearch {
    ...TeacherSearchPagination_search_1ZLmLD
  }
  school: node(id: $schoolID) @include(if: $includeSchoolFilter) {
    __typename
    ... on School {
      name
    }
    id
  }
}
fragment TeacherSearchPagination_search_1ZLmLD on newSearch {
  teachers(query: $query, first: 8, after: "") {
    didFallback
    edges {
      cursor
      node {
        ...TeacherCard_teacher
        id
        __typename
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    resultCount
    filters {
      field
      options {
        value
        id
      }
    }
  }
}
fragment TeacherCard_teacher on Teacher {
  id
  legacyId
  avgRating
  numRatings
  ...CardFeedback_teacher
  ...CardSchool_teacher
  ...CardName_teacher
  ...TeacherBookmark_teacher
}
fragment CardFeedback_teacher on Teacher {
  wouldTakeAgainPercent
  avgDifficulty
}
fragment CardSchool_teacher on Teacher {
  department
  school {
    name
    id
  }
}
fragment CardName_teacher on Teacher {
  firstName
  lastName
}
fragment TeacherBookmark_teacher on Teacher {
  id
  isSaved
}`,
    variables: {
      query: {
        text: teacherName,
        schoolID: "U2Nob29sLTExMDA=",
        fallback: true,
        departmentID: null,
      },
      schoolID: "U2Nob29sLTExMDA=",
      includeSchoolFilter: true,
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.ratemyprofessors.com/graphql",
    headers: {
      Authorization: "Basic dGVzdDp0ZXN0",
      Origin: "https://www.ratemyprofessors.com",
      Referer: `https://www.ratemyprofessors.com/search/professors/${UF_SCHOOL_CODE}?q=${teacherName}`,
      "Content-Type": "application/json",
    },
    data,
  };

  searchRateMyProfessorMemoization[teacherName] = await axios
    .request(config)
    .then(({ data: { data } }: AxiosResponse<RateMyProfessorResult>) => {
      const teacherData = data.search.teachers.edges[0].node; //first result
      //tests if teacher name query matches result first and last name
      if (
        arrayIntersection(teacherName.trim().split(" "), [
          teacherData.firstName,
          teacherData.lastName,
        ]).length > 1
      ) {
        return {
          ...teacherData,
          pageUrl: `https://www.ratemyprofessors.com/professor/${teacherData.legacyId}`,
        };
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  return searchRateMyProfessorMemoization[teacherName];
}
