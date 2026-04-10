import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate("");
  const handleClick = () => {
    navigate(-1);
  };
  return (
    <div>
      <button
        onClick={handleClick}
        type="button"
        class="py-2.5 px-10 me-2 text-sm font-medium text-[#00936c] focus:outline-none bg-white rounded-md border border-gray-200 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
      >
        Back
      </button>
    </div>
  );
};

export default BackButton;
