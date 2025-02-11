import Form from 'react-bootstrap/Form';

export const Employee_Dropdown = ({ value, onChange, emp }) => {
    const handleSelectionChange = (event) => {
        const selectedId = event.target.value;
        if (selectedId === '') {
            onChange({ target: { value: '' } });
        } else {
            const selectedEmployee = emp.find(empItem => empItem.id.toString() === selectedId);
            if (selectedEmployee) {
                onChange({ target: { value: selectedEmployee.first_name } });
            }
        }
    };

    // Find the corresponding employee to get the id for setting the selected key
    const selectedEmployee = emp.find(empItem => empItem.first_name === value);
    const selectedKey = selectedEmployee ? selectedEmployee.id.toString() : '';

    return (
        <div className='rounded-2xl'>
            <Form.Select
                id='override'
                className='w-[137px]'
                value={selectedKey}
                onChange={handleSelectionChange}
            >
                <option key="" value=""></option>
                {emp.map(empItem => (
                    <option key={empItem.id} value={empItem.id.toString()}>
                        {empItem.first_name}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};

