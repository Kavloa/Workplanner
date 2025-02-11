import React from 'react';
import { Dropdown } from 'react-bootstrap';

const Time_Dropdown = ({ value, onChange, name, before, after }) => {
  const data = Array.from({ length: 288 }, (_, index) => {
    const minutes = index * 5;
    const hours = Math.floor(minutes / 60);
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = (minutes % 60 < 10 ? '0' : '') + (minutes % 60);
    return `${formattedHours}:${formattedMinutes}`;
  });
  const startIndex = before ? data.findIndex(item => item === before) : 0;
  const displayData = startIndex !== -1 ? data.slice(startIndex) : data;
  const handleSelectionChange = (selectedItem) => {
    onChange({ target: { value: selectedItem } });
  };

  return (
    <div className='relative'>
      <Dropdown onSelect={handleSelectionChange}>
      <Dropdown.Toggle 
          variant="" 
          id="dropdown-basic" 
          className="border  rounded p-1 text--700"
        >
              {value || '00:00'}
        </Dropdown.Toggle>

        <Dropdown.Menu className="overflow-auto  max-h-[200px] min-w-[50%]">
          {displayData.map((item, index) => {
            const isAfter = after && item >= after;
            const isDisabled = isAfter;

            return (
              <Dropdown.Item
                key={index}
                eventKey={item}
                disabled={isDisabled}
              >
                {item}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Time_Dropdown;
