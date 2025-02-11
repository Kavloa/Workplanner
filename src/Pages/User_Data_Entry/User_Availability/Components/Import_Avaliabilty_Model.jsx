import React, { useState, useEffect } from "react";
import axiosClient from "@axios"; // Axios instance with base URL configured

export default function AvailabilityImport({ onClose,Employee }) {
    const [data, setData] = useState([]);
    const [sheetUrl, setSheetUrl] = useState("");
    const [sheetName, setSheetName] = useState("");
    const [Employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [Massage, setMassage] = useState("");
    useEffect(() => {
        if (Employee) {
            setEmployees(Employee);
        }
        // fetchEmployees()
        const loadGapiClient = () => {
            window.gapi.load("client:auth2", initClient);
        };

        const initClient = () => {
            window.gapi.client
                .init({
                    apiKey: "AIzaSyBbiKNH2-LY6RicbaHeg2csdZo-p0P1JYE",
                    clientId: "574390216553-263ppvpslgae04botec6t3glr1ivfgpt.apps.googleusercontent.com",
                    discoveryDocs: [
                        "https://sheets.googleapis.com/$discovery/rest?version=v4",
                    ],
                    scope: "https://www.googleapis.com/auth/spreadsheets",
                })
                .then(() => {
                    const authInstance = window.gapi.auth2.getAuthInstance();
                    if (!authInstance.isSignedIn.get()) {
                        authInstance.signIn();
                    }
                })
                .catch(() => {
                    // setError("Error initializing Google API client.");
                });
        };

        loadGapiClient();
    }, []);

    const extractSpreadsheetId = (url) => {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    };

    // const fetchEmployees = async () => {
    //     try {
    //         const resp = await axiosClient.get("/employees");
    //         setEmployees(resp.data.employees);
    //         return resp.data.employees;
    //     } catch (error) {
    //         console.error("Error fetching employees:", error);
    //         return null;
    //     }
    // };

    const saveToBackend = async (employeeObjects) => {
        try {
            const response = await axiosClient.post("/availabilitiesImport", { data: employeeObjects });
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error saving data to backend:", error);
            return { success: false, error: error.response?.data || error.message };
        }
    };

    const fetchData = async () => {
        const spreadsheetId = extractSpreadsheetId(sheetUrl);
        console.log("Extracted Spreadsheet ID:", spreadsheetId);

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
            console.log("Fetched Rows:", rows);

            // Extract the year from the sheet name
            const yearMatch = sheetName.match(/\b(19|20)\d{2}\b/); // Match a 4-digit year
            const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
            console.log("Extracted Year:", yearMatch);

            if (rows && rows.length) {
                const headers = rows[0]
                    .slice(1)
                    .filter((header) => header.trim() !== "");

                const employeeObjects = [];

                const employeeMap = {
                    "B-team (KM1)": "B-team KM",
                    "B-team (KM2)": "B-team KM",
                    "B-team (KM3)": "B-team KM",
                    "B-Team (AH1)": "B-team AH",
                    "B-Team (AH2)": "B-team AH",
                    "B-Team (AH3)": "B-team AH",
                };

                for (const row of rows.slice(1)) {
                    if (row.includes("Do not touch the table below")) {
                        console.log("Marker found. Stopping data collection.");
                        break;
                    }

                    // Map employee names using the employeeMap
                    const employeeName = employeeMap[row[1]] || row[0];
                    console.log(employeeName);

                    const processedData = headers.map((header, index) => {
                        const col1 = row[index * 2 + 1] || "";
                        const col2 = row[index * 2 + 2] || "";
                        const combined = `${col1} ${col2}`.trim();

                        const regex = /\d+/g;
                        const intValues = [...combined.matchAll(regex)].map((match) =>
                            parseInt(match[0], 10)
                        );

                        const includesH = combined.includes("H");

                        const [start1, end1, start2, end2] = intValues;
                        // Convert integer values to hours in hh:mm format
                        const formatHours = (value) => {
                            if (isNaN(value)) return null;
                            return `${String(value).padStart(2, "0")}:00`;
                        };

                        // Calculate the number of hours between start and end times
                        const calculateHours = (start, end) => {
                            if (!start || !end || isNaN(start) || isNaN(end)) return 0;
                            return Math.max(end - start, 0); // Ensure non-negative
                        };

                        const hours1 = calculateHours(start1, end1);
                        const hours2 = calculateHours(start2, end2);
                        const Total = hours1 + hours2;
                        const date = new Date(`${header} ${year}`);

                        return {
                            date: !isNaN(date.getTime())
                                ? new Date(date.setHours(date.getHours() + 4)).toISOString().split("T")[0] // Add 4 hours and convert to YYYY-MM-DD
                                : header, // If header is not a valid date, use it as-is
                            values: {
                                start1: formatHours(start1),
                                end1: formatHours(end1),
                                start2: formatHours(start2),
                                end2: formatHours(end2),
                                hours1, 
                                hours2, 
                                total: formatHours(Total), // Total for this day
                                formattedTotal: formatHours(Total),
                                hasH: includesH ? "H" : undefined,
                            },
                        };
                    });

                    if (employeeName === "B-team KM" || employeeName === "B-team AH") {
                        const teamMembers = Employees.filter((emp) =>
                            employeeName === "B-team KM"
                                ? ["B-team (KM1)", "B-team (KM2)", "B-team (KM3)"].includes(emp.first_name)
                                : ["B-Team (AH1)", "B-Team (AH2)", "B-Team (AH3)"].includes(emp.first_name)
                        );

                        const totalHours = processedData.reduce((sum, day) => sum + day.values.total, 0);

                        teamMembers.forEach((emp) => {
                            employeeObjects.push({
                                first_name: emp.first_name,
                                ID: emp.id,
                                total_ava: totalHours,
                                data: processedData, // Assign full processed data to all team members
                            });
                        });
                    } else {
                        // Handle other employees
                        const matchingEmployee = Employees.find((emp) => emp.first_name === employeeName);

                        if (matchingEmployee) {
                            const totalAva = processedData.reduce((sum, day) => sum + day.values.total, 0);

                            const employeeObject = {
                                first_name: matchingEmployee.first_name,
                                ID: matchingEmployee.id,
                                total_ava: totalAva, // Total hours for all days
                                data: processedData,
                            };
                            employeeObjects.push(employeeObject);
                        }
                    }
                }

                if (employeeObjects.length > 0) {
                    console.log("Employee Objects:", employeeObjects);
                    setData(employeeObjects);

                    const saveResponse = await saveToBackend(employeeObjects);
                    if (saveResponse.success) {
                        console.log("Data successfully saved to backend.");
                        return(setMassage("Data successfully saved"))

                    } else {
                        console.error("Failed to save data :", saveResponse.error);
                    }
                } else {
                    setError("No matching employees found in the spreadsheet.");
                }
            } else {
                setError("No data found in the specified range.");
            }
        } catch (err) {
            console.error("Detailed Error:", err);
            setError(err.result?.error?.message || "Error fetching data from Google Sheets.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchData = async (e) => {
        e.preventDefault();
    
        try {
            const employeeData = Employees;
            if (employeeData && employeeData.length > 0) {
                fetchData(); // Proceed only if there are employees
            } else {
                console.error("No employees found or failed to fetch employees.");
                setError("No employees found. Please check the employee data and try again.");
            }
        } catch (error) {
            console.error("Error handling fetch data:", error);
            setError("An error occurred while fetching employee data.");
        }
    };
    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
                <h1 className="text-2xl font-bold mb-4">Google Sheets Data Viewer</h1>
                <form onSubmit={handleFetchData} className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="sheetUrl" className="block text-sm font-medium">
                            Spreadsheet Link
                        </label>
                        <input
                            type="text"
                            id="sheetUrl"
                            value={sheetUrl}
                            placeholder="Enter Google Sheets URL"
                            onChange={(e) => setSheetUrl(e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="sheetName" className="block text-sm font-medium">
                            Sheet Name
                        </label>
                        <input
                            type="text"
                            id="sheetName"
                            value={sheetName}
                            placeholder="Enter Sheet Name"
                            onChange={(e) => setSheetName(e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Fetch Data
                    </button>
                </form>
                {isLoading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {Massage && <p className="text-green-500">{Massage}</p>}
                {/* {!isLoading && Array.isArray(data) && data.length > 0 && (
                    <pre className="bg-gray-100 p-4 rounded border overflow-auto max-h-96">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )} */}
            </div>
        </div>
    );
}
