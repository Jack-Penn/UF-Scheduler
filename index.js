// https://registrar.ufl.edu/courses/class-times
// https://stackoverflow.com/questions/13257826/efficient-scheduling-of-university-courses
// https://one.uf.edu/soc/

import axios from "axios";
import { Bitmask, timeslotBitmask } from "./bitmask.js";

const myClasses = ["EEL3000", "EGS1006", "HUM2930", "MAC3474"];
// createSchedules(myClasses);

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

  //Performs DFS to Generate All Possible Full and Partial Schedules
  //TODO: fix algorithm to remove subset schedules
  let schedules = [];
  let stack = [
    {
      i: -1,
      bitmask: new Bitmask(55),
      classes: [],
      credits: 0,
    },
  ];
  while (stack.length > 0) {
    const s = stack.pop();

    if (s.classes.length == classes.length) schedules.push(s);

    for (let j = s.i + 1; j < classes.length; j++) {
      const classCode = classes[j];
      const possibleSections = allClassSections[classCode].filter((section) => s.bitmask.notCollides(section.bitmask));
      if (possibleSections.length == 0) {
        schedules.push(s);
      } else {
        possibleSections.forEach((section) =>
          stack.push({
            i: j,
            bitmask: s.bitmask.OR(section.bitmask),
            classes: [...s.classes, section],
            credits: s.credits + section.credits,
          })
        );
      }
    }
  }

  //sorts generagted schedules by credits in ascending order
  schedules.sort(({ credits: c1 }, { credits: c2 }) => {
    return c1 - c2;
  });

  console.log(
    "schedules:\n" +
      schedules
        .map(
          (a) =>
            a.credits +
            " " +
            a.classes.map(({ course: { name } }) => name).join(", ") +
            "\n\t" +
            a.classes.map(({ bitmask, course: { code } }) => code + "\t" + bitmask.toString()).join("\n\t") +
            "\n\t------------------------------\n\t\t" +
            a.bitmask.toString() +
            "\n"
        )
        .join("\n ")
  );

  schedules.map(({ classes }) => classes.map(({ classNumber }) => `#${classNumber}`).join(" "));
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
