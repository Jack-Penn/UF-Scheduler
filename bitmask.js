export class Bitmask {
  constructor() {
    if (typeof arguments[0] === "number") {
      this.length = arguments[0];
      this.bits = new Array(this.length).fill(false);
    } else if (Array.isArray(arguments[0])) {
      this.bits = arguments[0].map((val) => !!val);
      this.length = this.bits.length;
    } else if (typeof arguments[0] === "string") {
      this.bits = arguments[0].split("").map((val) => val == "0");
      this.length = this.bits.length;
    } else {
      console.error("Unrecognized Parameter Types: ", arguments[0], arguments);
    }
  }
  copy() {
    return new Bitmask(this.bits);
  }
  set(bitmask2) {
    this.length = bitmask2.length;
    this.bits = [...bitmask2.bits];
  }
  setBit(index, value) {
    this.bits[index] = !!value;
  }
  toString(split = "") {
    return this.bits.map((b) => b + 0).join(split);
  }
  OR(bitmask2) {
    return new Bitmask(this.bits.map((bit1, i) => bit1 || bitmask2.bits[i]));
  }
  count() {
    return this.bits.reduce((total, nextBit) => total + nextBit, 0);
  }
  notCollides(bitmask2) {
    return this.OR(bitmask2).count() == this.count() + bitmask2.count();
  }
}

//index to map day letter to index of day of work week
const DAY_ORDER = "MTWRF".split("").reduce((obj, dayLetter, i) => ({ ...obj, [dayLetter]: i }), {});

export function timeslotBitmask(meetTimes) {
  const bitmask = new Bitmask(55);

  meetTimes.forEach(({ meetDays, meetPeriodBegin, meetPeriodEnd }) =>
    meetDays.forEach((dayLetter) => {
      const dayIndex = DAY_ORDER[dayLetter] * 11;
      for (let i = meetPeriodBegin - 1; i < meetPeriodEnd; i++) {
        bitmask.setBit(dayIndex + i, 1);
      }
    })
  );
  return bitmask;
}
