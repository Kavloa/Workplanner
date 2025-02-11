import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, parseISO } from 'date-fns';

export default function DatePicker({ value, onChange, start }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCalendarClose = () => setIsOpen(false);
  const handleCalendarOpen = () => setIsOpen(true);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const date = new Date(inputValue);
    if (isValid(date)) {
      onChange(format(date, 'dd MMM yyyy'));
    } else {
      onChange(inputValue); // Allow user input for manual correction
    }
    handleCalendarClose(); // Close calendar after manual input
  };

  const minDate = start ? new Date(start) : null;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-md">
        <input
          className="h-[17px] pl-[5px] w-[100px] focus:outline-none rounded-md"
          type="text"
          value={value && isValid(new Date(value)) ? format(new Date(value), 'dd MMM yyyy') : ''}
          onChange={handleInputChange}
          readOnly // Prevent typing
          onFocus={handleCalendarOpen}
        />
      </div>
      {isOpen && (
        <div className="z-10 absolute bg-white shadow-lg">
          <ReactDatePicker
            selected={value && isValid(new Date(value)) ? new Date(value) : null}
            onChange={(date) => {
              onChange(date ? format(date, 'dd MMM yyyy') : '');
              handleCalendarClose(); // Close calendar after selecting a date
            }}
            inline
            onClickOutside={handleCalendarClose}
            dateFormat="dd MMM yyyy"
            minDate={minDate} // Disable all dates before the minimum date
          />
        </div>
      )}
    </div>
  );
}
