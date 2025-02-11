import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosClient from "@axios";

export const Add_Nrm_Modal = ({ show, onHide,Getemploye }) => {
    const [nrmNumber, setNrmNumber] = useState('');
    const [nrms, setNrms] = useState([]);
    const [editingNrmId, setEditingNrmId] = useState(null); // Add state to track the editing NRM ID

    // Existing code remains unchanged...

    const handleEdit = (nrm) => {
        setNrmNumber(nrm.number);
        setEditingNrmId(nrm.id); // Set the ID of the NRM being edited
    };

    const handleSave = async () => {
        if (!nrmNumber.trim()) {
            alert('Please enter an NRM number.');
            return;
        }

        try {
            let response;
            if (editingNrmId) {
                // If editingNrmId is set, update the existing NRM
                response = await axiosClient.put(`/nrms/${editingNrmId}`, { nrmNumber });
            } else {
                // If editingNrmId is not set, create a new NRM
                response = await axiosClient.post('/nrms', { nrmNumber });
            }

            if (response.data.success) {
                alert(editingNrmId ? 'NRM Section updated successfully' : 'NRM Section added successfully');
                setNrmNumber(''); // Reset the input
                setEditingNrmId(null); // Reset the editing state
                onHide(); // Hide the modal
                Getemploye(); // Refresh the NRM list
            } else {
                alert('Failed to save the NRM Section');
            }
        } catch (error) {
            console.error('Error saving the NRM Section:', error.response.data);
            alert('An error occurred while saving the NRM Section.');
        }
    };

    useEffect(() => {
        fetchNrms();
    }, []);

    const fetchNrms = async () => {
        try {
            const response = await axiosClient.get('/nrms');
            setNrms(response.data.nrm);
        } catch (error) {
            console.error('Error fetching NRMs:', error);
            alert('Failed to fetch NRM Sections.');
        }
    };


    const deleteNrm = async (id) => {
        try {
            const response = await axiosClient.delete(`/nrms/${id}`);
            if (response.data.success) {
                alert('NRM Section deleted successfully');
                fetchNrms(); // Refresh list after deletion
                Getemploye(); 
            } else {
                alert('Failed to delete the NRM Section');
            }
        } catch (error) {
            console.error('Error deleting the NRM Section:', error);
            alert('An error occurred while deleting the NRM Section.');
        }
    };


      
    return (
      <Modal backdrop="" show={show} onHide={onHide} >
        <Modal.Header closeButton>
          <Modal.Title>Add New NRM Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>NRM Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter NRM number"
                value={nrmNumber}
                onChange={(e) => setNrmNumber(e.target.value)}
              />
            </Form.Group>
          </Form>
          <div className="max-h-[600px] overflow-auto">
          <Table striped bordered hover >
                    <thead>
                        <tr>
                            <th>NRM Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody >
                        {nrms.map((nrm) => (
                            <tr key={nrm.id}>
                                <td>{nrm.number}</td>
                                <td className="gap-2 flex ">
                                <Button variant="info" onClick={() => handleEdit(nrm)}>Edit</Button>
                                    <Button className="text-black" variant="danger" onClick={() => deleteNrm(nrm.id)}>Delete</Button>
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
            Save NRM
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  