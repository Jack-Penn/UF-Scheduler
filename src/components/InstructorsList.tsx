import { Instructor } from "@/lib/definitions";

type Props = {
  instructors: Instructor[];
};
export const InstructorsList = ({ instructors }: Props) => {
  return (
    <p>
      {`Instructor${instructors.length > 0 ? "s" : ""}: `}
      {instructors.length == 0
        ? "STAFF"
        : instructors
            .sort((prof1, prof2) => prof1.name.localeCompare(prof2.name))
            .map((prof, i) => (
              <span key={prof.name}>
                {prof.rating ? (
                  <a
                    className="link"
                    href={prof.rating.pageUrl}
                    target="_blank"
                  >
                    {prof.name}
                  </a>
                ) : (
                  <span>{prof.name}</span>
                )}
                {i != instructors.length - 1 && ", "}
              </span>
            ))}
    </p>
  );
};
