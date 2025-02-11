import  { useState, useEffect } from "react";
import axiosClient from "@axios";

export default function Update_Hours_Mod({ onClose, onSave }) {
  const [data, setData] = useState([]);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nrms, setNrms] = useState([]);

  useEffect(() => {
    const loadGapiClient = () => {
      window.gapi.load("client:auth2", initClient);
    };

    const initClient = () => {
      window.gapi.client
        .init({
          apiKey: "AIzaSyBbiKNH2-LY6RicbaHeg2csdZo-p0P1JYE",
          clientId:
            "574390216553-263ppvpslgae04botec6t3glr1ivfgpt.apps.googleusercontent.com",
          clientSecret: "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",
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: "https://www.googleapis.com/auth/spreadsheets",
        })
        .then(() => {
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
            fetchData();
          } else {
            authInstance.signIn().then(fetchData);
          }
        })
        .catch((err) => {
          setError("Error initializing Google API client.");
        });
    };

    loadGapiClient();
  }, []);

  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fetchData = async () => {
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setError("Invalid Google Sheets URL.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}`,
      });
      const rows = response.result.values;

      if (rows && rows.length) {
        let allFilteredRows = [];

        for (let i = 0; i < nrms.length; i++) {
          const element = nrms[i];
          const filteredRows = rows.filter((row) =>
            row.some((cell) => cell.includes(element.Name))
          );

          if (filteredRows.length > 0) {
            allFilteredRows = [
              ...allFilteredRows,
              ...filteredRows.map((row) => [
                ...row,
                element.Sc_Name,
                element.Pri,
              ]),
            ];
          }
        }
        const convertTimeToMinutes = (timeString) => {
          if (!timeString) return 0; // Handle null or undefined time strings
          const [hours, minutes] = timeString.split(":").map(Number);
          if (isNaN(hours) || isNaN(minutes)) return 0; // Handle invalid time strings
          return hours;
        };
        const selectedData = allFilteredRows.map((row) => {
          const Scr_name = row[21] !== undefined ? row[21] : null;
          const Pri = row[22] !== undefined ? row[22] : null;
          const EST = row[6] !== undefined ? row[6] : null;
          const estValue = row[6] ? convertTimeToMinutes(row[6]) : 0;

          return [Scr_name, estValue, Pri];
        });
        console.log(selectedData);

        if (selectedData.length > 0) {
          setData(selectedData);
        } else {
          setError("No data found matching the element names.");
        }
      } else {
        setError("No data found in the specified range.");
      }
    } catch (err) {
      setError("Error fetching data from Google Sheets.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosClient.get("getemploye");
      if (response.status === 200) {
        const { employees, nrms, teams } = response.data;
        const teamGroupedEmployees = teams.map((team) => ({
          teamName: team.name,
          members: employees.filter(
            (employee) => employee.team?.id === team.id
          ),
        }));
        setNrms(nrms); // Set the NRM names to the state
        for (let i = 0; i < nrms.length; i++) {
          const element = nrms[i];
        }
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

  const handleSave = () => {
    const transformedData = data.map(([taskName, EST, Scr_name]) => ({
      taskName,
      EST,
      Scr_name,
    }));
    onSave(transformedData); // Pass the transformed data to onSave
  };

  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="fixed ml-[35%] mt-[30px] z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full flex flex-col justify-center  gap-6 max-w-[600px] shadow-2xl p-1 bg-white rounded-lg">
          <h1 className="text-2xl mt-[20px] text-center">Update Hours</h1>
          <form onSubmit={handleFetchData}>
            <div className="flex flex-col gap-2 pt-2 ml-[12%] pl-[0.2px] w-full">
              <h1 className="text-xl mb-[10px] text-left ">
                Import Spreadsheet
              </h1>

              <div className="flex flex-row w-[70%]">
                <label className="w-[60%]" htmlFor="sheetUrl">
                  Spreadsheet Link
                </label>
                <input
                  type="text"
                  id="sheetUrl"
                  value={sheetUrl}
                  placeholder="Please Input spreadsheet Link"
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="rounded border p-1 w-full"
                  required
                />
              </div>
              <div className="flex flex-row w-[70%]">
                <label className="w-[60%]" htmlFor="sheetName">
                  Sheet Name
                </label>
                <input
                  type="text"
                  id="sheetName"
                  value={sheetName}
                  placeholder="Please Input Sheet Name"
                  onChange={(e) => setSheetName(e.target.value)}
                  className="rounded border p-1 w-full"
                  required
                />
              </div>
            </div>
            <div className="gap-4 max-h-[700px] ml-[10%] max-w-[500px] p-2 overflow-y-auto overflow-x-hidden mt-[9px]">
              {data.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-[50px]  max-h-[700px] p-2"
                >
                  <input
                    type="text"
                    name={`secondValue-${index}`}
                    value={row[0]}
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index][0] = e.target.value;
                      setData(newData);
                    }}
                    className="rounded border hourly-rate w-22 px-2"
                  />
                  <input
                    type="text"
                    name={`seventhValue-${index}`}
                    value={row[1]}
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index][1] = e.target.value;
                      setData(newData);
                    }}
                    className="rounded border hourly-rate w-12 px-2"
                  />
                </div>
              ))}
            </div>
            {isLoading && <p>Loading...</p>}

            <div className="flex flex-row mb-[30px] gap-2 w-full justify-center mt-2">
              <button
                type="button"
                className="border-gray-500 text-l text-[grey] border-[1px] p-1 px-3 rounded-md"
                onClick={onClose}
              >
                Back
              </button>

              <button
                type="submit"
                className="rounded-lg bg-white gap-1 flex-row flex justify-center items-center text-[#00a2e8] text-l border-[#00a2e8] min-w-[85px] py-0 h-[38px] border-[1px]"
              >
                <svg
                  width="18px"
                  height="64px"
                  viewBox="-4 0 34 34"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g fill="none" fill-rule="evenodd">
                      <g>
                        <path
                          d="M1 1.993c0-.55.45-.993.995-.993h17.01c.55 0 1.34.275 1.776.625l3.44 2.75c.43.345.78 1.065.78 1.622v26.006c0 .55-.447.997-1 .997H2c-.552 0-1-.452-1-.993V1.993z"
                          stroke="#00a2e8"
                          stroke-width="2"
                        ></path>
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
                Import
              </button>
              <button
                onClick={() => {
                  handleSave();
                  // onClose();
                }}
                type="button"
                className="border-[#5fec13] border-[1px] text-l flex text-[#5fec13] justify-center min-w-[60px] rounded-lg pt-[6px] px-[10.5px]"
              >
                <i class="saveicon">
                  <svg
                    className="w-[18px] h-4.5 mt-[3px] mr-1"
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
          {/* {error && <p className="text-red-500">{error}</p>} */}
        </div>
      </div>
    </>
  );
}
