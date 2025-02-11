import { useEffect, useState } from "react";
import axiosClient from "@axios";
import duplicateicon from "./duplicate.png";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Popup_DatePicker from "./PopupDatePicker_Model";

export default function Create_New_Project({
  selectedPart,
  changefalse,
  fetchSubs,
  selectedProjectName,
  selectedPartName
}) {
  const [start, setStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [end, setEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [PP, setPP] = useState("")
  const [subs, setSubs] = useState({
    projectName: selectedProjectName && selectedProjectName !== "Select Project" ? selectedProjectName : "",
    PartsName: selectedPartName ? selectedPartName : "",
    TaskName: "",
    Est: "",
    DL: "",
    RFI: "",
    PD: "",
    Buf: "",
    PP: PP,
    RAP: "",
    Adj: "",
    Plan: "",
    Doc_Supply: start,
    Completion: end,
  });
  const addRow = (e) => {
    e.preventDefault();
    setRows([
      ...rows,
      {
        projectName: selectedProjectName && selectedProjectName !== "Select Project" ? selectedProjectName : "",
        PartsName: selectedPartName ? selectedPartName : "",
        TaskName: "",
        Est: "",
        DL: "",
        RFI: "",
        PD: "",
        PP: PP,
        RAP: "",
        Buf: "",
        Adj: "",
        Plan: "",
        Doc_Supply: start,
        Completion: end
      },
    ]);
  };

  const [data, setData] = useState([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [nrms, setNrms] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [partName, setPartName] = useState('');
  const [rows, setRows] = useState([subs]);

  useEffect(() => {
    const loadGapiClient = () => {
      window.gapi.load('client:auth2', initClient);
    };

    const initClient = () => {
      window.gapi.client.init({
        apiKey: 'AIzaSyBbiKNH2-LY6RicbaHeg2csdZo-p0P1JYE',
        clientId: '574390216553-263ppvpslgae04botec6t3glr1ivfgpt.apps.googleusercontent.com',
        clientSecret: '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',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets',
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance.isSignedIn.get()) {
          fetchData();
        } else {
          authInstance.signIn().then(fetchData);
        }
      }).catch(err => {
        setError('Error initializing Google API client.');
      });
    };

    loadGapiClient();
    fetchProjects();
  }, []);

  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };


  const fetchData = async () => {
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setError('Invalid Google Sheets URL.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}`
      });
      const rows = response.result.values;

      if (rows && rows.length) {
        let allFilteredRows = [];

        for (let i = 0; i < nrms.length; i++) {
          const element = nrms[i];
          const filteredRows = rows.filter(row => row.some(cell => cell.includes(element.Name)));

          if (filteredRows.length > 0) {
            allFilteredRows = [...allFilteredRows, ...filteredRows.map(row => [...row, element.Sc_Name, element.Pri])];
          }
        }

        const selectedData = allFilteredRows.map(row => {
          const Scr_name = row[21] !== undefined ? row[21] : null;
          const Pri = row[22] !== undefined ? row[22] : null;
          const EST = row[6] !== undefined ? row[6] : null;
          return [Scr_name, Pri, EST];
        });

        const convertTimeToMinutes = (timeString) => {
          if (!timeString) return 0; // Handle null or undefined time strings
          const [hours, minutes] = timeString.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) return 0; // Handle invalid time strings
          return hours;
        };



        const newRows = selectedData.map(item => {
          const estValue = item[2] ? convertTimeToMinutes(item[2]) : 0;
          console.log(selectedData);
          return {
            projectName: selectedProjectName || "",
            PartsName: selectedPartName || "",
            TaskName: item[0] || "",
            Est: estValue,
            DL: "",
            RFI: "",
            PD: "",
            Buf: "",
            Adj: "",
            Plan: estValue,
            Doc_Supply: start,
            Completion: end,
            RAP: item[1] || "",
            PP: PP,
            Pri: parseInt(PP) + item[1], // Use parseInt() to convert PP to an integer
            Plan2: estValue,
            left_1: estValue,
            per: 0,
            left_2: 100,
          };
        });

        setRows(newRows);
      } else {
        setError('No data found matching the element names.');
      }
    } catch (err) {
      setError('Error fetching data from Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchEmployees = async () => {
    try {
      const response = await axiosClient.get("getemploye");
      console.log(response);
      if (response.status === 200) {
        const { employees, nrms, teams } = response.data;
        const teamGroupedEmployees = teams.map((team) => ({
          teamName: team.name,
          members: employees.filter(
            (employee) => employee.team?.id === team.id
          ),
        }));
        setNrms(nrms);
      } else {
        alert("Problem fetching employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);



  const handleFetchData = (e) => {
    e.preventDefault();
    fetchData();
  };

  const duplicate = (index, e) => {
    e.preventDefault();
    const rowToDuplicate = rows[index];
    const duplicatedRow = { ...rowToDuplicate };
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows.splice(index + 1, 0, duplicatedRow);
      return newRows;
    });
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setSubs((prevSubs) => ({
      ...prevSubs,
      [field]: value,
    }));
  };

  const handleRowInputChange = (e, field, index) => {
    // Determine the value based on the field type
    let value = (field === "Doc_Supply" || field === "Completion") ? e : e?.target?.value;

    // Clone the rows to avoid directly mutating state
    const updatedRows = [...rows];
    const currentRow = updatedRows[index];

    // Only update if the value has actually changed
    if (currentRow[field] !== value) {
      currentRow[field] = value;

      // Recalculate the "Plan" field if relevant fields are updated
      if (["PD", "DL", "Est", "Buf", "Adj"].includes(field)) {
        const pd = parseFloat(currentRow['PD'] || 0);
        const dl = parseFloat(currentRow['DL'] || 0);
        const est = parseFloat(currentRow['Est'] || 0);
        const buf = parseFloat(currentRow['Buf'] || 0);
        const adj = parseFloat(currentRow['Adj'] || 0);

        currentRow['Plan'] = pd || dl || est ? (pd || dl || est) + buf + adj : 0;
      }

      // Update the rows state
      console.log(currentRow['Doc_Supply']);

      updatedRows[index] = { ...currentRow };
      setRows(updatedRows);
    }
  };


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

  function extractTaskId(taskName) {
    if (typeof taskName === "string") {
      var numbers = taskName.match(/\d+/g); // Extract numbers from the task name
      if (numbers && numbers.length > 0) {
        return parseInt(numbers[0]); // Use the first extracted number as the task ID
      }
    }
    return null;
  }

  const send = async (e) => {
    e.preventDefault();

    const emptyTasks = rows.filter((row) => !row.TaskName || !row.Doc_Supply || !row.Completion);

    if (!subs.projectName || !subs.PartsName || emptyTasks.length > 0) {
      let errorMessage = "Validation failed:";
      if (!subs.projectName) errorMessage += " projectName is empty.";
      if (!subs.PartsName) errorMessage += " PartsName is empty.";
      if (emptyTasks.length > 0) {
        errorMessage += " The following tasks have empty fields:";
        emptyTasks.forEach((row) => {
          if (!row.TaskName) errorMessage += ` TaskName is empty for task .`;
          if (!row.Doc_Supply) errorMessage += ` Doc_Supply is empty for task.`;
          if (!row.Completion) errorMessage += ` Completion is empty for task .`;
        });
        alert(errorMessage);
        return;
      }

    }
    const taskNames = rows.map((row) => row.TaskName);
    const doc = rows.map((row) => row.Doc_Supply = start)
    const com = rows.map((row) => row.Completion = end)
    const duplicateTaskNames = taskNames.filter((taskName, index) => taskNames.indexOf(taskName) !== index);
    console.log(doc, com);
    if (duplicateTaskNames.length > 0) {
      alert("Duplicate task names found: " + duplicateTaskNames.join(', '));
      return;
    }

    try {
      const code = extractTaskId(subs.projectName);
      const color = generateUniqueColor(code || null);
      const formData = {
        nameProject: subs.projectName,
        part: subs.PartsName,
        subsList: rows,
        color: color
      };

      console.log(formData);

      const response = await axiosClient.post("subs", formData);
      if (response.data && response.data.message1) {
        if (response.data.message1) {
          alert(response.data.message1);
        } else {
          alert(response.data.message);
        }
      } else {
        changefalse();
        fetchProjects();
        window.location.reload();
        fetchSubs(selectedPart);
      }
    } catch (error) {
      alert("Error sending form data: " + error.message);
    }
  };

  const deleteRow = (index, e) => {
    e.preventDefault();

    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const [projects, setProjects] = useState([]);
  const fetchProjects = async () => {
    const resp = await axiosClient.get("projects");
    setProjects(resp.data.project);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const [Parts, setParts] = useState([]);

  const fetchParts = async (projectId) => {
    const resp = await axiosClient.post(`parts/name`, { projectId: projectId });
    setParts(resp.data.parts);
  };

  useEffect(() => {
    if (subs.projectName) {
      fetchParts(subs.projectName);
    }
    // console.log(subs , "Ss");
    // console.log(data);
  }, [subs.projectName]);


  const calculateMinDate = (docSupplyDate) => {
    if (!docSupplyDate) return ''; // Handle the case when Doc_Supply is not provided
    const supplyDate = new Date(docSupplyDate);
    supplyDate.setDate(supplyDate.getDate() + 1); // Add one day
    const year = supplyDate.getFullYear();
    const month = String(supplyDate.getMonth() + 1).padStart(2, '0');
    const day = String(supplyDate.getDate()).padStart(2, '0');
    return supplyDate;
  };
  const handlePPChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) setPP(value);
  };

  const updateAllRows = (field, value) => {
    const updatedRows = rows.map((row) => ({
      ...row,
      [field]: value,
    }));
    setRows(updatedRows);
  };

  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="fixed ml-[30%] mt-20 z-10 w-[170%] p-4 md:inset-0 overflow-hidden h-[calc(100%-1rem)] max-h-[80%]"
      >
        <div className="relative w-[70%] gap-4 flex flex-col  overflow-auto  max-w-[855px] max-h-full shadow-2xl p-3 pb-5 bg-white rounded-lg">
          <h1 id="poph1" className="text-2xl pr-[61%] ">Add Project/Task </h1>

          <form onSubmit={handleFetchData} className="flex-row flex  z-[1000] mb-[-32.5px]">
            <div className="gap-2 pt-2 pl-[0.2px] flex-col flex w-[40%]">
              <label className=" " htmlFor="sheetUrl">Spreadsheet Link
              </label>
              <input
                type="text"
                id="sheetUrl"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="rounded border p-1 w-[100%]"
                required
              />
            </div>
            <div className="gap-2 p-2 flex-col ml-2 flex ">

              <label className="" htmlFor="sheetName">Sheet Name</label>
              <input
                type="text"
                id="sheetName"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="rounded border p-1 w-[70%]"
                required
              />
            </div>

            <div className="flex flex-row gap-2 mt-[5.2%] mx-[90px] h-[30px] justify-center ">
              <button
                className="border-[1px] border-gray-500 text-[grey] px-3 rounded-md"
                onClick={changefalse}
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg bg-white gap-1 flex-row flex justify-center items-center text-[#00a2e8] text-l border-[#00a2e8] min-w-[85px]   border-[1px]"
              >
                <svg width="18px" height="62px" viewBox="-4 0 34 34" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <g fill="none" fill-rule="evenodd">
                      <g>
                        <path d="M1 1.993c0-.55.45-.993.995-.993h17.01c.55 0 1.34.275 1.776.625l3.44 2.75c.43.345.78 1.065.78 1.622v26.006c0 .55-.447.997-1 .997H2c-.552 0-1-.452-1-.993V1.993z" stroke="#00a2e8" stroke-width="2"></path>
                        <g fill="#00a2e8">
                          <path d="M8 12h12v1H8z"></path>
                          <path d="M6 12h1v1H6z"></path>
                          <path d="M6 15h1v1H6z"></path>
                          <path d="M8 15h12v1H8z"></path>
                          <path d="M6 18h1v1H6z"></path>
                          <path d="M8 18h12v1H8z"></path>
                          <path d="M6 21h1v1H6z"></path>
                          <path d="M8 21h12v1H8z"></path>
                        </g>
                        <path fill="#00a2e8" d="M18 2h1v6h-1z"></path>
                        <path fill="#00a2e8" d="M18 7h6v1h-6z"></path>
                      </g>
                    </g>
                  </g>
                </svg>
                <p> Import</p>
              </button>
            </div>
          </form>

          {/* {isLoading && <p className="ml-[2px]">Loading...</p>} */}
          <div className="flex-row flex  gap-2 mb-[-62px] justify-end w-[90.5%]">



          </div>
          <form onSubmit={send} className="">
            <div className="flex mb-3 flex-wrap w-[100%]  justify-end gap-2">
              <button className="border-[#5fec13] z-[2000]  border-[1px] mt-[7px] mx-2 mb-[-9px] h-[30px]  flex text-[#5fec13] px-2 pt-[1px] rounded-md" type="submit">
                <i class="saveicon">
                  <svg
                    className="w-5 h-4.5 mt-[3px]  mr-1"
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
            <hr className="m-0" />
            <div className="flex-col flex  max-w-full py-2  pl-0">
              <div className="flex flex-row gap-2">
                <div>
                  <p>Project Name</p>
                  <input
                    className=" border hourly-rate w-[148%] h-8 rounded-lg border-grey pl-2"
                    type="text"
                    name="projectName"
                    placeholder="Select or enter a project"
                    list="existingProjects"
                    value={subs.projectName}
                    onChange={(e) => handleInputChange(e, "projectName")}
                  />
                  <datalist id="existingProjects">
                    {projects.map((project, index) => (
                      <option key={index} value={project.ProjectName} />
                    ))}
                  </datalist>
                </div >

                <div className="ml-[11.9%]">
                  <p>Project Part</p>
                  <input
                    className="border hourly-rate w-52 h-8 rounded-lg  border-grey pl-2 "
                    type="text"
                    name="PartsName"
                    placeholder="Project Part"
                    list="existingPaert"
                    value={subs.PartsName}
                    onChange={(e) => handleInputChange(e, "PartsName")}
                  />
                  <datalist className="bg-white" id="existingPaert">
                    {Parts.map((project, index) => (
                      <option className="bg-white" key={index} value={project.PartName} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col">
                  <p>Start Date</p>
                  <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
                    <Popup_DatePicker
                      value={start}
                      onChange={(date) => {
                        setStart(date);
                        updateAllRows("Doc_Supply", date);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p>End Date</p>
                  <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
                    <Popup_DatePicker
                      value={end}
                      onChange={(date) => {
                        setEnd(date);
                        updateAllRows("Completion", date);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p>PP</p>
                  <input
                    className="rounded border hourly-rate max-w-[45px] border-grey pl-2"
                    type="text"
                    value={PP}
                    placeholder="PP"
                    onChange={(e) => handlePPChange(e)} // Update the state
                  />
                </div>
              </div>
            </div>



            <div
              className="flexh-8 flex-col "
            >

              <table className="gap-2 flex flex-col border-collapse  border-gray-300">

                <tr className="w-[100%] bg-gray-300 broder-r-700 flex gap-4" >

                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-1">Task Name</p>{" "}
                  </th>
                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-[95px]">Est</p>{" "}
                  </th>
                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-3">Plan</p>
                  </th>
                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-4">Doc Supply</p>
                  </th>
                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-5">Completion</p>
                  </th>
                  <th className="bg-gray-300 broder-r-700">
                    {" "}
                    <p className="pl-8">Actions</p>
                  </th>

                </tr>

                <tbody className="flex gap-2 flex-col ">
                  {rows.map((row, index) => (
                    <tr className="flex   flex-row gap-3"
                      key={index}
                    >
                      <td className="flex-col   flex">
                        <input
                          className="rounded border hourly-rate max-w-[180px] border-grey pl-2"
                          type="text"
                          value={row.TaskName}
                          placeholder="Task Name"
                          onChange={(e) => handleRowInputChange(e, "TaskName", index)}
                        />
                      </td>
                      <td className="flex-col gap-2 flex">
                        <input
                          className="rounded border hourly-rate max-w-[45px] border-grey pl-2"
                          type="text"
                          value={row.Est}
                          placeholder="Est"
                          onChange={(e) => handleRowInputChange(e, "Est", index)}
                        />
                      </td>

                      <td className="flex-col gap-2 flex">
                        <input
                          pattern="^[0-9]+$"
                          className="rounded border hourly-rate max-w-[45px] border-grey pl-2"
                          type="text"
                          value={row.Plan}
                          placeholder="Plan"
                          readOnly
                          onChange={(e) => handleRowInputChange(e, "Plan", index)}
                        />
                      </td>
                      <td className="flex-col flex">
                        {/* <input
                          className="rounded border hourly-rate w-[120px] min-h-[19px] px-[6px] border-grey"
                          type="date"
                          size="lg"
                          value={start}
                          placeholder="Doc Supply"
                          onChange={(e) => handleRowInputChange(e, "Doc_Supply", index)}
                        /> */}
                  <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
                  <Popup_DatePicker
                            className="rounded border hourly-rate w-[120px] min-h-[19px] px-[6px] border-grey"
                            size="lg"
                            value={row.Doc_Supply}
                            placeholder="Doc Supply"
                            onChange={(e) => handleRowInputChange(e, "Doc_Supply", index)}
                          />

                        </div>
                      </td>
                      <td className="flex-col flex">
                      <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
                  <Popup_DatePicker
                            size="lg"
                            minDate={row.Doc_Supply} 
                            value={row.Completion}
                            placeholder="Completion"
                            onChange={(e) => handleRowInputChange(e, "Completion", index)}
                            />

                        </div>
                        {/* <input
                          className="rounded border hourly-rate w-[120px] min-h-[19px] px-[6px] border-grey"
                          type="date"
                          size="lg"
                          value={row.Completion}
                          min={calculateMinDate(row.Doc_Supply)}
                          placeholder="Completion"
                          onChange={(e) => handleRowInputChange(e, "Completion", index)}
                        /> */}
                      </td>
                      <td className="flex-col flex gap-[0.5px]">
                        <div className="gap-1 flex-row flex">
                          <button
                            onClick={(e) => addRow(e)}
                            className="px-[4px] h-[27.1px] border-[#00a2e8] border-[1px] rounded-[4px] text-black-600"
                          >
                            <svg
                              fill="#00a2e8"
                              height="20px"
                              viewBox="-1.7 0 20.4 20.4"
                              xmlns="http://www.w3.org/2000/svg"
                              className="cf-icon-svg"
                              stroke="#00a2e8"
                              strokeWidth="0.00020400000000000003"
                            >
                              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                              <g id="SVGRepo_iconCarrier">
                                <path d="M16.416 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.916 7.917zm-2.958.01a.792.792 0 0 0-.792-.792H9.284V6.12a.792.792 0 1 0-1.583 0V9.5H4.32a.792.792 0 0 0 0 1.584H7.7v3.382a.792.792 0 0 0 1.583 0v-3.382h3.382a.792.792 0 0 0 .792-.791z"></path>
                              </g>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => duplicate(index, e)}
                            className="px-[5px] py-0 h-[28px] rounded-md border-[#00a2e8] border-[1px]"
                          >
                            <img src={duplicateicon} alt="icon" className="w-[17px]" />
                          </button>
                          <button
                            className="px-[5px] py-0 h-[28px] border-[0.2px] border-[#c59174] rounded-[4px] text-black-600"
                            onClick={(e) => deleteRow(index, e)}
                          >
                            <svg
                              className="w-[17px] text-[#c59174] dlt"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 1024 1024"
                            >
                              <path
                                fill="currentColor"
                                d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}
