"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MouseEvent } from "react";

type Props = {
  sectionNumbers: (number | string)[];
};
export const RemoveSectionButton = ({ sectionNumbers }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const params = new URLSearchParams(searchParams);

    let newSectionGroups: number[][] = JSON.parse(
      searchParams.get("sections") as string,
    );
    newSectionGroups = newSectionGroups
      .map((sectionGroup) =>
        sectionGroup.filter((section) => !sectionNumbers.includes(section)),
      )
      .filter((sectionGroup) => sectionGroup.length > 0);

    params.set("sections", JSON.stringify(newSectionGroups));
    replace(`${pathname}?${params.toString()}`); //replaces without rerendering

    e.preventDefault();
  }

  return (
    <button className="text-red-900" onClick={handleClick}>
      X
    </button>
  );
};
