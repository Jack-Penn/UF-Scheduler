"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MouseEvent } from "react";

type Props = {
  text: string;
  sectionNumbers: (number | string)[];
};
export const AddSectionButton = ({ text, sectionNumbers }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const params = new URLSearchParams(searchParams);
    let prevSectionGroups: number[][] = [];
    if (searchParams.has("sections")) {
      prevSectionGroups = JSON.parse(searchParams.get("sections") as string);
      prevSectionGroups = prevSectionGroups
        .map((sectionGroup) =>
          sectionGroup.filter((section) => !sectionNumbers.includes(section)),
        )
        .filter((sectionGroup) => sectionGroup.length > 0);
    }
    const newSectionGroups = [...prevSectionGroups, sectionNumbers];

    params.set("sections", JSON.stringify(newSectionGroups));
    replace(`${pathname}?${params.toString()}`); //replaces without rerendering

    console.log("adding classes");
    return;
  }

  return (
    <button
      className="h-6 w-[120px] justify-center rounded-md bg-white px-3 text-xs font-semibold text-black"
      onClick={handleClick}
    >
      {text}
    </button>
  );
};
