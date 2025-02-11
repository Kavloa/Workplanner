import { useEffect, useState } from "react";
import axiosClient from "@axios";
import { Input } from "@material-tailwind/react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Popup_DatePicker from "./PopupDatePicker_Model";

export default function Part_Copy_Mod({
  selectproject, selectedProjectName, selectedKey,
  onClose, selectedParts
}) {
  const [start, setStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [end, setEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [partName, setPartName] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    const resp = await axiosClient.get("projects");
    setProjects(resp.data.project);
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  projects.forEach(project => {
    if (project.parts && Array.isArray(project.parts) && project.parts.length > 0) {
      console.log(project.parts);
    }
  });




  const send = async (e) => {
    e.preventDefault();
    if (!start || !end) {
      alert("Please fill in both start and end dates.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const project = projects.find(project => project.ProjectName === selectedProjectName);
    if (project && project.parts.some(part => part.PartName === partName)) {
      setError('The part already exists in this project.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        nameProject: selectedProjectName,
        namePart: partName,
        selectedParts: selectedParts,
        type: selectedKey,
        selectproject: selectproject,
        start_date: start,
        end_date: end,
      };

      const response = await axiosClient.post("project/copy", formData);

      window.location.reload();
    } catch (error) {
      console.error("Error sending form data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="fixed ml-[32%] mt-64 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="absolute  w-full gap-10 overflow-auto max-w-[600px] max-h-full shadow-2xl p-4 bg-white rounded-lg">
          <form onSubmit={send} className="">
            <p className="text-[25px] pb-3 text-left">Duplicate Part</p>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="flex-row flex gap-7 pt-0 max-w-full max-h-full p-1 pb-4">
              <div className="flex flex-row gap-3">
                <div className="flex flex-col">
                  <label className="text-xl pb-1" >Part Name</label>
                  <input
                    className="border hourly-rate w-62 h-12 rounded-lg px-4"
                    type="text"
                    name="PartName"
                    placeholder="Select or enter part Name"
                    list="existingParts"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xl pb-1">Start Date</label>
                  <div className="border hourly-rate border-grey py-1.5 w-[130px] h-10 rounded-lg pl-2">
                    <Popup_DatePicker
                      value={start}
                      onChange={(date) => {
                        setStart(date);
                      }}
                    />
                  </div>


                </div>
                <div className="flex flex-col">
                  <label className="text-xl pb-1">End Date</label>

                  <div className="border hourly-rate border-grey py-1.5 w-[130px] h-10 rounded-lg pl-2">
                    <Popup_DatePicker
                      value={end}
                      onChange={(date) => {
                        setEnd(date);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 w-full justify-end">
              <button
                className="border-[1px] border-gray-500 text-[grey] px-4 rounded-md"
                onClick={onClose}
              >
                Back
              </button>
              <button
                className="bg-white p-1.5 rounded-lg px-2 hover:shadow-xl text-[#5fec13] min-w-[110px] border-[#5fec13] border-[1px]"
                type="submit"
                disabled={isSubmitting}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
