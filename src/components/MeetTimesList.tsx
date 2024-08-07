import { MeetTime } from "@/lib/definitions";

interface Props {
  meetTimes: MeetTime[];
}

const MeetTimesList = ({ meetTimes }: Props) => {
  return (
    <>
      {meetTimes.map(
        ({
          meetNo,
          meetDays,
          meetPeriodBegin,
          meetPeriodEnd,
          meetTimeBegin,
          meetTimeEnd,
        }) => (
          <p key={meetNo}>
            {meetDays.join(",")} |
            {meetPeriodBegin === meetPeriodEnd
              ? ` Period ${meetPeriodBegin} `
              : ` Periods ${meetPeriodBegin}-${meetPeriodEnd} `}
            <span className="font-light">
              ({meetTimeBegin} - {meetTimeEnd})
            </span>
          </p>
        ),
      )}
    </>
  );
};

export default MeetTimesList;
