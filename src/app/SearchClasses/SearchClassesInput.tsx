"use client";
//https://www.youtube.com/watch?v=QoMHwks6hUA

import { ClassSearchParams } from "@/lib/schedule";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { ChangeEvent, ReactElement } from "react";

type SearchClassesInputProps = {
  urlParam: keyof ClassSearchParams;
  input: ReactElement<{
    control: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => any;
  }>;
};

const SearchClassesInput: React.FC<SearchClassesInputProps> = ({ urlParam, input }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set(urlParam, searchTerm);
    } else {
      params.delete(urlParam);
    }
    replace(`${pathname}?${params.toString()}`); //replaces without rerendering
  };

  return (
    <>
      {React.cloneElement(input, {
        //pass handle search down to input element
        control: searchParams.get(urlParam)?.toString() ?? "",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value),
      })}
    </>
  );
};

export default SearchClassesInput;
