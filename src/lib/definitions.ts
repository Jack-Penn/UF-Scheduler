import { Bitmask } from "./bitmask";

export type Course = {
  code: string;
  courseId: string;
  name: string;
  openSeats: number | null;
  termInd: string;
  description: string;
  prerequisites: string;
  sections: Section[];

  color: string;
};

export type Programs = "CWSP" | "UFOL" | "IA";
export type ProgramLevels =
  | "UGRD"
  | "GRAD"
  | "LAW"
  | "MED"
  | "PHM"
  | "PA"
  | "PROF"
  | "VEM";

export type Section = {
  number: string;
  classNumber: number;
  gradBasis: ProgramLevels;
  acadCareer: ProgramLevels;
  display: string;
  credits: number;
  credits_min: number;
  credits_max: number;
  note: string;
  dNote: string;
  genEd: string[];
  quest: string[];
  sectWeb: string;
  rotateTitle: string;
  deptCode: number;
  deptName: string;
  openSeats: number | null;
  courseFee: number;
  lateFlag: "Y" | "N";
  EEP: "Y" | "N";
  LMS: string;
  instructors: Instructor[];
  meetTimes: MeetTime[];
  addEligible: string;
  grWriting: string;
  finalExam: string;
  dropaddDeadline: string;
  pastDeadline: boolean;
  startDate: string;
  endDate: string;
  waitList: {
    isEligible: string;
    cap: number;
    total: number;
  };

  bitmask: Bitmask;
  course: Course;
  isWeb: boolean;
};

export type Instructor = {
  name: string;
  rating: TeacherRating | null;
};

export type TeacherRating = {
  avgDifficulty: number;
  avgRating: number;
  numRating: number;
  wouldTakeAgainPercent: number;
  department: string;
  firstName: string;
  lastName: string;
  id: string;
  legacyId: number;
  pageUrl: string;
};
export type MeetTime = {
  meetNo: number;
  meetDays: ("M" | "T" | "W" | "R" | "F")[];
  meetTimeBegin: string;
  meetTimeEnd: string;
  meetPeriodBegin: string | "E1" | "E2" | "E3";
  meetPeriodEnd: string | "E1" | "E2" | "E3";
  beginPeriodIndex: number;
  endPeriodIndex: number;
  meetBuilding: string;
  meetBldgCode: string;
  meetRoom: string;
};

export const DAY_ORDER = ["M", "T", "W", "R", "F"];
export const PERIOD_ORDER = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "E1",
  "E2",
  "E3",
];

export type Schedule = {
  classes: Section[];
  credits: number;
  bitmask: Bitmask;
  id: number;
};
