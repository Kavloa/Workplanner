import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa'; // Importing an icon

export default function Custom_Date_Picker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleCalendarClose = () => setIsOpen(false);
  const handleCalendarOpen = () => setIsOpen(true);

  return (
    <div className="relative">
      <div className="p-[3px] flex  items-center gap-3 border-[1px] border-gray-300 rounded-md pl-2">
        {/* <FaCalendarAlt className="ml-2" /> Icon */}
        <input
          className="h-8  p-0 pl-2 w-28 border-none focus:outline-none rounded-md"
          type="text"
          value={value ? format(new Date(value), 'dd-MMM-yyyy') : ''}
          onChange={handleInputChange}
          onFocus={handleCalendarOpen}
        />
      </div>
      {isOpen && (
        <div className="z-1 absolute">
          <ReactDatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) => onChange(format(date, 'yyyy-MM-dd'))}
            inline
            onClickOutside={handleCalendarClose}
            dateFormat="dd-MMM-yyyy"
          />
        </div>
      )}
    </div>
  );
}
