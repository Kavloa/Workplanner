import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosClient from "@axios";
import { Add_Nrm_Modal } from "./Components/Nrm_Model";
import { Add_Team_Modal } from "./Components/Team_Model";
import '@MainStyle';

const Operatives_Allocation = () => {
  // Load initial data from local storage or use default values
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [nrms, setNrms] = useState([]);
  const [teams, setTeams] = useState([]);
  const [data, setData] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Update local storage whenever data changes
  useEffect(() => {
    Getemploye();
  }, []);
  const Getemploye = async () => {
    try {
      const response = await axiosClient.get(`getemploye`);
      if (response.status === 200) {
        const { employees, nrms, teams } = response.data;
        const teamGroupedEmployees = teams.map((team) => ({
          teamName: team.name,
          members: employees.filter(
            (employee) => employee.team?.id === team.id
          ),
        }));
        setTeams(teams);
        setNrms(nrms);
        setData(teamGroupedEmployees); // Now 'data' contains employees grouped by their teams
      } else {
        alert("Problem fetching employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  // Function to add a new row under a specific category
  const addRow = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    console.log('Adding to team:', team);
  
    if (team) {
      const newEmployee = {
        id: Math.random(), // Temporary unique ID for UI rendering purposes
        first_name: '',
        nrms: [],
        team_id: team.id,
      };
      
      setData(prevData => prevData.map(dataItem => 
        dataItem.teamName === teamName ? {...dataItem, members: [...dataItem.members, newEmployee]} : dataItem
      ));
      console.log('Data after adding:', data); // This log might not reflect the update immediately due to setState's asynchronous nature
    } else {
      console.error('Team not found:', teamName);
    }
  };
  
  
  

  // Function to handle the selection of rows to delete
  const toggleRowSelection = (employeeId) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(employeeId)) {
        newSelectedRows.delete(employeeId);
    } else {
        newSelectedRows.add(employeeId);
    }
    setSelectedRows(newSelectedRows);
};

const deleteSelectedRows = () => {
  if (selectedRows.size > 0) {
      setShowModal(true); // Show the modal asking for confirmation
  } else {
      console.warn('No employees selected for deletion');
  }
};

const confirmDelete = async () => {
  const employeeIdsToDelete = Array.from(selectedRows);

  if (employeeIdsToDelete.length > 0) {
      try {
          await axiosClient.post('/delete-employees', { employeeIds: employeeIdsToDelete });
          Getemploye(); 
      } catch (error) {
          console.error('Error deleting employees:', error);
      }
  }

  setSelectedRows(new Set()); // Clear selection after deletion
  setShowModal(false); // Close the modal
};


  const saveData =async () => {
    try {
      const response = await axiosClient.post('/saveEmployee', data); // Adjust the URL as needed
      if (response.status === 200) {
        setShowSaveModal(true); // Show save confirmation modal on successful save
      }
      Getemploye();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const updateRowData = (teamName, employeeIndex, field, newValue, nrmId = null) => {
    setData((prevData) =>
      prevData.map((team) => {
        if (team.teamName === teamName) {
          return {
            ...team,
            members: team.members.map((member, index) => {
              if (index === employeeIndex) {
                if (field === "name") {
                  return { ...member, first_name: newValue };
                } else if (field === "OAP" && nrmId !== null) {
                  let nrmsUpdated = [...member.nrms];
                  const nrmIndex = nrmsUpdated.findIndex((nrm) => nrm.id === nrmId);
                  if (nrmIndex !== -1) {
                    let updatedNrm = { ...nrmsUpdated[nrmIndex], pivot: { ...nrmsUpdated[nrmIndex].pivot, OAP: newValue }};
                    nrmsUpdated[nrmIndex] = updatedNrm;
                  } else {
                    nrmsUpdated.push({
                      id: nrmId,
                      pivot: { OAP: newValue }
                    });
                  }
                  return { ...member, nrms: nrmsUpdated };
                }
              }
              return member;
            }),
          };
        }
        return team;
      })
    );
  };
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
const [showAddNrmModal, setShowAddNrmModal] = useState(false);
  


  return (
    <>
<div className="flex lg:w-[77.5%] sm:w-[100%] md:flex-row pl-7 gap-2">
  <h1
    className="flex text-3xl pr-[9px] lg:ml-0 "
    style={{
      fontFamily: "Helvetica Neue, Helvetica, Arial",
      fontSize: "3xl",
      paddingRight: "6px",
    }}
  >
    Operatives Allocation
  </h1>

  <div className="flex flex-grow justify-end gap-2">
    <button
      className="bg-white rounded-lg hover:shadow-xl px-[10px] flex justify-center items-center text-[#5fec13] border-[#5fec13] border-[1px] py-1 h-[8]"
      onClick={saveData}
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
    <button
      onClick={() => deleteSelectedRows()}
      className="bg-white p-[3px] rounded-lg allobtn2 hover:shadow-xl text-[#b97a57] min-w-[85px] border-[#b97a57] border-[1px]"
    >
      Delete
    </button>
    <button
      className="bg-white p-[3px] rounded-lg allobtn2 hover:shadow-xl text-blue-400 min-w-[140px] border-blue-400 border-[1px]"
      // variant="primary"
      onClick={() => setShowAddTeamModal(true)}
    >
      Team
    </button>
    <button
      className="bg-white p-[3px] rounded-lg allobtn2 hover:shadow-xl text-blue-400 min-w-[140px] border-blue-400 border-[1px]"
      // variant="secondary"
      onClick={() => setShowAddNrmModal(true)}
    >
      NRM Section
    </button>
  </div>
</div>

      <Add_Team_Modal
    show={showAddTeamModal}
    onHide={() => setShowAddTeamModal(false)}
    Getemploye={Getemploye}
  />
  <Add_Nrm_Modal
    show={showAddNrmModal}
    onHide={() => setShowAddNrmModal(false)}
    Getemploye={Getemploye}
  />
      <Table
        responsive
        striped
        bordered
        hover
        className="Text-center"
        size="sm"
        style={{ marginTop: "10px", marginLeft: "1.3%" }}
      >
        <thead>
          <tr className="">
            <th className="text-white darkgreyhead  text-center">Operative</th>
            <th colSpan={nrms.length+1} className="darkgreyhead text-white text-center">
              NRM Sections
            </th>
          </tr>
          <tr className="text-center    greyhead ">
            <th className="lightgreyhead  text-white">Name</th>
            {nrms.map((nrm) => (
              <th className="lightgreyhead  text-white" key={nrm.id}>
                {nrm.number}
              </th>
            ))}
            <th className="lightgreyhead  text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team) => (
            <React.Fragment key={team.teamName}>
              <tr className="team-header">
                <td colSpan="100" className="text-center greyhead text-white">
                  <strong>{team.teamName}</strong>
                  <Button
                    className="text-black bg-white text-sm mr-2 float-right "
                    onClick={() => addRow(team.teamName)} 
                  >
                    <svg
                      fill="#00a2e8"
                      height="17px"
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
                  </Button>
                 
                </td>
              </tr>

              {team.members.map((employee, index) => (
                <tr key={`${team.teamName}-${index}`}>
                  <td className="flex">
                  <Form.Check
                    className="mt-2 mr-2 bg-red"
                    type="checkbox"
                    checked={selectedRows.has(employee.id)} // Use employee ID to check if selected
                    onChange={() => toggleRowSelection(employee.id)} // Pass employee ID to the handler
                  />
                    <Form.Control
                        type="text"
                        className="m-0 py-0 w-[130px] pr-0"
                        value={employee.first_name}
                        onChange={(e) => updateRowData(team.teamName, index, "name", e.target.value)}
                      />
                  </td>
                  {nrms.map((nrm) => {
                    const employeeNrm = employee.nrms.find(
                      (en) => en.id === nrm.id
                    );
                    return (
                      <td key={nrm.id}>
                          <Form.Control
                            type="text"
                            className="bld mr-0 w-[50px] pr-0 bg-transparent"
                            value={employeeNrm ? employeeNrm.pivot.OAP : ""}
                            onChange={(e) => updateRowData(team.teamName, index, "OAP", e.target.value, nrm.id)}
                          />
                      </td>
                    );
                  })}
                  <td></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        id="deltpop"
        backdrop=""
        className=""
        onHide={() => setShowModal(false)}
      >
        <Modal.Header className="pl-[12px] pt-[7px] pb-[5px] pr-0"
        style={{border: 'none'}} closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pl-[12px] pt-[7px] pb-[5px] pr-0"  style={{border: 'none'}}>
          Are you sure you want to delete the selected row(s)?
        </Modal.Body>
        <Modal.Footer className="justify-content-end"  style={{border: 'none'}}>
          <Button className="text-black" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
          </Button>
          <Button className="text-[#b97a57] border-[#b97a57]" variant="danger" onClick={confirmDelete}>
              Delete
          </Button>
      </Modal.Footer>
      </Modal>
      <Modal
      size=""
          show={showSaveModal}
          onHide={() => setShowSaveModal(false)}
          backdrop=""
        >
          <Modal.Header closeButton>
            <Modal.Title>Data Saved</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Your changes have been successfully saved.
          </Modal.Body>
          <Modal.Footer>
            <Button className="text-black" variant="success" onClick={() => setShowSaveModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

    </>
  );
};

export default Operatives_Allocation;
