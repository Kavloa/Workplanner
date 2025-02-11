import { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import axiosClient from "@axios";

export const Add_Team_Modal = ({ show, onHide, Getemploye }) => {
  const [teamName, setTeamName] = useState("");
  
  const [teams, setTeams] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, [show]);

  const fetchTeams = async () => {
    try {
      const response = await axiosClient.get("/teams");
      setTeams(response.data.teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Failed to fetch teams.");
    }
  };

  const handleEdit = (team) => {
    setTeamName(team.name);
    setEditingTeamId(team.id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosClient.delete(`/teams/${id}`);
      if (response.data.success) {
        alert("Team deleted successfully");
        fetchTeams();
        Getemploye();
      } else {
        alert("Failed to delete the team");
      }
    } catch (error) {
      console.error("Error deleting the team:", error);
      alert("An error occurred while deleting the team.");
    }
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    try {
      let response;
      if (editingTeamId) {
        response = await axiosClient.put(`/teams/${editingTeamId}`, {
          name: teamName,
        });
      } else {
        response = await axiosClient.post("/teams", { name: teamName });
      }

      if (response.data.success) {
        alert(
          editingTeamId
            ? "Team updated successfully"
            : "Team added successfully"
        );
        setTeamName("");
        setEditingTeamId(null);
        onHide();
        Getemploye();
      } else {
        alert("Failed to save the team");
      }
    } catch (error) {
      console.error("Error saving the team:", error);
      alert("An error occurred while saving the team.");
    }
  };

  return (
    <Modal  backdrop="" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingTeamId ? "Edit Team" : "Add New Team"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </Form.Group>
        </Form>
        <div className="max-h-[900px] overflow-auto">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.name}</td>
                  <td className="gap-2 flex">
                    <Button
                      className="text-black"
                      variant="info"
                      onClick={() => handleEdit(team)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="text-black"
                      variant="danger"
                      onClick={() => handleDelete(team.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="text-black" variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button className="text-black" variant="primary" onClick={handleSave}>
          Save Team
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
