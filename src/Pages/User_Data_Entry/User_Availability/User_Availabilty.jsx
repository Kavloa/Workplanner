import { Input } from "@material-tailwind/react";
import { useEffect, useState, useMemo, useRef } from "react";
import axiosClient from "@axios";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Duplicate_Month_Model from "./Components/Duplicate_Month_Model";
import "react-datepicker/dist/react-datepicker.css";
import Custom_Date_Picker from "./Components/Custom_Date_Picker";
import Alert from "@mui/material/Alert";
import "bootstrap/dist/css/bootstrap.min.css";
import Time_Dropdown from "./Components/Time_Dropdown"; //Defaultview
import Edit_Time_Picker from "./Components/Edit_Time_Picker";
import AlertPopup from "./Components/AlertPopup";
import duplicateicon from "./Components/duplicate.png";
import DatePicker from "./Components/DatePicker_Model";
import { Dropdown } from "react-bootstrap";
import { parseISO } from "date-fns";
import { differenceInMinutes } from "date-fns";
import { isSameMonth } from "date-fns";
import { eachDayOfInterval } from "date-fns";
import "@MainStyle";
import Availability_Import_Model from "./Components/Import_Avaliabilty_Model";

export function User_Availabilty() {
  // States
  const [data, setdata] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [availabilities, setAvailabilities] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [message, setmessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [Show_Duplicate_Model, setShow_Duplicate_Model] = useState(false);
  const [Show_Import_Model, setShow_Import_Model] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] =
    useState("Select Employee");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);

  const Open_Duplicate_Modle = () => {
    setShow_Duplicate_Model(true);
  };

  const Close_Duplicate_Model = () => {
    setShow_Duplicate_Model(false);
  };

  const Open_Import_Modle = () => {
    setShow_Import_Model(true);
  };

  const Close_Import_Model = () => {
    setShow_Import_Model(false);
  };

  const handleEmployeeChange = (employeeId) => {
    setAvailabilities([]);
    const employee = data.find((emp) => emp.id === parseInt(employeeId, 10));
    setSelectedEmployeeName(employee.first_name);
    setSelectedEmployee(employee);
    console.log(employee.availabilities);
  };

  const handleStartDateChange = (event) => {
    const newStartDate = event;
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (event) => {
    const newEndDate = event;
    setEndDate(newEndDate);
  };

  const Create_New_Row_Model = () => {
    const newAvailability = generateNewAvailability();
    console.log(newAvailability);

    setAvailabilities((prevAvailabilities) => {
      const updatedAvailabilities = [...prevAvailabilities, newAvailability];
      setSelectedEmployee((prevEmployee) => ({
        ...prevEmployee,
        availabilities: [...prevEmployee.availabilities, newAvailability],
      }));
      return updatedAvailabilities;
    });
  };

  const Duplicate_Row_Model = (availability) => {
    const newAvailability = generateNewAvailability(availability);

    setAvailabilities((prevAvailabilities) => {
      const updatedAvailabilities = [...prevAvailabilities, newAvailability];
      setSelectedEmployee((prevEmployee) => ({
        ...prevEmployee,
        availabilities: [...prevEmployee.availabilities, newAvailability],
      }));
      return updatedAvailabilities;
    });
  };
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const handleInputChange = (selectedTime, availabilityId, field) => {
    setSelectedEmployee((prevEmployee) => {
      const updatedAvailabilities = prevEmployee.availabilities.map(
        (availability) => {
          if (availability.id === availabilityId) {
            const strt1 = convertTimeToMinutes(availability.strt1);
            const end1 = convertTimeToMinutes(availability.end1);
            const strt2 = convertTimeToMinutes(availability.strt2);
            const end2 = convertTimeToMinutes(availability.end2);
            const strt3 = convertTimeToMinutes(availability.strt3);
            const end3 = convertTimeToMinutes(availability.end3);
            const strt4 = convertTimeToMinutes(availability.strt4);
            const end4 = convertTimeToMinutes(availability.end4);
            const selectedTimeInMinutes = convertTimeToMinutes(selectedTime);

            if (field === "strt1") {
              // Example logic: reset all other fields
              return {
                ...availability,
                strt1: selectedTime,
                end1: null,
                strt2: null,
                end2: null,
                strt3: null,
                end3: null,
                strt4: null,
                end4: null,
              };
            }

            // Check conditions based on the field being updated
            if (field === "strt2" && selectedTimeInMinutes < end1) {
              return availability;
            }
            if (field === "strt3" && selectedTimeInMinutes < end2) {
              return availability;
            }

            if (field === "strt4" && selectedTimeInMinutes < end3) {
              return availability;
            }

            if (
              field === "end1" &&
              selectedTimeInMinutes <= convertTimeToMinutes(availability.strt1)
            ) {
              return availability;
            }

            if (
              field === "end2" &&
              selectedTimeInMinutes <= convertTimeToMinutes(availability.strt2)
            ) {
              return availability;
            }
            if (
              field === "end3" &&
              selectedTimeInMinutes <= convertTimeToMinutes(availability.strt3)
            ) {
              return availability;
            }
            if (
              field === "end4" &&
              selectedTimeInMinutes <= convertTimeToMinutes(availability.strt4)
            ) {
              return availability;
            }

            // If validation passes, update the availability
            const updatedAvailability = {
              ...availability,
              [field]: selectedTime,
            };

            // Calculate new total (implement addTime and diff accordingly)
            const newTotal = addTime(
              diff(updatedAvailability.strt1, updatedAvailability.end1),
              diff(updatedAvailability.strt2, updatedAvailability.end2),
              diff(updatedAvailability.strt3, updatedAvailability.end3),
              diff(updatedAvailability.strt4, updatedAvailability.end4)
            );

            return {
              ...updatedAvailability,
              Total: newTotal,
              total_ava: newTotal,
            };
          }
          return availability;
        }
      );

      return {
        ...prevEmployee,
        availabilities: updatedAvailabilities,
      };
    });
  };
  const handleInputChange2 = (e, id, field) => {
    const updatedAvailabilities = availabilities.map((availabil) => {
      if (availabil.id === id) {
        // Convert new value to minutes for comparison
        const newValueInMinutes = convertTimeToMinutes(e.target.value);
        if (
          field === "strt2" &&
          newValueInMinutes < convertTimeToMinutes(availabil.end1)
        ) {
          return availabil;
        }
        if (
          field === "strt3" &&
          newValueInMinutes < convertTimeToMinutes(availabil.end2)
        ) {
          return availabil;
        }
        if (
          field === "strt4" &&
          newValueInMinutes < convertTimeToMinutes(availabil.end3)
        ) {
          return availabil;
        }
        if (
          field === "end1" &&
          newValueInMinutes <= convertTimeToMinutes(availabil.strt1)
        ) {
          return availabil;
        }
        if (
          field === "end2" &&
          newValueInMinutes <= convertTimeToMinutes(availabil.strt2)
        ) {
          return availabil;
        }
        if (
          field === "end3" &&
          newValueInMinutes <= convertTimeToMinutes(availabil.strt3)
        ) {
          return availabil;
        }
        if (
          field === "end4" &&
          newValueInMinutes <= convertTimeToMinutes(availabil.strt4)
        ) {
          return availabil;
        }

        //   if (field === "strt1") {
        //     // Example logic: reset all other fields
        //     return {
        //         ...availabil,
        //         strt1: selectedTime,
        //         strt2: null,
        //         end1: null,
        //         end2: null,
        //         end3: null,
        //         end4: null,
        //         strt3: null,
        //         qrt4: null,
        //     };
        // }
        // Proceed with update if conditions are met
        const updatedAvailability = { ...availabil, [field]: e.target.value };
        const newTotalMinutes = addTime(
          diff(updatedAvailability.strt1, updatedAvailability.end1),
          diff(updatedAvailability.strt2, updatedAvailability.end2),
          diff(updatedAvailability.strt3, updatedAvailability.end3),
          diff(updatedAvailability.strt4, updatedAvailability.end4)
        );
        updatedAvailability.Total = newTotalMinutes;
        updatedAvailability.total_ava = newTotalMinutes;
        return updatedAvailability;
      } else {
        return availabil;
      }
    });

    setAvailabilities(updatedAvailabilities);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    console.log("New Month:", newMonth);

    // Update selected month state
    setSelectedMonth(newMonth);

    // Convert the selected month to Date
    const year = parseInt(newMonth.split("-")[0], 10);
    const month = parseInt(newMonth.split("-")[1], 10) - 1; // JS months are 0-indexed
    console.log("Year:", year);
    console.log("Month:", month);

    // Calculate the start and end dates of the selected month
    const startDate = new Date(year, month, 1); // First day of the month
    const endDate = new Date(year, month + 1, 0); // Last day of the month
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Update startDate and endDate states
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    console.log("Formatted Start Date:", formattedStartDate);
    console.log("Formatted End Date:", formattedEndDate);
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
  };

  // const Create_Missing_Days = () => {
  //   if (!selectedEmployee) return;

  //   const monthStart = startOfMonth(new Date(selectedMonth));
  //   const monthEnd = endOfMonth(new Date(selectedMonth));
  //   const allDates = eachDayOfInterval({
  //     start: monthStart,
  //     end: monthEnd,
  //   }).map((date) => format(date, "yyyy-MM-dd"));

  //   const originalAvailabilities = selectedEmployee.availabilities;

  //   const monthAvailabilities = originalAvailabilities.filter(
  //     (availability) => {
  //       const availabilityDate = new Date(availability.date);
  //       return availabilityDate >= monthStart && availabilityDate <= monthEnd;
  //     }
  //   );

  //   const existingDatesSet = new Set(
  //     monthAvailabilities.map((availability) =>
  //       format(new Date(availability.date), "yyyy-MM-dd")
  //     )
  //   );

  //   // Filter out dates already covered by numeric ID availabilities or temp entries
  //   const missingDates = allDates.filter(
  //     (date) =>
  //       !monthAvailabilities.some(
  //         (availability) =>
  //           format(new Date(availability.date), "yyyy-MM-dd") === date &&
  //           !String(availability.id).startsWith("temp-")
  //       )
  //   );

  //   const defaultAvailabilities = missingDates.map((date) => ({
  //     id: `temp-${date}-${Date.now()}`,
  //     date,
  //     strt1: "",
  //     end1: "",
  //     strt2: "",
  //     end2: "",
  //     strt3: "",
  //     end3: "",
  //     strt4: "",
  //     end4: "",
  //     Total: "00:00",
  //     employee_id: selectedEmployee.id,
  //   }));

  //   const updatedAvailabilities = [
  //     ...originalAvailabilities.filter(
  //       (availability) =>
  //         !String(availability.id).startsWith("temp-") ||
  //         existingDatesSet.has(
  //           format(new Date(availability.date), "yyyy-MM-dd")
  //         )
  //     ),
  //     ...defaultAvailabilities,
  //   ].sort((a, b) => new Date(a.date) - new Date(b.date));

  //   const isDifferent =
  //     JSON.stringify(originalAvailabilities) !==
  //     JSON.stringify(updatedAvailabilities);

  //   if (isDifferent) {
  //     setSelectedEmployee((prev) => ({
  //       ...prev,
  //       availabilities: updatedAvailabilities,
  //     }));
  //   }
  // };

  const Employee = async () => {
    const resp = await axiosClient.get("employees");
    setdata(resp.data.employees);
  };

  const i = useRef(0);
  useEffect(() => {
    if (i.current === 0) {
      Employee();
      i.current += 1;
    }
  });

  useEffect(() => {
    // Create_Missing_Days();
  }, [selectedMonth, selectedEmployee?.id]);

  const Delete_Entry_Pop = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Entry?"
    );
    if (isConfirmed) {
      try {
        let updatedAvailabilities = [];

        if (String(id).startsWith("temp-")) {
          updatedAvailabilities = availabilities.filter(
            (availability) => availability.id !== id
          );
        } else {
          await axiosClient.delete(`availability/${id}`);
          updatedAvailabilities = availabilities.filter(
            (availability) => availability.id !== id
          );
          Employee();
        }

        setAvailabilities(updatedAvailabilities);
        setSelectedEmployee((prevEmployee) => ({
          ...prevEmployee,
          availabilities: prevEmployee.availabilities.filter(
            (availability) => availability.id !== id
          ),
        }));
      } catch (error) {
        alert("There was an error deleting the entry. Please try again.");
      }
    }
  };
  const firstDayOfMonth = selectedMonth ? `${selectedMonth}-01` : "";
  const generateNewAvailability = (availabilityData = {}) => {
    const maxId = Math.max(
      ...selectedEmployee.availabilities.map((a) => a.id),
      0
    );

    const newId = maxId + 1;

    return {
      id: `${newId}`,
      date: firstDayOfMonth || new Date().toISOString().split("T")[0],
      strt1: availabilityData.strt1 || "",
      end1: availabilityData.end1 || "",
      strt2: availabilityData.strt2 || "",
      end2: availabilityData.end2 || "",
      strt3: availabilityData.strt3 || "",
      end3: availabilityData.end3 || "",
      strt4: availabilityData.strt4 || "",
      end4: availabilityData.end4 || "",
      Total: availabilityData.total_ava,
      employee_id: selectedEmployee.id,
    };
  };

  const Delete_Row_Edit = (availability) => {
    const updatedAvailabilities = availabilities.filter(
      (avail) => avail !== availability
    );
    setAvailabilities(updatedAvailabilities);
  };

  const Save_Edit = async () => {
    try {
      const isDateExists = selectedEmployee.availabilities.some(
        (availability) => availability.date === availabilities[0].date
      );

      if (isDateExists) {
        // If the date exists, send a PUT request to update
        const existingAvailability = selectedEmployee.availabilities.find(
          (availability) => availability.date === availabilities[0].date
        );

        // Add the existing ID to the data being updated
        const updatedAvailability = {
          ...availabilities[0],
          id: existingAvailability.id,
        };

        const response = await axiosClient.put(
          `/availability/${existingAvailability.id}`,
          updatedAvailability
        );

        if (response.status === 200) {
          setSelectedEmployee((prevEmployee) => {
            const updatedAvailabilities = prevEmployee.availabilities.map(
              (availability) => {
                if (availability.id === existingAvailability.id) {
                  // Replace the existing entry with the updated one
                  return { ...updatedAvailability };
                }
                return availability;
              }
            );

            return {
              ...prevEmployee,
              availabilities: sortAvailabilities(updatedAvailabilities),
            };
          });

          setmessage("Data updated successfully");
        } else {
          throw new Error("Failed to update data.");
        }
      } else {
        // Validation checks
        const hasValidTimeEntry = availabilities.some((avail) => {
          const hasStartTime =
            avail.strt1 || avail.strt2 || avail.strt3 || avail.strt4;
          const hasEndTime =
            avail.end1 || avail.end2 || avail.end3 || avail.end4;
          return hasStartTime && hasEndTime;
        });

        if (!hasValidTimeEntry) {
          setAlertMessage(
            "Please enter at least one valid start and end time."
          );
          setShowAlert(true);
          return;
        }

        const isDateEntered = availabilities.some((avail) => avail.date);
        if (!isDateEntered) {
          setAlertMessage("Please enter the Date.");
          setShowAlert(true);
          return;
        }

        // Send a POST request to create new data
        const response = await axiosClient.post(
          `/availability`,
          availabilities[0]
        );

        if (response.status === 200) {
          const savedAvailabilityId = response.data.id;

          setSelectedEmployee((prevEmployee) => {
            const updatedAvailabilities = [
              ...prevEmployee.availabilities,
              { ...availabilities[0], id: savedAvailabilityId },
            ].filter((availability) => availability.id !== "NaN");

            return {
              ...prevEmployee,
              availabilities: sortAvailabilities(updatedAvailabilities),
            };
          });

          setmessage("Data saved successfully");
        } else {
          throw new Error("Failed to save data.");
        }
      }

      // Reset the availabilities and display
      setAvailabilities([]);
      setSelectedEmployee((prevEmployee) => ({
        ...prevEmployee,
        availabilities: sortAvailabilities([]),
      }));
      setmessage("");
      setAlertMessage("");
      setShowSuccessAlert(true);

      // Optional: Reset input fields or other UI elements here
      resetForm();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (error) {
      alert("Error saving/updating data. Please try again.");
    }
  };

  // Helper function to reset form or UI elements
  const resetForm = () => {
    setSelectedEmployee(selectedEmployee);
  };

  const Main_SaveData = async () => {
    try {
      const respo = await axiosClient.post(
        `availability/update`,
        selectedEmployee.availabilities
      );
      Employee();
      setSelectedEmployee((prevEmployee) => ({
        ...prevEmployee,
        availabilities: sortAvailabilities(prevEmployee.availabilities),
      }));
      setEditingRowId(null);
      setmessage("Data saved successfully");
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const sortAvailabilities = (availabilities) => {
    return [...availabilities].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      const timeA = a.strt1 ? a.strt1.split(":").map(Number) : [0, 0];
      const timeB = b.strt1 ? b.strt1.split(":").map(Number) : [0, 0];
      if (timeA[0] < timeB[0] || (timeA[0] === timeB[0] && timeA[1] < timeB[1]))
        return -1;
      if (timeA[0] > timeB[0] || (timeA[0] === timeB[0] && timeA[1] > timeB[1]))
        return 1;

      return 0;
    });
  };

  const check = (date) => {
    const occurrences = selectedEmployee.availabilities.filter(
      (availability) => availability.date === date
    );

    if (occurrences.length > 1) {
      alert(`Date ${date} exists  availabilities.`);
    } else if (occurrences.length === 1) {
      Main_SaveData();
    } else {
      Main_SaveData();
    }
  };

  function convertTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function addTime(originalTime, duration, second, third) {
    // Parse the original time into hours and minutes
    let [originalHours, originalMinutes] = [0, 0];
    if (originalTime !== null && originalTime !== false) {
      const [parsedOriginalHours, parsedOriginalMinutes] = originalTime
        .split(":")
        .map(Number);
      if (!isNaN(parsedOriginalHours) && !isNaN(parsedOriginalMinutes)) {
        originalHours = parsedOriginalHours;
        originalMinutes = parsedOriginalMinutes;
      }
    }

    // Parse the duration into hours and minutes
    let [durationHours, durationMinutes] = [0, 0];
    if (duration !== null && duration !== false) {
      const [parsedDurationHours, parsedDurationMinutes] = duration
        .split(":")
        .map(Number);
      if (!isNaN(parsedDurationHours) && !isNaN(parsedDurationMinutes)) {
        durationHours = parsedDurationHours;
        durationMinutes = parsedDurationMinutes;
      }
    }
    console.log(originalTime, duration, second, third);
    // Parse second into hours and minutes if it's not null
    let [secondHours, secondMinutes] = [0, 0];
    if (second !== null && second !== false) {
      const secondParts = second.split(":").map(Number);
      if (!isNaN(secondParts[0]) && !isNaN(secondParts[1])) {
        secondHours = secondParts[0];
        secondMinutes = secondParts[1];
      }
    }

    // Parse third into hours and minutes
    let [thirdHours, thirdMinutes] = [0, 0];
    if (third !== null && third !== false) {
      const [parsedThirdHours, parsedThirdMinutes] = third
        .split(":")
        .map(Number);
      if (!isNaN(parsedThirdHours) && !isNaN(parsedThirdMinutes)) {
        thirdHours = parsedThirdHours;
        thirdMinutes = parsedThirdMinutes;
      }
    }

    // Calculate the new hours and minutes
    let newHours = originalHours + durationHours + secondHours + thirdHours;
    let newMinutes =
      originalMinutes + durationMinutes + secondMinutes + thirdMinutes;

    // Adjust the time if minutes exceed 60
    if (newMinutes >= 60) {
      newHours += Math.floor(newMinutes / 60);
      newMinutes %= 60;
    }

    // Adjust the time if hours exceed 24
    newHours %= 24;

    // Format the result
    const resultTime = `${String(newHours).padStart(2, "0")}:${String(
      newMinutes
    ).padStart(2, "0")}`;

    return resultTime;
  }

  function diff(start, end) {
    if (start !== null && end !== null) {
      start = start.split(":");
      end = end.split(":");
      var startDate = new Date(0, 0, 0, start[0], start[1], 0);
      var endDate = new Date(0, 0, 0, end[0], end[1], 0);
      var diff = endDate.getTime() - startDate.getTime();
      var hours = Math.floor(diff / 1000 / 60 / 60);
      diff -= hours * 1000 * 60 * 60;
      var minutes = Math.floor(diff / 1000 / 60);
      if (hours < 0) hours = hours + 24;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    } else {
      return false;
    }
  }

  const filteredAvailabilities = useMemo(() => {
    if (!selectedEmployee) return [];
    return selectedEmployee.availabilities.filter(
      (a) => a.date >= startDate && a.date <= endDate
    );
  }, [selectedEmployee, startDate, endDate]);

  const formatTotalDuration = (timeString) => {
    if (!timeString || !timeString.includes(":")) {
      // Return a default value if timeString is null, undefined, or invalid
      return "00:00";
    }
    const [hours, minutes] = timeString.split(":");
    // Ensure two digits for hours and minutes
    const formattedHours = hours.length === 1 ? `0${hours}` : hours;
    const formattedMinutes = minutes.length === 1 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  function formatDateToCustomFormat(dateString) {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = dateObject.getDate();
    const month = dateObject.toLocaleString("en-US", { month: "short" }); // Get month in letters
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  }
  // Calculate the total hours
  const totalMinutes =
    filteredAvailabilities?.reduce((acc, availability) => {
      const date = parseISO(availability.date);
      if (isSameMonth(date, selectedMonth)) {
        const segments = [
          { start: availability.strt1, end: availability.end1 },
          { start: availability.strt2, end: availability.end2 },
          { start: availability.strt3, end: availability.end3 },
          { start: availability.strt4, end: availability.end4 },
        ];
        const minutes = segments.reduce((total, { start, end }) => {
          if (start && end) {
            const startTime = parseISO(`${availability.date}T${start}`);
            const endTime = parseISO(`${availability.date}T${end}`);
            return total + differenceInMinutes(endTime, startTime);
          }
          return total;
        }, 0);

        return acc + minutes;
      }
      return acc;
    }, 0) || 0; // Ensure the result is a number, defaulting to 0

  // Converting total minutes into hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Formatting the result as a string "X hrs Y mins"
  const formattedTime = `${hours} : ${minutes}`;

  return (
    <div className="flex flex-col mt-[-18px] gap-1 h-[940px] ">
      <div className="justify-between ml-[22px] max-w-[900px] items-center flex ">
        <h1 className="flex text-3xl mb-3">User Availability</h1>
      </div>
      <div className="flex flex-wrap  ml-6 2xl:ml-6 md:flex-row gap-2 max-w-[1900px] justify-start items-center  ">
        <Dropdown
          onSelect={(eventKey) => handleEmployeeChange(eventKey)}
          className="border-[1px] border-gray-400 bg-gray-50 rounded-md focus:border-gray-100"
        >
          <Dropdown.Toggle
            variant=""
            id="dropdown-basic"
            className="text-start flex items-center justify-between w-48"
          >
            {selectedEmployeeName || "Select Employee"}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="w-full "
            aria-label="Employee selection"
            variant="flat"
          >
            {data.map((employ) => (
              <Dropdown.Item key={employ.id} eventKey={employ.id}>
                {employ.first_name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <input
          type="month"
          name="selectedMonth"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="p-[7px]  border-gray-200 rounded border hourly-rate w-[155px]"
        />
        <Custom_Date_Picker
          value={startDate}
          onChange={handleStartDateChange}
        />
        <Custom_Date_Picker value={endDate} onChange={handleEndDateChange} />
        <div className="flex  justify-center items-center  gap-2">
          <button
            size="sm"
            variant="outlined"
            onClick={Open_Import_Modle}
            className="rounded-lg bg-white px-2 gap-1  flex-row flex justify-center items-center text-[#00a2e8] text-md border-[#00a2e8]  py-0 h-10 border-[2px]"
          >
            <i class="dupicon">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  fill="currentColor"
                  d="M832 384H576V128H192v768h640V384zm-26.496-64L640 154.496V320h165.504zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32zm160 448h384v64H320v-64zm0-192h160v64H320v-64zm0-384h384v64H320v-64z"
                ></path>
              </svg>
            </i>
            Import Availability
          </button>

          {selectedEmployee && (
            <>
              <button
                size="sm"
                variant="outlined"
                onClick={Open_Duplicate_Modle}
                disabled={selectedEmployee == null ? true : false}
                className="rounded-lg bg-white px-2 gap-1  flex-row flex justify-center items-center text-[#00a2e8] text-md border-[#00a2e8]  py-0 h-10 border-[2px]"
              >
                <i class="dupicon">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="currentColor"
                      d="M832 384H576V128H192v768h640V384zm-26.496-64L640 154.496V320h165.504zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32zm160 448h384v64H320v-64zm0-192h160v64H320v-64zm0-384h384v64H320v-64z"
                    ></path>
                  </svg>
                </i>
                Duplicate Week
              </button>
              <button
                className="bg-white rounded-lg px-2 flex-row flex justify-center items-center text-[#5fec13] border-[#5fec13] border-[1px]  py-0 h-10"
                onClick={Main_SaveData}
              >
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
            </>
          )}
          <div className="">
            {selectedEmployee &&
              (selectedEmployee.availabilities.length <= 0 ||
                (filteredAvailabilities &&
                  filteredAvailabilities.length <= 0)) && (
                <button
                  type="button"
                  onClick={() => Create_New_Row_Model(null)}
                  className="p-2 w-[110px] rounded-lg text-center border-[1px] text-[#00a2e8] border-[#00a2e8]"
                >
                  Add row
                </button>
              )}
          </div>
          {selectedEmployee && (
            <Input
              label="Total Hours"
              id="pading"
              className="text-xl sm:w-[90px] pointer-events-none sm:font-bold"
              InputProps={{
                readOnly: true,
              }}
              style={{
                paddingRight: "0px !important",
              }}
              value={formattedTime}
            />
          )}
        </div>
      </div>
      <div
        id="tble"
        className="relative ml-6 xl:ml-[25px] gap-3 lg:mrx-12 mt-3 "
      >
        <table className=" border-collapse border border-gray-300 j overflow-y-scroll">
          <thead className="sticky ">
            <tr className="">
              <th className="border-y border-gray-100 bg-gray-50/50 opacity-1 p-1">
                Day
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 opacity-1 p-1">
                Date
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 opacity-1 p-1">
                From
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 opacity-1 p-1">
                To
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 opacity-1 p-1">
                From
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
              <th className="border-y border-gray-100 bg-gray-50/50 p-1">
                From
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
              <th className="border-y border-gray-100 bg-gray-50/50 p-1">
                From
              </th>
              <th className="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
              <th className="border-y border-gray-100 bg-gray-50/50  tlt ">
                Total
              </th>

              <th className="border-y border-gray-100 bg-gray-50/50 p-1">
                Actions
              </th>
            </tr>
          </thead>
          <tbody id="attendees-list" className="overflow-y-scroll ">
            {!availabilities.length > 0 &&
              !filteredAvailabilities?.length > 0 && (
                <tr className="">
                  <td className="border border-gray-300 px-4 py-3">
                    <div className=" px-2 py-1 w-[70px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[70px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1 w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className=" px-2 py-1  w-[10px]"> </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className=" px-2  py-1 w-[90px]"> </div>
                  </td>
                </tr>
              )}
            {availabilities?.length > 0 &&
              availabilities?.map((availabil, index) => (
                <tr
                  key={availabil.id}
                  className={`border border-gray-300 ${
                    !availabil.strt1 &&
                    !availabil.end1 &&
                    !availabil.strt2 &&
                    !availabil.end2 &&
                    !availabil.strt3 &&
                    !availabil.end3 &&
                    !availabil.strt4 &&
                    !availabil.end4
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  {" "}
                  <td className=" px-2 py-1 w-[110px]">
                    {availabil?.date
                      ? format(new Date(availabil.date), "EEEE")
                      : null}
                  </td>
                  <td className="relative border overflow-hidden  border-gray-300 ">
                    <input
                      type="date"
                      name={`date-${availabil.id}`}
                      value={availabil.date}
                      className="rounded border hourly-rate w-[110px] ml-1 "
                      onChange={(e) => {
                        handleInputChange2(e, availabil.id, "date");
                      }}
                    />
                    <DatePicker/>
                  </td>
                  <td className="border border-gray-300 text-left">
                    <Time_Dropdown
                      // before={availabil.strt1}
                      name={`strt1-${availabil.id}`}
                      value={availabil.strt1}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "strt1")
                      }
                    />
                  </td>
                  <td className="border border-gray-300   text-left">
                    <Time_Dropdown
                      before={availabil.strt1}
                      after={availabil.strt2}
                      name={`end1-${availabil.id}`}
                      value={availabil.end1}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "end1")
                      }
                    />
                  </td>
                  <td className="border border-gray-300 text-left">
                    <Time_Dropdown
                      before={availabil.end1}
                      after={availabil.end2}
                      name={`strt2-${availabil.id}`}
                      value={availabil.strt2}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "strt2")
                      }
                    />
                  </td>
                  <td className="border border-gray-300  text-left">
                    <Time_Dropdown
                      before={availabil.strt2}
                      after={availabil.strt3}
                      name={`end2-${availabil.id}`}
                      value={availabil.end2}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "end2")
                      }
                    />
                  </td>
                  <td className="border border-gray-300   text-left">
                    <Time_Dropdown
                      before={availabil.end2}
                      after={availabil.end3}
                      name={`strt3-${availabil.id}`}
                      value={availabil.strt3}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "strt3")
                      }
                    />
                  </td>
                  <td className="border border-gray-300   text-left">
                    <Time_Dropdown
                      before={availabil.strt3}
                      after={availabil.strt4}
                      name={`end3-${availabil.id}`}
                      value={availabil.end3}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "end3")
                      }
                    />
                  </td>
                  <td className="border border-gray-300   text-left">
                    <Time_Dropdown
                      before={availabil.end3}
                      after={availabil.end4}
                      name={`strt4-${availabil.id}`}
                      value={availabil.strt4}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "strt4")
                      }
                    />
                  </td>
                  <td className="border border-gray-300   text-left">
                    <Time_Dropdown
                      before={availabil.strt4}
                      name={`end4-${availabil.id}`}
                      value={availabil.end4}
                      onChange={(e) =>
                        handleInputChange2(e, availabil.id, "end4")
                      }
                    />
                  </td>
                  <td className="border border-gray-300 pl-[3px] text-left">
                    <input
                      name="Total"
                      className="w-10  "
                      value={availabil?.total_ava}
                      disableds
                    />
                  </td>
                  <td className="p-1 flex rounded-sm gap-1 flex-row items-center justify-center text-left">
                    <button
                      onClick={() => Save_Edit()}
                      className=" mx-1  rounded-[4px] px-[15px] py-[1px]  text-[#5fec13] border-[1px] border-[#5fec13]"
                    >
                      Post
                    </button>

                    <button
                      onClick={() => Delete_Row_Edit(availabil)}
                      className=" px-[9px] py-[5px] border-[0.2px] border-[#c59174] rounded-[4px] text-black-600 "
                    >
                      <svg
                        class="dlt"
                        height="15"
                        className="text-[#c59174]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1024"
                      >
                        <path
                          fill="currentColor"
                          d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                        ></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            {filteredAvailabilities?.map((availability) => {
              return (
                <tr
                  key={availability.id}
                  className={`border border-gray-300 ${
                    !availability.strt1 &&
                    !availability.end1 &&
                    !availability.strt2 &&
                    !availability.end2 &&
                    !availability.strt3 &&
                    !availability.end3 &&
                    !availability.strt4 &&
                    !availability.end4
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  <td className=" px-2 py-2 w-[110px]">
                    {format(new Date(availability?.date), "EEEE")}
                  </td>
                  <td className="border overflow-hidden min-w-[125px] max-w-[110px] border-gray-300  ">
                    {availability.id !== editingRowId ? (
                      <span className=" w-[137px] px-2 ">
                        {formatDateToCustomFormat(availability.date)}
                      </span>
                    ) : (
                      <input
                        // edit inputs
                        type="date"
                        disableds={availability.id !== editingRowId}
                        name={`date-${availability.id}`}
                        value={availability.date}
                        className="rounded border hourly-rate ml-0.5 w-[110px] "
                        onChange={(e) => {
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "date"
                          );
                        }}
                      />
                      // <DatePicker
                      //   // disableds={availability.id !== editingRowId}
                      //   name={`date-${availability.id}`}
                      //   className="rounded border"
                      //   value={availability.date ?? " "}
                      //   // onChange={(e) => {
                      //   //   console.log(e),
                      //   //   value = e
                      //   //   // handleInputChange(
                      //   //   //   e,
                      //   //   //   availability.id,
                      //   //   //   "date"
                      //   //   // );
                      //   // }}
                      // />
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        //  after={availability.end1}
                        disableds={availability.id !== editingRowId}
                        value={availability.strt1}
                        name={`strt1-${availability.id}`}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "strt1"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.strt1 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.strt1}
                        after={availability.strt2}
                        disableds={availability.id !== editingRowId}
                        name={`end1-${availability.id}`}
                        value={availability.end1}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "end1"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.end1 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.end1}
                        after={availability.end2}
                        disableds={availability.id !== editingRowId}
                        value={availability.strt2}
                        name={`strt2-${availability.id}`}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "strt2"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.strt2 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.strt2}
                        after={availability.strt3}
                        disableds={availability.id !== editingRowId}
                        name={`end2-${availability.id}`}
                        value={availability.end2}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "end2"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.end2 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.end2}
                        after={availability.end3}
                        disableds={availability.id !== editingRowId}
                        name={`strt3-${availability.id}`}
                        value={availability.strt3}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "strt3"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.strt3 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.strt3}
                        after={availability.strt4}
                        disableds={availability.id !== editingRowId}
                        name={`end3-${availability.id}`}
                        value={availability.end3}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "end3"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.end3 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker
                        before={availability.end3}
                        after={availability.end4}
                        disableds={availability.id !== editingRowId}
                        name={`strt4-${availability.id}`}
                        value={availability.strt4}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "strt4"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.strt4 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      availability.id === editingRowId
                        ? " border border-gray-300  text-left"
                        : "px-2 border border-gray-300  text-left"
                    }
                  >
                    {availability.id === editingRowId ? (
                      <Edit_Time_Picker // time drop down
                        before={availability.strt4}
                        disableds={availability.id !== editingRowId}
                        name={`end4-${availability.id}`}
                        value={availability.end4}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            availability.id,
                            "end4"
                          )
                        }
                      />
                    ) : (
                      <span className="p-1">
                        {availability.end4 || "00:00"}
                      </span>
                    )}
                  </td>
                  <td className="border  border-gray-300   pl-[8px] text-left">
                    {formatTotalDuration(availability?.total_ava)}
                  </td>
                  {/* defult actions cell */}
                  <td className=" bg-white h-full  flex flex-row items-center justify-center ">
                    {availability.id === editingRowId && (
                      <button
                        onClick={() => check(availability.date)}
                        className=" px-[9px] py-[5px] mt-1 ml-1  text-[#5fec13] rounded-[4px] border-[0.5px] border-[#5fec13]"
                      >
                        <i class="saveicon ">
                          <svg
                            height="15"
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
                      </button>
                    )}
                    <button
                      onClick={() => Create_New_Row_Model()}
                      className="px-[9px] py-[5px] border-[#00a2e8] border-[1px] mx-1 rounded-[4px]   text-black-600 mt-1 mb-[6px]"
                    >
                      <svg
                        fill="#00a2e8"
                        height="15px"
                        viewBox="-1.7 0 20.4 20.4"
                        xmlns="http://www.w3.org/2000/svg"
                        class="cf-icon-svg"
                        stroke="#00a2e8"
                        strokeWidth="0.00020400000000000003"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path d="M16.416 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.916 7.917zm-2.958.01a.792.792 0 0 0-.792-.792H9.284V6.12a.792.792 0 1 0-1.583 0V9.5H4.32a.792.792 0 0 0 0 1.584H7.7v3.382a.792.792 0 0 0 1.583 0v-3.382h3.382a.792.792 0 0 0 .792-.791z"></path>
                        </g>
                      </svg>
                    </button>
                    {/* delete button in the action */}
                    <button
                      onClick={() => Delete_Entry_Pop(availability.id)}
                      className="px-[9px] py-[5px] border-[0.2px] border-[#c59174] rounded-[4px] text-black-600 mt-1 mb-[2.5px]"
                    >
                      <svg
                        class="dlt"
                        height="15"
                        className="text-[#c59174]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1024"
                      >
                        <path
                          fill="currentColor"
                          d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                        ></path>
                      </svg>
                    </button>
                    {availability.id !== editingRowId && (
                      <button
                        onClick={() => setEditingRowId(availability.id)}
                        className="px-[9px] py-[5px] border-[#0084ff] border-[1px] ml-1 rounded-[4px] text-green-600 mt-1 mb-[2.5px]"
                      >
                        <svg
                          height="15px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                              d="M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6"
                              stroke="#0084ff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>{" "}
                          </g>
                        </svg>
                      </button>
                    )}
                    {availability.id !== editingRowId && (
                      <button
                        className="px-[9px] py-[5px] border-[#00a2e8] border-[1px] mx-1 rounded-[4px]  mt-1 mb-[2.5px]"
                        onClick={() => Duplicate_Row_Model(availability)}
                      >
                        <img
                          src={duplicateicon}
                          alt="icon"
                          className="w-[15px]"
                        />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {Show_Import_Model && (
        <Availability_Import_Model 
        Employee = {data}
        onClose={Close_Import_Model} />
      )}
      {Show_Duplicate_Model && (
        //duplicate week pop
        <Duplicate_Month_Model
          selectedMonth={selectedMonth}
          Employee={Employee}
          selectedEmployee={selectedEmployee}
          changefalse={Close_Duplicate_Model}
        />
      )}

      {showSuccessAlert && (
        // save popup
        <Alert className="absolute left-[40%] top-[4%]" severity="success">
          {message}
        </Alert>
      )}
      {showAlert && (
        // error popup
        <AlertPopup message={alertMessage} onClose={handleCloseAlert} />
      )}
    </div>
  );
}
