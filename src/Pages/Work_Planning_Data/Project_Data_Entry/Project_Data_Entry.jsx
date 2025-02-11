// Project data entry

import { useEffect, useState } from "react";
import axiosClient from "@axios";
import Create_New_Project from "./Components/Create_new_Project_Model";
import Update_Hours_Mod from "./Components/Update_Hours_Model";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Project_Copy_Mod from "./Components/Project_Copy_Model";
import Part_Copy_Mod from "./Components/Part_Copy_Model";
import Alert from "@mui/material/Alert";
import { Employee_Dropdown } from "./Components/Employee_Dropdown_Model";
import Delete_Popup from "./Components/Delete_Popup_Model";
import { Dropdown } from "react-bootstrap";
import "@MainStyle";
import DatePicker from "./Components/DatePicker_Model";
import Popup_DatePicker from "./Components/PopupDatePicker_Model";


export const Project_Data_Entry = () => {
  const [projects, setProjects] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedParts, setSelectedParts] = useState("");
  const [Project_Copy_Model, setProject_Copy_Model] = useState(false);
  const [Update_Hours_Model, setUpdate_Hours_Model] = useState(false);
  const [Part_Copy_Model, setPart_Copy_Model] = useState(false);
  const [selectedKey, setSelectedKey] = useState("10");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [DoneAll, setDoneAll] = useState(false);
  const [color, setColor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [Owner, setOwner] = useState(false);

  const [subs, setSubs] = useState([]);
  const [minimizedTables, setMinimizedTables] = useState({
    taskName: false,
    hours: false,
    supplyDates: false,
    priority: false,
    allocation: false,
    progressData: false,
    progressAccessed: false,
  });
  const [emp, setemp] = useState([]);
  const [selectedProjectName, setSelectedProjectName] =
    useState("Select Project");
  const [selectedPartName, setSelectedPartName] = useState("Select Part");
  const [showModal, setShowModal] = useState(false);
  const [invalidFields, setInvalidFields] = useState({});

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);

  const Update_Hours = (data) => {
    // Create a map for quick lookup of EST values by task name from the data array
    const dataMap = new Map(data.map((item) => [item.taskName, item.EST]));

    // Collect all subs that need to be updated
    const subsToUpdate = subs.filter(
      (subItem) =>
        dataMap.has(subItem.TaskName) &&
        subItem.Est !== null &&
        subItem.Est !== ""
    );

    if (subsToUpdate.length > 0) {
      const userConfirmed = window.confirm(
        `The selected parts already have hours. Do you want to override the existing data?`
      );

      if (!userConfirmed) {
        return;
      }
    }

    // Update subs array where task names match and make the rest of the properties null
    const updatedSubs = subs.map((subItem) => {
      if (dataMap.has(subItem.TaskName)) {
        console.log(
          `Match found: data.EST (${dataMap.get(
            subItem.TaskName
          )}) replaces subs.EST (${subItem.Est})`
        );
        return {
          ...subItem,
          Est: String(dataMap.get(subItem.TaskName)), // Convert EST to string
          Plan: String(dataMap.get(subItem.TaskName)), // Convert Plan to string
          DL: null,
          RFI: null,
          PD: null,
          Buf: null,
          Adj: null,
        };
      }
      return subItem;
    });

    setSubs(updatedSubs);
    setUpdate_Hours_Model(false);
  };

  // console.log(subs);

  const Select_CopyType = (value) => {
    setSelectedKey(value);
    // console.log(value);
    if (
      value === "Without Data" ||
      value === "With All Data" ||
      value === "With Allocation"
    ) {
      setProject_Copy_Model(true);
      setPart_Copy_Model(false);
    } else if (value === "DublicatePart") {
      setPart_Copy_Model(true);
      setProject_Copy_Model(false);
    } else {
      setProject_Copy_Model(false);
      setPart_Copy_Model(false);
    }
  };

  const handlehideModalprojecy = () => {
    setSelectedKey("10");
    setProject_Copy_Model(false);
  };
  const Close_Part_Copy_Model = () => {
    setSelectedKey("10");
    setPart_Copy_Model(false);
  };

  const handleInputChange = (index, field, value) => {
    // Create a copy of the subs array
    const savedData = subs.map((task, idx) => {
      if (idx === index) {
        // Create a new object with updated field value
        const updatedTask = { ...task, [field]: value };

        // Calculate Plan based on the conditions
        if (["PD", "DL", "Est", "Buf", "Adj"].includes(field)) {
          const pd = parseFloat(updatedTask["PD"] || 0);
          const dl = parseFloat(updatedTask["DL"] || 0);
          const est = parseFloat(updatedTask["Est"] || 0);
          const buf = parseFloat(updatedTask["Buf"] || 0);
          const adj = parseFloat(updatedTask["Adj"] || 0);

          if (pd) {
            updatedTask["Plan"] = String(pd + buf + adj);
          } else if (dl) {
            updatedTask["Plan"] = String(dl + buf + adj);
          } else if (est) {
            updatedTask["Plan"] = String(est + buf + adj);
          }
        }

        // Update PRI based on RAP or PP
        if (field === "RAP" || field === "PP") {
          const rap = parseFloat(updatedTask["RAP"] || 0);
          const pp = parseFloat(updatedTask["PP"] || 0);
          const originalPri = parseFloat(
            updatedTask["originalPri"] || updatedTask["Pri"]
          );

          if (!updatedTask.hasOwnProperty("originalPri")) {
            updatedTask["originalPri"] = String(originalPri);
          }

          // Clear the Pri value first
          updatedTask["Pri"] = "0";

          if (rap === 0 && pp === 0) {
            updatedTask["Pri"] = String(originalPri);
          } else {
            updatedTask["Pri"] = String(
              parseFloat(updatedTask["Pri"]) + rap + pp
            );
          }
        }

        // Update additional fields
        updatedTask["Plan2"] = updatedTask["Plan"];
        updatedTask["left_1"] =
          parseFloat(updatedTask["Plan2"] || 0) -
          parseFloat(updatedTask["Act"] || 0);

        // Update time of edit
        updatedTask["Updated"] = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Calculate left_2 as the difference between Plan and Act

        // Calculate per as (left_2 / Plan) * 100 - 100% and convert to integer
        const plan = parseFloat(updatedTask["Plan"] || 0);
        const act = parseFloat(updatedTask["Act"] || 0);

        if (plan === act) {
          updatedTask["per"] = 100;
        } else if (plan !== 0) {
          updatedTask["per"] = Math.round(
            100 - (updatedTask["left_1"] / plan) * 100
          );
        } else {
          updatedTask["per"] = 0; // Handle division by zero
        }
        updatedTask["left_2"] = 100 - updatedTask["per"];

        console.log(updatedTask["Updated"]);
        console.log(updatedTask);

        return updatedTask;
      }
      return task;
    });

    // Update the state with the new array
    setSubs(savedData);
    console.log(savedData);

    // Handle all selected tasks separately
    const updatedSelectedTasks = savedData.map((task) => {
      if (task.isSelected) {
        // Create a new object with updated field value
        const updatedTask = { ...task, [field]: value };

        // Calculate Plan based on the conditions
        if (["PD", "DL", "Est", "Buf", "Adj"].includes(field)) {
          const pd = parseFloat(updatedTask["PD"] || 0);
          const dl = parseFloat(updatedTask["DL"] || 0);
          const est = parseFloat(updatedTask["Est"] || 0);
          const buf = parseFloat(updatedTask["Buf"] || 0);
          const adj = parseFloat(updatedTask["Adj"] || 0);

          if (pd) {
            updatedTask["Plan"] = String(pd + buf + adj);
          } else if (dl) {
            updatedTask["Plan"] = String(dl + buf + adj);
          } else if (est) {
            updatedTask["Plan"] = String(est + buf + adj);
          }
        }

        // Update PRI based on RAP or PP
        if (field === "RAP" || field === "PP") {
          const rap = parseFloat(updatedTask["RAP"] || 0);
          const pp = parseFloat(updatedTask["PP"] || 0);
          const originalPri = parseFloat(
            updatedTask["originalPri"] || updatedTask["Pri"]
          );

          if (!updatedTask.hasOwnProperty("originalPri")) {
            updatedTask["originalPri"] = String(originalPri);
          }

          // Clear the Pri value first
          updatedTask["Pri"] = "0";

          if (rap === 0 && pp === 0) {
            updatedTask["Pri"] = String(originalPri);
          } else {
            updatedTask["Pri"] = String(
              parseFloat(updatedTask["Pri"]) + rap + pp
            );
          }
        }

        // Update additional fields
        updatedTask["Plan2"] = updatedTask["Plan"];
        updatedTask["left_1"] =
          parseFloat(updatedTask["Plan2"] || 0) -
          parseFloat(updatedTask["Act"] || 0);

        // Update time of edit
        updatedTask["Updated"] = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Calculate left_2 as the difference between Plan and Act

        // Calculate per as (left_2 / Plan) * 100 - 100% and convert to integer
        const plan = parseFloat(updatedTask["Plan"] || 0);
        const act = parseFloat(updatedTask["Act"] || 0);

        if (plan === act) {
          updatedTask["per"] = 100;
        } else if (plan !== 0) {
          updatedTask["per"] = Math.round(
            100 - (updatedTask["left_1"] / plan) * 100
          );
        } else {
          updatedTask["per"] = 0; // Handle division by zero
        }
        updatedTask["left_2"] = 100 - updatedTask["per"];

        console.log(updatedTask["Updated"]);
        console.log(updatedTask);

        return updatedTask;
      }
      return task;
    });

    console.log(updatedSelectedTasks);
    // Update the state with the new array including updated selected tasks
    setSubs(updatedSelectedTasks);
  };

  const handlePostData = async () => {
    console.log(subs);

    const data = {
      ...subs,
      parts_id: selectedParts,
      color: color,
      selectedProject: selectedProject,
    };
    console.log(data);

    try {
      const response = await axiosClient.post(`savedata`, data);
      if (response.status === 200) {
        setShowSuccessAlert(true);
        // Hide the alert after 3 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
        setIsSaving(false); // End of saving operation
      } else {
        alert("problem in saving ");
      }
    } catch (error) {
      console.error("Error sending form data:", error);
      // Check for the 409 status code and specific error message
      if (
        error.response &&
        error.response.status === 409 &&
        error.response.data.color
      ) {
        alert(error.response.data.color); // Alert with the specific error message from the backend
      } else {
        alert("An error occurred while saving the data.");
      }
    }
  };

  const handlePos = async () => {
    let newInvalidFields = {};

    // Validate each task's fields
    subs.forEach((task, index) => {
      const isPriInvalid =
        task.Pri === null || task.Pri === "" || isNaN(task.Pri);
      const isEstInvalid =
        task.Est === null || task.Est === "" || isNaN(task.Est);
      const isPlanInvalid =
        task.Plan === null || task.Plan === "" || isNaN(task.Plan);
      const isDocSupplyInvalid =
        task.Doc_Supply === null ||
        task.Doc_Supply === "" ||
        !Date.parse(task.Doc_Supply);
      const isCompletionInvalid =
        task.Completion === null ||
        task.Completion === "" ||
        !Date.parse(task.Completion);
      const isTSInvalid = task.TS === null || task.TS === "" || isNaN(task.TS);

      // Check if all fields are invalid
      const isAnyFieldInvalid =
        isPriInvalid ||
        isEstInvalid ||
        isPlanInvalid ||
        isDocSupplyInvalid ||
        isCompletionInvalid ||
        isTSInvalid;

      // Check if all fields are empty
      const areAllFieldsEmpty =
        (task.Pri === null || task.Pri === "") &&
        (task.Est === null || task.Est === "") &&
        (task.Plan === null || task.Plan === "") &&
        (task.Doc_Supply === null || task.Doc_Supply === "") &&
        (task.Completion === null || task.Completion === "") &&
        (task.TS === null || task.TS === "");

      // If any field is invalid, add it to newInvalidFields
      if (isAnyFieldInvalid && !areAllFieldsEmpty) {
        newInvalidFields[index] = {
          Pri: isPriInvalid,
          Est: isEstInvalid,
          Plan: isPlanInvalid,
          Doc_Supply: isDocSupplyInvalid,
          Completion: isCompletionInvalid,
          TS: isTSInvalid,
        };
      }
    });

    // Update the invalid fields state
    setInvalidFields(newInvalidFields);

    // If there are any invalid fields, do not proceed with sending data
    if (Object.keys(newInvalidFields).length > 0) {
      return;
    }

    // If all fields are empty, do not proceed with sending data
    if (
      subs.every(
        (task) =>
          (task.Pri === null || task.Pri === "") &&
          (task.Est === null || task.Est === "") &&
          (task.Plan === null || task.Plan === "") &&
          (task.Doc_Supply === null || task.Doc_Supply === "") &&
          (task.Completion === null || task.Completion === "") &&
          (task.TS === null || task.TS === "")
      )
    ) {
      return;
    }

    // All fields are either empty or valid, proceed with sorting and sending data
    const sortedSubs = [...subs].sort((a, b) => b.Pri - a.Pri);
    const data = {
      ...sortedSubs,
    };

    try {
      // Function to adjust Doc_Supply by adding 4 hours
      const adjustDocSupply = (items) =>
        items.map((task) => {
          if (task.Doc_Supply) {
            const currentDate = new Date(task.Doc_Supply);
            currentDate.setHours(currentDate.getHours()); // Add 4 hours
            return { ...task, Doc_Supply: currentDate.toISOString() };
          }
          return task;
        });

      // Adjust Doc_Supply in data and subs
      const adjustedData = Object.entries(data).reduce((acc, [key, task]) => {
        if (task.Doc_Supply) {
          const currentDate = new Date(task.Doc_Supply);
          currentDate.setHours(currentDate.getHours()); // Add 4 hours
          acc[key] = { ...task, Doc_Supply: currentDate.toISOString() };
        } else {
          acc[key] = task;
        }
        return acc;
      }, {});

      const adjustedSubs = adjustDocSupply(subs);

      console.log("Adjusted Data:", adjustedData);
      console.log("Adjusted Subs:", adjustedSubs);

      // Send adjusted data to the backend
      const response = await axiosClient.post(`runalgori`, adjustedData);
      if (response.status === 200) {
        console.log(adjustedSubs);

        const filteredTasks = response.data.filteredTasks;
        console.log(filteredTasks);

        const updatedSubs = adjustedSubs.map((task) => {
          const matchingTask = filteredTasks.find(
            (updatedTask) => task.id === updatedTask.id
          );

          return matchingTask
            ? {
              ...task,
              ...matchingTask,
              Doc_Supply: task.Doc_Supply, // Ensure Doc_Supply matches adjustedSubs
            }
            : task;
        });

        console.log(updatedSubs);

        setIsSaving(true); // End of saving operation
        setSubs(updatedSubs);
      } else {
        alert("Problem in saving");
      }
    } catch (error) {
      console.error("Error sending form data:", error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    handleInputChange();
  };

  const fetchProjects = async () => {
    const resp = await axiosClient.get("projects");
    setProjects(resp.data.project);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  function customSort(a, b) {
    // Extract the numeric part of the TaskName
    const aNumber = parseFloat(a.TaskName.split(" ")[0]);
    const bNumber = parseFloat(b.TaskName.split(" ")[0]);
    if (!isNaN(aNumber) && !isNaN(bNumber)) {
      if (aNumber < bNumber) {
        return -1;
      } else if (aNumber > bNumber) {
        return 1;
      }
    }
  }

  const fetchParts = async (projectId) => {
    const resp = await axiosClient.get(`parts/${projectId}`);
    const fetchedParts = resp.data.parts;
    if (fetchedParts.length === 1) {
      const singlePart = fetchedParts[0];
      setSelectedPartName(singlePart.PartName);
      // setSubs(resp.data.subs);
      const sortedSubs = resp.data.subs.sort(customSort);
      setSubs(sortedSubs);
      // setSelectedPartName setSelectedParts(singlePart.PartName);
    } else {
      setSubs([]);
    }
    setParts(fetchedParts);
  };

  useEffect(() => {
    if (selectedProject) {
      setSubs([]);
      fetchParts(selectedProject);
    }
  }, [selectedProject]);

  const fetchSubs = async (projectId) => {
    const resp = await axiosClient.get(`subs/${projectId}`);
    const sortedSubs = resp.data.subs.sort(customSort);
    setSubs(sortedSubs);
  };

  useEffect(() => {
    if (selectedParts) {
      setSubs([]);
      fetchSubs(selectedParts);
    }
  }, [selectedParts]);

  const handleProjectChange = (value) => {
    setInvalidFields([]);
    const project = projects.find((proj) => proj.id === parseInt(value));
    setSelectedProjectName(project.ProjectName);
    setColor(project.Color ? project.Color : "#ffffff");
    setSelectedPartName("Select Part");
    setSelectedKey("10");
    setSelectAll(false);
    setSelectedParts("");
    setIsSaving(false);
    setSelectedProject(value);
    console.log(selectedProjectName);
  };
  const handlePartsChange = (value) => {
    setInvalidFields([]);
    const part = parts.find((p) => p.id === parseInt(value, 10));
    setSelectedPartName(part.PartName);
    setSubs([]);
    setSelectedParts(value);
  };
  const calculateNextDay = (docSupply) => {
    if (!docSupply) return undefined; // Handle null/undefined case
    const nextDay = new Date(docSupply);
    nextDay.setDate(nextDay.getDate() + 1); // Increment the day by 1
    return nextDay.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  };

  const handleDeleteAction = (action, message) => {
    setConfirmationAction(() => action);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setConfirmationAction(null);
  };
  const handleopenimport = () => {
    setUpdate_Hours_Model(true);
  };
  const handlecloseimport = () => {
    setUpdate_Hours_Model(false);
    console.log("closed");
  };
  const deletePart = () => {
    handleDeleteAction(async () => {
      try {
        const response = await axiosClient.delete("/parts", {
          data: { selectedParts },
        });
        if (response.status === 200) {
          // console.log("Part deleted successfully");
          window.location.reload();
        } else {
          console.error("Failed to delete part");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, "Are you sure you want to delete the selected parts?");
  };

  const deleteProject = () => {
    handleDeleteAction(async () => {
      try {
        const response = await axiosClient.delete("/projects", {
          data: { selectedProject },
        });
        if (response.status === 200) {
          // console.log("Project deleted successfully");
          window.location.reload();
        } else {
          console.error("Failed to delete project");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, "Are you sure you want to delete this project?");
  };

  const deleteSelectedTasks = async () => {
    // Filter the 'subs' array to find tasks that are selected and map them to their IDs
    const selectedTaskIds = subs
      .filter((task) => task.isSelected)
      .map((task) => task.id);

    // Proceed with the deletion if there are any selected tasks
    if (selectedTaskIds.length > 0) {
      handleDeleteAction(async () => {
        try {
          const response = await axiosClient.post("/delete-tasks", {
            ids: selectedTaskIds, // Use the filtered task IDs for deletion
          });
          if (response.status === 200) {
            // console.log("Tasks deleted successfully");
            // Update the 'subs' state to remove the deleted tasks
            setSubs(subs.filter((task) => !task.isSelected));
          }
        } catch (error) {
          console.error("Error deleting tasks:", error);
        }
      }, "Are you sure you want to delete the selected tasks?");
    } else {
      // Optionally handle the case where no tasks are selected
      // console.log("No tasks selected for deletion.");
    }
  };

  const handleCheckboxChange = (e, taskId) => {
    const updatedSubs = subs.map((task) => {
      if (task.id === taskId) {
        return { ...task, isSelected: e.target.checked };
      }
      return task;
    });
    setSubs(updatedSubs);

    const allSelected = updatedSubs.every((task) => task.isSelected);
    setSelectAll(allSelected);
  };

  const Done_Check_Box = (e, taskId) => {
    const updatedSubs = subs.map((task) => {
      if (task.id === taskId) {
        return { ...task, isDone: e.target.checked };
      }
      return task;
    });
    setSubs(updatedSubs);

    // const allSelected = updatedSubs.every((task) => task.isDone);
    // setSelectAll(allSelected);
  };


  const OwnerChange = (e, taskId) => {
    const updatedSubs = subs.map((task) => {
      if (task.id === taskId) {
        return { ...task, Owner: e.target.value };
      }
      return task;
    });
    setSubs(updatedSubs);

    // const allSelected = updatedSubs.every((task) => task.isDone);
    // setSelectAll(allSelected);
  };

  const Select_All = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    const updatedSubs = subs.map((task) => ({
      ...task,
      isSelected: checked,
    }));
    setSubs(updatedSubs);
  };

  const Done_All = (e) => {
    const checked = e.target.checked;
    setDoneAll(checked);

    const updatedSubs = subs.map((task) => ({
      ...task,
      isDone: checked,
    }));
    setSubs(updatedSubs);
  };


  const handleBulkEdit = (newData) => {
    const updatedSubs = subs.map((task) => {
      if (task.isSelected) {
        return { ...task, ...newData };
      }
      return task;
    });
    setSubs(updatedSubs);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const resp = await axiosClient.get("employees");
        setemp(resp.data.employees);
      } catch (error) {
        console.error("Failed to fetch employees", error);
        // Handle error appropriately
      }
    };

    fetchEmployees();
  }, []);

  function extractTaskId(taskName) {
    if (typeof taskName === "string") {
      var numbers = taskName.match(/\d+/g); // Extract numbers from the task name
      if (numbers && numbers.length > 0) {
        return parseInt(numbers[0]); // Use the first extracted number as the task ID
      }
    }
    return null;
  }

  function generateUniqueColor(taskId) {
    if (taskId) {
      var taskIdString = String(taskId);
      var hash = 0;
      for (var i = 0; i < taskIdString.length; i++) {
        hash = (hash << 5) - hash + taskIdString.charCodeAt(i);
        hash |= 0;
      }

      var r = (hash & 0xff0000) >> 16;
      var g = (hash & 0x00ff00) >> 8;
      var b = hash & 0x0000ff;

      var color =
        "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
      return color;
    }
    return null;
  }
  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const CopySelectedRow = () => {
    // Filter out selected tasks
    const selectedRows = subs.filter((task) => task.isSelected);

    // Find the maximum current id in the subs array
    const maxId = subs.reduce(
      (max, task) => (task.id > max ? task.id : max),
      0
    );

    // Clone selected rows by spreading their properties and giving them new incremented IDs
    let newId = maxId + 1; // Start from maxId + 1
    const copiedRows = selectedRows.map((task) => ({
      ...task,
      id: newId++, // Assign the next incremented id to each copied row
    }));

    // Append the copied rows to the existing subs array
    const updatedSubs = [...subs, ...copiedRows];

    // Set subs back to the updated subs
    setSubs(updatedSubs);
  };

  const toggleTableWidth = (tableKey) => {
    setMinimizedTables((prevState) => ({
      ...prevState,
      [tableKey]: !prevState[tableKey],
    }));
  };

  // console.log(selectedProject);
  const menuItems =
    selectedProject === "2430"
      ? [<MenuItem value="With All Data">With All Data</MenuItem>]
      : [
        <MenuItem value="Without Data">Without Data</MenuItem>,
        <MenuItem value="With All Data">With All Data</MenuItem>,
        <MenuItem value="With Allocation">
          With Operative Selection Only
        </MenuItem>,
        <MenuItem value="DublicatePart">Duplicate Part</MenuItem>,
      ];
  // const dataToMap = savedData.length > 0 ? savedData : subs;

  return (
    <div className="relative">
      <div className="flex flex-col max-w-[97.4%] blk xl:gap-2 gap-2 pb-10 lg:pb-0 md:ml-[19px] md:mt-[-12px] 2xl:ml-11">
        <h1 className="flex text-3xl  lg:ml-2">Project Data Entry</h1>
        {/* <div className="justify-around item-center flex-row flex"></div> */}
        <div className="flex flex-wrap ml-2 2xl:ml-1 md:flex-row gap-2 items-center  ">
          <Dropdown
            onSelect={(eventKey) => handleProjectChange(eventKey)}
            className="border-[1px] border-gray-400 bg-gray-50 py-0 h-10 rounded-lg border-[1px] focus:border-gray-100 "
          >
            <Dropdown.Toggle
              variant=""
              id="dropdown-basic-project"
              className="text-start flex items-center justify-between w-96 "
            >
              {selectedProjectName}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-full max-h-96 overflow-auto"
              aria-label="Project selection"
              variant="flat"
            >
              {projects.map((project) => (
                <Dropdown.Item
                  key={project.id}
                  proj={project.ProjectName}
                  eventKey={project.id}
                >
                  {project.ProjectName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            onSelect={(eventKey) => handlePartsChange(eventKey)}
            className="border-[1px] border-gray-400 bg-gray-50  h-10 rounded-lg border-[1px] focus:border-gray-100 "
          >
            <Dropdown.Toggle
              variant=""
              id="dropdown-basic-parts"
              className="text-start flex items-center justify-between w-80"
            >
              {selectedPartName != "" ? selectedPartName : ""}
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="w-full max-h-40 overflow-auto "
              aria-label="Parts selection"
              variant="flat"
            >
              {parts.map((part) => (
                <Dropdown.Item key={part.id} eventKey={part.id}>
                  {part.PartName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {Update_Hours_Model && (
            // duplicate project dropdown
            <Update_Hours_Mod
              onClose={handlecloseimport}
              onSave={Update_Hours}
              selectproject={selectedProject}
            ></Update_Hours_Mod>
          )}

          <button
            onClick={handleShowModal}
            className="bg-white p-1 py-0 h-9 rounded-lg border-[1px] px-2 hover:shadow-xl text-[#00a2e8] min-w-[130px] border-[#00a2e8] border-[1px] "
          >
            Create new
          </button>

          <FormControl
            disabled={selectedPartName ? false : true}
            className="ddee py-0 h-9 border rounded-lg "
          >
            <Select
              value={selectedKey}
              onChange={(e) => Select_CopyType(e.target.value)}
            >
              <MenuItem disabled value={10}>
                Select Copy Type
              </MenuItem>
              {menuItems}
            </Select>
          </FormControl>

          <div className="flex flex-row items-center gap-2">
            <label htmlFor="projectColor" className="min-w-[100px]">
              Project Color:
            </label>
            <input
              type="color"
              id="projectColor"
              name="color"
              value={color != null ? color : "#ffffff"} // color state should hold the current color value
              onChange={handleColorChange} // Function to update color state
              className="border rounded-lg"
            />
          </div>

          {selectedPartName !== "Select Part" ? (
            <button
              onClick={handleopenimport}
              className=" bg-white  flex-row flex justify-center items-center text-[#00a2e8] text-md border-[#00a2e8] min-w-[130px] py-0 h-9 rounded-lg border-[1px]"
            >
              Update Hrs
            </button>
          ) : (
            <div className="w-[0px]"></div>
          )}

          {selectedProject ? (
            <button
              onClick={handlePostData}
              className="bg-white p-1 py-0 h-9 rounded-lg  px-2 hover:shadow-xl text-[#5fec13] min-w-[130px]  border-[#5fec13] border-[1px] "
            >
              Save
            </button>
          ) : (
            <></>
          )}
          {selectedProject ? (
            <button
              onClick={handlePos}
              disabled={false}
              className={`p-1 py-0 h-9 rounded-lg border-[1px] px-2 min-w-[130px]  border-[1px] ${isSaving
                  ? "bg-gray-500 text-white border-gray-400" // Styles for disabled state
                  : "bg-white text-[#5fec13] border-[#5fec13] hover:shadow-xl" // Styles for enabled state
                }`}
            >
              Run algorithm
            </button>
          ) : (
            <></>
          )}

          <div className=" flex ">
            {!subs.some((task) => task.isSelected) && selectedProject ? (
              selectedParts ? (
                <>
                  <button
                    onClick={deletePart}
                    className="bg-white p-1 py-0 h-9 rounded-lg border-[1px] px-2 hover:shadow-xl text-[#b97a57] min-w-[130px]  border-[#b97a57] border-[1px]"
                  >
                    Delete part
                  </button>
                </>
              ) : (
                <button
                  onClick={deleteProject}
                  className="bg-white p-1 py-0 h-9 rounded-lg border-[1px] px-2 hover:shadow-xl text-[#b97a57] min-w-[130px]  border-[#b97a57] border-[1px]"
                >
                  Delete project
                </button>
              )
            ) : (
              <></>
            )}
            {subs.some((task) => task.isSelected) ? (
              <>
                <button
                  onClick={CopySelectedRow}
                  className="bg-white p-1 py-0 h-9 rounded-lg border-[1px] mr-2 px-2 hover:shadow-xl text-[#b97a57] min-w-[130px]  border-[#b97a57] border-[1px]"
                >
                  Copy Selected Row
                </button>
                <button
                  onClick={deleteSelectedTasks}
                  className="bg-white p-1 py-0 h-9 rounded-lg border-[1px] mr-2 px-2 hover:shadow-xl text-[#b97a57] min-w-[130px]  border-[#b97a57] border-[1px]"
                >
                  Delete Selected Tasks
                </button>
              </>
            ) : (
              <div className="w-[0px]"></div>
            )}
          </div>
        </div>
        <div className="lg:mrx- ml-[4px] max-w-[100%] flex-col md:flex-col flex xl:flex-row gap-2 overflow-y-none overflow-x-auto max-h-[1000px]">
          {subs?.length > 0 ? (
            <>
              <div className="flex flex-row md:flex-row gap-2">
                <table
                  className={`tskname border-collapse border min-w-[150px] border-gray-300 transition-all duration-200 ${minimizedTables.taskName ? "w-[110px]" : " "
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className=" min-w-[150px] border-2 bg-gray-700 h-8 text-white cursor-pointer"
                      onClick={() => toggleTableWidth("taskName")}
                    >
                      <th colSpan="5" className="pl-2 text-left">
                        Task Name
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-gray-300 broder-r-700">
                        <input
                          className="w-4 mr-1"
                          name="selectall"
                          type="checkbox"
                          checked={selectAll}
                          onChange={Select_All}
                        />
                        Select All
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((task, index) => (
                      <tr key={index}>
                        <td
                          className={`border border-gray-300 text-overflow-ellipsis whitespace-nowrap overflow-hidden ${minimizedTables.taskName ? "w-[50px]" : " "
                            }`}
                        >
                          <div className="flex items-center">
                            <input
                              className="w-4 mr-1"
                              type="checkbox"
                              checked={task.isSelected || false}
                              onChange={(e) => handleCheckboxChange(e, task.id)}
                            />
                            <span
                              className={`truncate ${minimizedTables.taskName ? "w-[50px]" : "block"
                                }`}
                            >
                              {task.TaskName}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`hrsnme border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.hours ? "w-[70px]" : ""
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="mainheaders h-8 editable-table bg-gray-700 text-white cursor-pointer"
                      onClick={() => toggleTableWidth("hours")}
                    >
                      <th
                        colSpan={minimizedTables.hours ? "1" : "7"}
                        className="pl-1 text-left"
                      >
                        Hours
                      </th>
                    </tr>
                    {!minimizedTables.hours && (
                      <tr>
                        {["Est", "DL", "RFI", "PD", "Buf", "Adj", "Plan"].map(
                          (header) => (
                            <th
                              key={header}
                              className="bg-gray-300 border-r-700"
                            >
                              <p className="pl-1">{header}</p>
                            </th>
                          )
                        )}
                      </tr>
                    )}
                    {minimizedTables.hours && (
                      <tr>
                        <th className="bg-gray-300 border-r-700">
                          <p className="pl-1">Plan</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody id="attendees-list">
                    {subs.map((task, index) => (
                      <tr key={index}>
                        {!minimizedTables.hours &&
                          ["Est", "DL", "RFI", "PD", "Buf", "Adj", "Plan"].map(
                            (field) => (
                              <td
                                key={field}
                                className={`border border-gray-300 w-5 px-1 text-center`}
                              >
                                <input
                                  className={`w-7 ${invalidFields[index]?.[field]
                                      ? "border-2 border-red-500"
                                      : ""
                                    }`}
                                  style={{ textAlign: "center" }}
                                  value={task?.[field]}
                                  readOnly={field === "Plan"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      field,
                                      field === "Plan"
                                        ? task?.[field]
                                        : e.target.value
                                    )
                                  }
                                />
                              </td>
                            )
                          )}
                        {minimizedTables.hours && (
                          <td className="border border-gray-300 w-5 px-1 text-center">
                            <input
                              className={`w-7 ${invalidFields[index]?.Plan
                                  ? "border-2 border-red-500"
                                  : ""
                                }`}
                              style={{ textAlign: "center" }}
                              value={task?.Plan}
                              readOnly
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.supply ? "w-[20%]" : "w-full"
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="border-2 bg-gray-700 text-white h-8 cursor-pointer"
                      onClick={() => toggleTableWidth("supply")}
                    >
                      <th
                        colSpan={minimizedTables.supply ? "1" : "3"}
                        className="pl-2 text-left"
                      >

                        <p className="pl-2">{minimizedTables.supply ? "Dates" : "Supply & Completion Dates"}</p>

                      </th>
                    </tr>
                    {!minimizedTables.supply && (
                      <tr className="bg-gray-300">
                        <th>
                          <p className="pl-1">Doc Supply</p>
                        </th>
                        <th width="20%">
                          <p className="pl-1">C%</p>
                        </th>
                        <th>
                          <p className="pl-1">Completion</p>
                        </th>
                      </tr>
                    )}
                    {minimizedTables.supply && (
                      <tr className="bg-gray-300">
                        <th>
                          <p className="pl-1">Completion</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {subs.map((task, index) => (
                      <tr key={index}>
                        {!minimizedTables.supply && (
                          <>
                            <td className="border w-28 border-gray-300">
                              <DatePicker
                                className="noborder"
                                value={task?.Doc_Supply ?? " "}
                                onChange={(e) =>
                                  handleInputChange(index, "Doc_Supply", e)
                                }
                              />
                            </td>
                            <td className="border max-w-[80px] border-gray-300 px-2">
                              <input
                                className="w-7"
                                value={
                                  task?.per
                                    ? Math.min(parseInt(task.per, 10), 100)
                                    : " "
                                }
                                onChange={(e) =>
                                  handleInputChange(index, "per", e.target.value)
                                }
                              />
                            </td>
                          </>
                        )}
                        <td className="border w-28 border-gray-300">
                          <Popup_DatePicker
                            minDate={task?.Doc_Supply}
                            value={task?.Completion}
                            onChange={(e) =>
                              handleInputChange(index, "Completion", e)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.priority ? "w-[20%]" : "w-full"
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="mainheaders editable-table h-8 bg-gray-700 text-white cursor-pointer"
                      onClick={() => toggleTableWidth("priority")}
                    >
                      <th colSpan={minimizedTables.priority ? "2" : "6"}>
                        <p className="pl-2">{minimizedTables.priority ? "Priority" : "Priority & Team Size"}</p>
                      </th>
                    </tr>
                    {!minimizedTables.priority && (
                      <tr>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">PP</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">RAP</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">Pri</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">TS</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">DD</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">SP</p>
                        </th>
                      </tr>
                    )}
                    {minimizedTables.priority && (
                      <tr>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">Pri</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700">
                          <p className="pl-1">TS</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody id="attendees-list">
                    {subs.map((task, index) => (
                      <tr key={index}>
                        {!minimizedTables.priority && (
                          <>
                            <td className="border border-gray-300 px-1">
                              <input
                                className="w-[40px] text-center"
                                value={task?.PP ? parseFloat(task.PP).toFixed(2) : ""}
                                onChange={(e) =>
                                  handleInputChange(index, "PP", e.target.value)
                                }
                              />
                            </td>
                            <td className="border border-gray-300 px-1">
                              <input
                                type="number"
                                step="0.01"
                                className="w-[60px] text-center"
                                value={task?.RAP ? parseFloat(task.RAP).toFixed(2) : ""}
                                onChange={(e) =>
                                  handleInputChange(index, "RAP", parseFloat(e.target.value) || 0)
                                }
                              />
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 px-1">
                          <input
                            className={`w-[40px] text-center ${invalidFields[index]?.Pri ? "border-2 border-red-500" : ""
                              }`}
                            value={task?.Pri ? parseFloat(task.Pri).toFixed(2) : ""}
                            readOnly
                          />
                        </td>
                        <td className="border border-gray-300 px-2">
                          <input
                            className={`w-5 ${invalidFields[index]?.TS ? "border-2 border-red-500" : ""
                              }`}
                            value={task?.TS}
                            onChange={(e) =>
                              handleInputChange(index, "TS", e.target.value)
                            }
                          />
                        </td>
                        {!minimizedTables.priority && (
                          <>
                            <td className="border border-gray-300 px-2">
                              <input
                                className="w-7"
                                value={task?.DD}
                                onChange={(e) =>
                                  handleInputChange(index, "DD", e.target.value)
                                }
                              />
                            </td>
                            <td className="border border-gray-300 px-2">
                              <input
                                className="w-7"
                                value={task?.SP}
                                onChange={(e) =>
                                  handleInputChange(index, "SP", e.target.value)
                                }
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.allocation ? "w-[70px]" : " "
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="border-2 bg-gray-700 text-white h-8 cursor-pointer "
                      onClick={() => toggleTableWidth("allocation")}
                    >
                      <th
                        colSpan={minimizedTables.allocation ? "1" : "6"}
                        className="pl-2 text-left"
                      >
                        Allocation
                      </th>
                    </tr>
                    {!minimizedTables.allocation && (
                      <tr className="bg-gray-300">
                        {[
                          "Algorithm 1",
                          "Algorithm 2",
                          "Algorithm 3",
                          "Override 1",
                          "Override 2",
                          "Override 3",
                        ].map((header) => (
                          <th key={header} className="bg-gray-300">
                            <p className="pl-1">{header}</p>
                          </th>
                        ))}
                      </tr>
                    )}
                    {minimizedTables.allocation && (
                      <tr className="bg-gray-300">
                        <th className="bg-gray-300">
                          <p className="pl-1">Algorithm 1</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody id="attendees-list">
                    {subs.map((task, index) => (
                      <tr key={index}>
                        {!minimizedTables.allocation &&
                          [
                            "Algorithm_1",
                            "Algorithm_2",
                            "Algorithm_3",
                            "Override_1",
                            "Override_2",
                            "Override_3",
                          ].map((field, idx) => (
                            <td
                              key={field}
                              className={`border border-gray-300 px-2 ${idx >= 3 ? "text-center" : ""
                                }`}
                            >
                              {idx < 3 ? (
                                <input
                                  className="w-28"
                                  value={task?.[field]}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      field,
                                      e.target.value
                                    )
                                  }
                                  disabled
                                />
                              ) : (
                                <Employee_Dropdown
                                  emp={emp}
                                  value={task?.[field]}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      field,
                                      e.target.value
                                    )
                                  }
                                />
                              )}
                            </td>
                          ))}
                        {minimizedTables.allocation && (
                          <td className="border border-gray-300 px-2">
                            <input
                              className="w-28"
                              value={task?.Algorithm_1}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "Algorithm_1",
                                  e.target.value
                                )
                              }
                              disabled
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.progress ? "w-[20%]" : "w-[359px]"
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="mainheaders editable-table bg-gray-700 text-white h-8 cursor-pointer"
                      onClick={() => toggleTableWidth("progress")}
                    >
                      <th colSpan={minimizedTables.progress ? "3" : "7"}>
                        <p className="pl-2">{minimizedTables.progress ? "Progress" : "Progress - Details"}</p>
                      </th>
                    </tr>
                    {!minimizedTables.progress && (
                      <tr>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Plan</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Act</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Pre</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Left</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Updated</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">%</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Left</p>
                        </th>
                      </tr>
                    )}
                    {minimizedTables.progress && (
                      <tr>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Act</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Pre</p>
                        </th>
                        <th className="bg-gray-300 broder-r-700 px-2">
                          <p className="pl-1">Left</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody id="attendees-list">
                    {subs.map((task, index) => (
                      <tr key={index}>
                        {!minimizedTables.progress && (
                          <>
                            <td className="border border-gray-300 w-5 px-1 text-center">
                              <input
                                className="w-7 text-center"
                                value={task?.Plan2}
                                onChange={(e) =>
                                  handleInputChange(index, "Plan2", e.target.value)
                                }
                              />
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 w-5 px-1 text-center">
                          <input
                            className="w-7 text-center"
                            value={task?.Act}
                            onChange={(e) =>
                              handleInputChange(index, "Act", e.target.value)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 w-5 px-1 text-center">
                          <input
                            className="w-7 text-center"
                            value={task?.Pre}
                            onChange={(e) =>
                              handleInputChange(index, "Pre", e.target.value)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 w-5 px-1 text-center">
                          <input
                            className="w-9 text-center"
                            value={
                              task?.left_1
                                ? Math.min(parseInt(task.left_1, 10), 100)
                                : " "
                            }
                            onChange={(e) =>
                              handleInputChange(index, "left_1", e.target.value)
                            }
                          />
                        </td>
                        {!minimizedTables.progress && (
                          <>
                            <td className="border border-gray-300 text-center">
                              <input
                                className="w-[100px] px-1"
                                value={task?.Updated}
                                onChange={(e) =>
                                  handleInputChange(index, "Updated", e.target.value)
                                }
                              />
                            </td>
                            <td className="border border-gray-300 w-5 px-1 text-center">
                              <input
                                className="w-[40px] text-center"
                                value={
                                  task?.per
                                    ? Math.min(parseInt(task.per, 10), 100)
                                    : " "
                                }
                                onChange={(e) =>
                                  handleInputChange(index, "per", e.target.value)
                                }
                              />
                            </td>
                            <td className="border border-gray-300 w-5 px-1 text-center">
                              <input
                                className="w-[40px] text-center"
                                value={
                                  task?.per
                                    ? Math.max(
                                      0,
                                      Math.min(parseInt(task?.left_2, 10) || " ", 100)
                                    )
                                    : " "
                                }
                                onChange={(e) =>
                                  handleInputChange(index, "left_2", e.target.value)
                                }
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table
                  className={`border-collapse border border-gray-300 transition-all duration-200 ${minimizedTables.completion ? "w-[20%]" : "w-full"
                    } overflow-hidden`}
                >
                  <thead>
                    <tr
                      className="mainheaders editable-table bg-gray-700 text-white h-8 cursor-pointer"
                      onClick={() => toggleTableWidth("completion")}
                    >
                      <th colSpan={minimizedTables.completion ? "2" : "3"}>
                        <p className="pl-2">Completion Table</p>
                      </th>
                    </tr>
                    {!minimizedTables.completion && (
                      <tr>
                        <th className="bg-gray-300 w-9 border-r-700">
                          <label style={{ width: "70px" }}>
                            <input
                              className="w-4 mr-2"
                              name="selectall"
                              type="checkbox"
                              checked={DoneAll}
                              onChange={Done_All}
                            />
                            Done
                          </label>
                        </th>
                        <th className="bg-gray-300 border-r-700 px-2">
                          <p className="pl-1">Owner</p>
                        </th>
                        <th className="bg-gray-300 border-r-700 px-2">
                          <p
                            className="pl-1"
                            style={{
                              width: "140px",
                            }}
                          >
                            Completion Date
                          </p>
                        </th>
                      </tr>
                    )}
                    {minimizedTables.completion && (
                      <tr>
                        <th className="bg-gray-300 w-9 border-r-700">
                          <label style={{ width: "70px" }}>
                            <input
                              className="w-4 mr-2"
                              name="selectall"
                              type="checkbox"
                              checked={DoneAll}
                              onChange={Done_All}
                            />
                            Done
                          </label>
                        </th>
                        <th className="bg-gray-300 border-r-700 px-2">
                          <p className="pl-1">Owner</p>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody id="attendees-list">
                    {subs.map((task, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 w-15 px-1 text-center">
                          <input
                            className="w-4 mr-1"
                            type="checkbox"
                            checked={task.isDone || false}
                            onChange={(e) => Done_Check_Box(e, task.id)}
                          />
                        </td>
                        <td className="border border-gray-300 w-3 px-1 text-center">
                          <Employee_Dropdown
                            emp={emp}
                            value={task.Owner}
                            onChange={(e) => OwnerChange(e, task.id)}
                          />
                        </td>
                        {!minimizedTables.completion && (
                          <td className="border border-gray-300 w-15 px-1 text-center">
                            <input
                              className="w-7 text-center"
                              value={task?.Pre}
                              onChange={(e) =>
                                handleInputChange(index, "Pre", e.target.value)
                              }
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col max-w-[96.45%] flex-row md:flex-row gap-2">
                <table className="border-collapse border sm:w-[50%] min-w-[150px] lg:w-full border-gray-300">
                  <thead>
                    <tr className="border-2 bg-gray-700 h-8 min-w-[150px] text-white ">
                      <th colspan="5">
                        {" "}
                        <p className="pl-2 w-[130px]">Task Name</p>
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-white text-white">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr className="">
                      <td className="border border-gray-300"></td>
                      <td className="border border-gray-300 w-72 overflow-hidden text-overflow-ellipsis whitespace-nowrap"></td>
                    </tr>
                  </tbody>
                </table>
                <table className=" border-collapse border sm:w-[25%] lg:w-full border-gray-300">
                  <thead>
                    <tr className="mainheaders h-8 editable-table bg-gray-700 text-white">
                      <th colspan="7">
                        {" "}
                        <p className="pl-2">Hours</p>
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-gray-300 broder-r-700">
                        {" "}
                        <p className="pl-1">Est</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        {" "}
                        <p className="pl-1">DL</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700">
                        <p className="pl-1">RFI</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700">
                        <p className="pl-1">PD</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700">
                        <p className="pl-1">Buf</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700">
                        <p className="pl-1">Adj</p>{" "}
                      </th>
                      <th className="bg-gray-300 broder-r-700">
                        {" "}
                        <p className="pl-1">Plan</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr className="">
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className=" border-collapse border sm:w-[25%] lg:w-full border-gray-300">
                  <thead>
                    <tr className="border-2 bg-gray-700  text-white h-8">
                      <th colspan="3">
                        {" "}
                        <p className="pl-2">Supply & Completion Dates</p>
                      </th>
                    </tr>
                    <tr className="bg-gray-300">
                      <th>
                        <p className="pl-1">Doc Supply</p>
                      </th>
                      <th width="20px">
                        <p className="pl-1">C%</p>
                      </th>
                      <th>
                        <p className="pl-1">Completion</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr>
                      <td className="border border-gray-300">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
                <table className=" border-collapse border sm:w-[25%] lg:w-full border-gray-300">
                  <thead>
                    <tr className="mainheaders  editable-table h-8 bg-gray-700 text-white">
                      <th colspan="6">
                        {" "}
                        <p className="pl-2">Priority & Team Size</p>
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">PP</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">RAP</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">Pri</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">TS</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">DD</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 ">
                        <p className="pl-1">SP</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                      <td className="border border-gray-300 px-2">
                        <div className="w-7"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className=" border-collapse border sm:w-[25%] lg:w-full border-gray-300">
                  <thead>
                    <tr className="border-2 bg-gray-700 text-white h-8">
                      <th colspan="6">
                        {" "}
                        <p className="pl-2">Allocation</p>
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-gray-300">
                        <p className="pl-1">Algorithim 1</p>
                      </th>
                      <th className="bg-gray-300">
                        <p className="pl-1">Algorithim 2</p>
                      </th>
                      <th className="bg-gray-300">
                        <p className="pl-1">Algorithim 3</p>
                      </th>
                      <th className="bg-gray-300">
                        <p className="pl-1">Override 1</p>
                      </th>
                      <th className="bg-gray-300">
                        <p className="pl-1">Override 2</p>
                      </th>
                      <th className="bg-gray-300">
                        <p className="pl-1">Override 3</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr>
                      <td className="border border-gray-300 px-2 ">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <div className="w-28"></div>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <div className="w-28"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className=" border-collapse border sm:w-[25%] lg:w-full  border-gray-300">
                  <thead>
                    <tr className="mainheaders editable-table bg-gray-700 text-white h-8">
                      <th colspan="4">
                        {" "}
                        <p className="pl-2">Progress - Data</p>
                      </th>
                      <th colspan="3">
                        {" "}
                        <p className="pl-2">Progress - Accessed</p>
                      </th>
                    </tr>
                    <tr className="">
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">Plan</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">Act</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">Pre</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">left</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">Updated</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">%</p>
                      </th>
                      <th className="bg-gray-300 broder-r-700 px-2">
                        <p className="pl-1">left</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                    </tr>
                  </tbody>
                </table>
                <table className="border-collapse border sm:w-1/4 lg:w-full border-gray-300">
                  <thead>
                    <tr className="mainheaders editable-table bg-gray-700 text-white h-8">
                      <th colSpan="3">
                        <p className="pl-2">Completion</p>
                      </th>
                    </tr>
                    <tr>
                      <th className="bg-gray-300  border-gray-700">
                        <div className="flex items-center">
                          <input
                            className="w-4 mr-2"
                            name="selectall"
                            type="checkbox"
                            checked={DoneAll}
                            onChange={Done_All}
                          />
                          <p>Done</p>
                        </div>
                      </th>
                      <th className="bg-gray-300  border-gray-700 px-2">
                        <p>Owner</p>
                      </th>
                      <th className="bg-gray-300  border-gray-700 px-2">
                        <p className="w-[130px]">Completion Date</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="attendees-list">
                    <tr>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <ThemeProvider theme={createTheme()}>
        {Project_Copy_Model && (
          <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={Project_Copy_Model}
          >
            <Project_Copy_Mod
              selectproject={selectedProject}
              selectedKey={selectedKey}
              setSelectedProjectName={setSelectedProject} // Pass the setSelectedProject function here
              onClose={handlehideModalprojecy}
              fetchProjects={fetchProjects}
            />
          </Backdrop>
        )}

        {Part_Copy_Model && (
          <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={Part_Copy_Model}
          >
            <Part_Copy_Mod
              selectproject={selectedProject}
              selectedKey={selectedKey}
              selectedParts={selectedParts}
              selectedProjectName={selectedProjectName}
              onClose={Close_Part_Copy_Model}
              fetchProjects={fetchProjects}
            />
          </Backdrop>
        )}

        {showModal && (
          <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={showModal}
          >
            <Create_New_Project
              fetchProjects={fetchProjects}
              fetchSubs={fetchSubs}
              changefalse={handleCloseModal}
              selectedPart={selectedParts}
              selectedProjectName={selectedProjectName}
              selectedPartName={
                selectedPartName === "Select Part" ? "" : selectedPartName
              }
            />
          </Backdrop>
        )}

        {showSuccessAlert && (
          <Alert className="absolute left-[40%] top-[-5%]" severity="success">
            Data updated successfully.
          </Alert>
        )}
      </ThemeProvider>

      {showAlert && (
        // delete conformation
        <Delete_Popup
          confirmation={() => {
            if (confirmationAction) {
              confirmationAction();
            }
            handleCloseAlert();
          }}
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
};
