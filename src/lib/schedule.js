// https://registrar.ufl.edu/courses/class-times
// https://stackoverflow.com/questions/13257826/efficient-scheduling-of-university-courses
// https://one.uf.edu/soc/

import axios from "axios";
import { Bitmask, timeslotBitmask } from "./bitmask.js";
import { arrayIntersection } from "./utils.js";

export async function createSchedules(classes) {
  //Fetches Data for All Classes
  let allClassSections = {};
  //awaits all class data to be found
  await Promise.all(
    classes.map(async (classCode) => {
      allClassSections[classCode] = [];
      const classDataResults = await searchClassCode(classCode);
      await Promise.all(
        classDataResults.map(async (course) => {
          const courseData = {
            ...course,
            sections: undefined,
          };
          await Promise.all(
            course.sections.map(async (section) => {
              const instructors = await Promise.all(
                section.instructors.map(async ({ name }) => ({
                  name,
                  rating: await searchRateMyProfessor(name),
                }))
              );
              allClassSections[classCode].push({
                course: courseData,
                ...section,
                instructors,
                bitmask: timeslotBitmask(section.meetTimes),
              });
            })
          );
        })
      );
    })
  );

  //Bron-Kerbosch Maximal Clique Algorithm for generating schedules
  const g = []; //represents graph
  //creates graph connections by comparing each section bitmask only once
  for (let i = 0; i < classes.length; i++) {
    allClassSections[classes[i]].forEach((thisSection) => {
      thisSection.neighbors ??= []; //nullish coalescing assignment (only if no neighbors initials .neighbors yet)
      for (let j = i + 1; j < classes.length; j++) {
        allClassSections[classes[j]].forEach((otherSection) => {
          if (thisSection.bitmask.notCollides(otherSection.bitmask)) {
            //records sections as  mutual connected  neighbors
            thisSection.neighbors.push(otherSection);
            otherSection.neighbors ??= [];
            otherSection.neighbors.push(thisSection);
          }
        });
      }
      g.push(thisSection);
    });
  }

  //TODO: possiblly implement BK pivoting
  //https://www.youtube.com/watch?v=j_uQChgo72I
  let cliques = [];
  function bronKerbosch(r, p, x) {
    //r is current clique, p is potential nodes, x is excluded nodes
    if (p.length === 0 && x.length === 0) {
      //branch end condition
      //x condition prevents duplicate cliques
      cliques.push(r);
    }

    //iterates through all nodes in p
    while (p.length > 0) {
      const v = p.shift();
      //recursively compounding set AND opperations ensures subsequent nodes are part of current clique
      bronKerbosch([...r, v], arrayIntersection(p, v.neighbors), arrayIntersection(x, v.neighbors));
      x.push(v);
    }
  }
  bronKerbosch([], g, []);

  //removes neighbor data from section objects
  classes.forEach((classCode) => allClassSections[classCode].forEach((section) => delete section.neighbors));

  //creates schedule objects from clique
  const schedules = cliques
    .map((classes) => ({
      classes: classes.sort((class1, class2) => class2.credits - class1.credits), //sorts by credits in descending order
      credits: classes.reduce((total, section) => total + section.credits, 0),
      bitmask: classes.reduce((total, section) => total.OR(section.bitmask), new Bitmask(55)),
      id: classes.reduce((total, section) => total + parseInt(section.classNumber) ** 2, 0),
    }))
    .sort((sch1, sch2) => sch2.credits - sch1.credits); //sorts by credits in descending order

  /*
  console.log(
    schedules
      .map(
        (schedule) =>
          "id: $" +
          schedule.id +
          "\n" +
          schedule.credits +
          "c\t" +
          schedule.classes
            .map(
              ({ credits, classNumber, course: { code, name } }) => `[${credits}c] ${code} #${classNumber} \t${name}`
            )
            .join("\n\t")
      )
      .join("\n\n")
  );
  */

  return schedules;
}

export async function searchClassParams(params) {
  return await axios
    .get("https://one.uf.edu/apix/soc/schedule", {
      params,
    })
    .then(({ data }) => data[0].COURSES);
}
export async function searchClassCode(courseCode) {
  return await searchClassParams({
    category: "CWSP",
    "course-code": courseCode,
    term: 2248,
  });
}

export async function getClassFilters() {
  axios.get("https://one.uf.edu/apix/soc/filters").then(console.log(res));
}

//TODO: check if memoization works
let searchRateMyProfessorMemoization = {};
export async function searchRateMyProfessor(teacherQuery) {
  if (searchRateMyProfessorMemoization.hasOwnProperty(teacherQuery)) {
    return searchRateMyProfessorMemoization[teacherQuery];
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
      query: { text: teacherQuery, schoolID: "U2Nob29sLTExMDA=", fallback: true, departmentID: null },
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
      Referer: `https://www.ratemyprofessors.com/search/professors/${UF_SCHOOL_CODE}?q=${teacherQuery}`,
      "Content-Type": "application/json",
    },
    data,
  };

  searchRateMyProfessorMemoization[teacherQuery] = await axios
    .request(config)
    .then(({ data: { data } }) => {
      const teacherData = data.search.teachers.edges[0].node;
      if (arrayIntersection(teacherQuery.split(" "), [teacherData.firstName, teacherData.lastName]).length > 1) {
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
    });
  return searchRateMyProfessorMemoization[teacherQuery];
}
