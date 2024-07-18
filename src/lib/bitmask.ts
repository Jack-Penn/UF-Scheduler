import { DAY_ORDER, MeetTime, PERIOD_ORDER } from "./definitions";

export class Bitmask {
  private bits: boolean[];
  private length: number;

  constructor(param?: boolean[] | number[] | string) {
    if (param === undefined) {
      //Initializes bits with all 0's
      this.length = DAY_ORDER.length * PERIOD_ORDER.length;
      this.bits = new Array(this.length).fill(false);
    } else if (Array.isArray(param)) {
      //Copies truthy array as bits
      this.bits = param.map((val) => !!val);
      this.length = this.bits.length;
    } else if (typeof param === "string") {
      //
      this.bits = param.split("").map((val) => val === "0");
      this.length = this.bits.length;
    } else {
      console.error("Unrecognized Parameter Type: ", param);
      this.bits = [];
      this.length = 0;
    }
  }

  copy(): Bitmask {
    return new Bitmask(this.bits);
  }

  set(bitmask2: Bitmask): void {
    this.length = bitmask2.length;
    this.bits = [...bitmask2.bits];
  }

  setBit(index: number, value: boolean | number): void {
    this.bits[index] = !!value;
  }

  toString(split: string = ""): string {
    return this.bits.map((b) => Number(b)).join(split);
  }

  OR(bitmask2: Bitmask): Bitmask {
    return new Bitmask(this.bits.map((bit1, i) => bit1 || bitmask2.bits[i]));
  }

  count(): number {
    return this.bits.reduce((total, nextBit) => total + Number(nextBit), 0);
  }

  notCollides(bitmask2: Bitmask): boolean {
    return this.OR(bitmask2).count() === this.count() + bitmask2.count();
  }
}

export function timeslotBitmask(meetTimes: MeetTime[]): Bitmask {
  const bitmask = new Bitmask();

  meetTimes.forEach(({ meetDays, beginPeriodIndex, endPeriodIndex }) =>
    meetDays.forEach((dayLetter) => {
      const dayIndex = DAY_ORDER.indexOf(dayLetter) * PERIOD_ORDER.length;
      for (let i = beginPeriodIndex; i <= endPeriodIndex; i++) {
        bitmask.setBit(dayIndex + i, true);
      }
    }),
  );
  return bitmask;
}
