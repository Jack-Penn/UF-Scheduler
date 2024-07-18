"use client";

import FormInput from "@/components/FormInput";
import SearchClassesInput from "./SearchClassesInput";
import { ClassFilterData } from "@/lib/schedule";
import FormDropdown from "@/components/FormDropdown";

type SearchClassesFormProps = {
  filters: ClassFilterData;
};

const SearchClassesForm: React.FC<SearchClassesFormProps> = ({ filters }) => {
  function filterToOptions(filter: { CODE: string; DESC: string }[]) {
    return filter.map(({ CODE, DESC }) => ({ value: CODE, text: DESC }));
  }

  return (
    <div className="space-y-6">
      <SearchClassesInput
        urlParam="term"
        input={
          <FormDropdown label="Term" options={filterToOptions(filters.terms)} control="" onChange={() => {}} required />
        }
      />
      <SearchClassesInput
        urlParam="category"
        input={
          <FormDropdown
            label="Program"
            options={filterToOptions(filters.categories)}
            control=""
            onChange={() => {}}
            required
          />
        }
      />
      <SearchClassesInput
        urlParam="course-code"
        input={<FormInput label="Course #" helper="Example: MAC3474" control="" onChange={() => {}} />}
      />
      <SearchClassesInput
        urlParam="class-num"
        input={<FormInput label="Class #" helper="Example: 15110" control="" onChange={() => {}} />}
      />
      <SearchClassesInput
        urlParam="course-title"
        input={
          <FormInput label="Course Title" helper="Part or all of Title or Keyword" control="" onChange={() => {}} />
        }
      />
      <SearchClassesInput
        urlParam="instructor"
        input={<FormInput label="Instructor" helper="Instructor Last Name" control="" onChange={() => {}} />}
      />
    </div>
  );
};

export default SearchClassesForm;
