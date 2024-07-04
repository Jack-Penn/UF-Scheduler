// https://registrar.ufl.edu/courses/class-times
// https://stackoverflow.com/questions/13257826/efficient-scheduling-of-university-courses
// https://one.uf.edu/soc/

import axios from "axios";
import { Bitmask, timeslotBitmask } from "./bitmask.js";
import { arrayIntersection } from "./utils.js";

const myClasses = ["EEL3000", "EGS1006", "HUM2930", "MAC3474"];
createSchedules(myClasses);

async function createSchedules(classes) {
  //Fetches Data for All Classes
  let allClassSections = {};
  await Promise.all(
    //waits for all class data to be found
    classes.map(async (classCode) => {
      allClassSections[classCode] = [];
      const classDataResults = await searchClassCode(classCode);
      classDataResults.forEach((course) => {
        const courseData = {
          ...course,
          sections: undefined,
        };
        course.sections.forEach((section) =>
          allClassSections[classCode].push(
            // More Simple Testing Section Object
            // {
            //   name: course.name,
            //   number: section.number,
            //   bitmask: timeslotBitmask(section.meetTimes),
            // }
            {
              course: courseData,
              ...section,
              bitmask: timeslotBitmask(section.meetTimes),
            }
          )
        );
      });
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

  let cliques = [];
  function bronKerbosch(r, p, x) {
    //r is current clique, p is potential nodes, x is excluded nodes
    if (p.length === 0 && x.length === 0) {
      //BK branch end condition
      cliques.push(r);
    }

    while (p.length > 0) {
      //used to iterate through all nodes in p
      const v = p.shift();
      bronKerbosch([...r, v], arrayIntersection(p, v.neighbors), arrayIntersection(x, v.neighbors));
      x.push(v);
    }
  }
  bronKerbosch([], g, []);

  //creates schedule objects from clique
  const schedules = cliques
    .map((classes) => ({
      classes: classes.sort((class1, class2) => class2.credits - class1.credits), //sorts by credits in descending order
      credits: classes.reduce((total, section) => total + section.credits, 0),
      bitmask: classes.reduce((total, section) => total.OR(section.bitmask), new Bitmask(55)),
      id: classes.reduce((total, section) => total + parseInt(section.classNumber) ** 2, 0),
    }))
    .sort((sch1, sch2) => sch1.credits - sch2.credits); //sorts by credits in ascending order

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
}

async function searchClassParams(params) {
  return await axios
    .get("https://one.uf.edu/apix/soc/schedule", {
      params,
    })
    .then(({ data }) => data[0].COURSES);
}
async function searchClassCode(courseCode) {
  return await searchClassParams({
    category: "CWSP",
    "course-code": courseCode,
    term: 2248,
  });
}
searchRateMyProfessor("Sollenberger").then(console.log);

async function searchRateMyProfessor(teacherQuery) {
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

  return await axios
    .request(config)
    .then(({ data: { data } }) => {
      const teacherData = data.search.teachers.edges[0].node;
      return {
        ...teacherData,
        fullName: `${teacherData.firstName} ${teacherData.lastName}`,
        pageUrl: `https://www.ratemyprofessors.com/professor/${teacherData.legacyId}`,
      };
    })
    .catch((error) => {
      console.log(error);
    });
}
