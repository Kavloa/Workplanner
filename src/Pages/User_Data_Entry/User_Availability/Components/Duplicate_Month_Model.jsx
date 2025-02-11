import { useState } from "react";
import axiosClient from "@axios";
import { format } from "date-fns";

export default function Duplicate_Month_Model({
  Employee,
  changefalse,
  selectedEmployee,
  selectedMonth,
  Employee2,
  selectedEmployeeid
}) {
  const currentWeek = format(new Date(), "yyyy-'W'II");
  const formattedSelectedMonth = selectedMonth
    ? format(new Date(selectedMonth), "yyyy-'W'II")
    : currentWeek;
  const [initialWeek, setInitialWeek] = useState(formattedSelectedMonth);

  const [dates, setDates] = useState([{ id: 1, week: "", weekfirst: formattedSelectedMonth }]);

  const handleInputChange = (e, field, id) => {
    if (field === "initialWeek") {
      setInitialWeek(e.target.value);
    } else {
      const updatedDates = dates.map((dateObj) =>
        dateObj.id === id
          ? {
              ...dateObj,
              [field]: e.target.value,
            }
          : dateObj
      );
      setDates(updatedDates);
    }
  };

  const handleAddDate = () => {
    setDates([...dates, { id: Date.now(), week: "", weekfirst: formattedSelectedMonth }]);
  };

  const handleRemoveDate = (id) => {
    const updatedDates = dates.filter((dateObj) => dateObj.id !== id);
    setDates(updatedDates);
  };

  const send = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        initialWeek,
        dates,
      };
      
      console.log(formData);
      const response = await axiosClient.post(
        `duplicate/${selectedEmployee.id}`,
        formData
      );

      if (response.status === 200) {
        Employee();
        changefalse();
        // Employee2(selectedEmployeeid);
        window.location.reload();
      } else {
        console.error(response.data);
        alert("Problem duplicating");
      }
    } catch (error) {
      console.error(error);
      alert("Problem duplicating");
    }
  };

  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="fixed ml-[25%] mt-20 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full flex flex-col justify-center items-start gap-6 max-w-[700px] max-h-full shadow-2xl p-4 bg-white rounded-lg">
          <h1 className=" text-2xl w-full text-left">Duplicate Week</h1>
          <form onSubmit={send}>
            <div className="gap-2  max-h-full p-2 ">
              <div>
              Select the Week you want to duplicate:
              <input
            type="week"
            name="initialWeek"
            value={initialWeek}
            onChange={(e) => handleInputChange(e, "initialWeek")}
            className="px-2 rounded border hourly-rate w-22 ml-16"
          />

              </div>
            </div>
            {dates.map((dateObj) => (
              <div
                key={dateObj.id}
                className="flex flex-row gap-2  max-w-[900px] max-h-[700px]  overflow-auto p-2"
              >
                <div >
                Choose the Week you want to duplicate it to:
                  <input
                    type="week"
                    name={`datefirst-${dateObj.id}`}
                    value={dateObj.datefirst}
                    onChange={(e) =>
                      handleInputChange(e, "datefirst", dateObj.id)
                    }
                    className="rounded border hourly-rate w-22 px-2 ml-5"
                  />
                </div>
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(dateObj.id)}
                    className="px-[9px] py-[5px] border-[0.2px] border-[#c59174] rounded-[4px] text-black-600 "
                  >
                    <svg
                      class="dlt"
                      height="15px"
                      className="text-[#b34700]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1024 1024"
                    >
                      <path
                        fill="currentColor"
                        d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="px-[9px] py-[5px] border-[#00a2e8] border-[1px] mx-1 rounded-[4px]   text-black-600"
                  > <svg
                  fill="#00a2e8"
                  height="15px"
                  viewBox="-1.7 0 20.4 20.4"
                  xmlns="http://www.w3.org/2000/svg"
                  class="cf-icon-svg"
                  stroke="#00a2e8"
                  stroke-width="0.00020400000000000003"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M16.416 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.916 7.917zm-2.958.01a.792.792 0 0 0-.792-.792H9.284V6.12a.792.792 0 1 0-1.583 0V9.5H4.32a.792.792 0 0 0 0 1.584H7.7v3.382a.792.792 0 0 0 1.583 0v-3.382h3.382a.792.792 0 0 0 .792-.791z"></path>
                  </g>
                </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-row gap-2 w-full justify-center mt-6">
      
              <button
                className="border-gray-400 border-[1px] p-1 px-4 rounded-md"
                onClick={changefalse}
              >
                back
              </button>
              <button
            className="bg-white rounded-lg px-2 flex-row flex justify-center items-center text-[#5fec13] border-[#5fec13] border-[1px]  py-0 h-10"
            type="submit">
              <i class="saveicon">
              <svg
                className="w-5 h-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  fill="currentColor"
                  d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896z"
                ></path>
                <path
                  fill="currentColor"
                  d="M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z"
                ></path>
              </svg>
            </i>
            Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
