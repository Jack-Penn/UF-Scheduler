"use client";

import { ChangeEvent } from "react";

interface FormInputProps {
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  control: string;
  required?: boolean;
  helper?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, onChange, control, required = false, helper }) => {
  return (
    <div>
      <div className="bg-black border-[1px] rounded relative mt-3 pr-2 w-80">
        <label className="absolute bg-black form-label text-gray-300 active">{label + (required ? " *" : "")}</label>
        <input
          className="bg-black pl-3 py-2 rounded select-none w-full outline-none z-10"
          defaultValue={control}
          onChange={onChange}
        />
      </div>
      {helper && (
        <div className="flex justify-between text-xs mx-4 mt-1 font-extralight text-gray-300">
          <span>{helper}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
