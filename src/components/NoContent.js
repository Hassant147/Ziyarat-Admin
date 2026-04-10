import React from 'react';
import icon from '../assets/NoBookingIcon.svg';

const NoContent = () => {
  return (
    <div className="flex flex-col justify-center items-center text-center h-96 bg-white mx-auto w-full">
      <img src={icon} alt="No Bookings Icon" className="w-24 h-24" />
      <p className="mt-4 text-lg text-gray-500">Oops, You have no Content yet.</p>
    </div>
  );
};

export default NoContent;
