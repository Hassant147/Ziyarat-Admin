import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SearchBar = ({ selectedDate, onDateChange }) => {
  return (
    <div className="w-full sm:w-[230px]">
      <label
        htmlFor="approval-date"
        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-300"
      >
        Filter by Date
      </label>
      <DatePicker
        id="approval-date"
        selected={selectedDate}
        onChange={onDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select a date"
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
