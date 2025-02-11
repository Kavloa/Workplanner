import React, { useState, useEffect } from "react";
import axiosClient from "@axios";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Popup_DatePicker from "./PopupDatePicker_Model";

export default function Project_Copy_Mod({
  onClose,
  onSave,
  selectproject,
  selectedKey,
  setSelectedProjectName,
}) {
  const [error, setError] = useState("");
  const [start, setStart] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [end, setEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [partName, setPartName] = useState("");

  const fetchProjects = async () => {
    const resp = await axiosClient.get("projects");
    setProjects(resp.data.project);
  };

  const generateUniqueColor = (taskId) => {
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
  };

  const extractTaskId = (taskName) => {
    if (typeof taskName === "string") {
      var numbers = taskName.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        return parseInt(numbers[0]);
      }
    }
    return null;
  };

  const send = async (e) => {
    e.preventDefault();
    fetchProjects();

    setError("");

    const project = projects.find(
      (project) => project.ProjectName === projectName
    );

    if (project) {
      if (Array.isArray(project.parts) && project.parts.length > 0) {
        const partExists = project.parts.some(
          (part) => part.PartName === partName
        );

        if (partExists) {
          setError("The project & The part already exist");
          return;
        }
      }
    }

    try {
      const code = extractTaskId(projectName);
      const color = generateUniqueColor(code || null);

      const formData = {
        nameProject: projectName,
        namePart: partName,
        type: selectedKey,
        selectproject: selectproject,
        color: color,
        start_date: start,
        end_date: end,
      };
      await axiosClient.post("project/copy", formData);
      window.location.reload();
    } catch (error) {
      console.error("Error sending form data:", error);
    }
  };

  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="fixed ml-[32%] mt-48 z-50 w-full p-2 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full flex flex-col justify-center items-start gap-6 max-w-[700px] shadow-2xl p-3 bg-white rounded-lg">
          <h1 className="text-2xl w-full text-left">
            {" "}
            Duplicate Project {selectedKey}
          </h1>

          <form onSubmit={send} className="w-full">
            <div className="flex-col flex pt-2 gap-4 max-w-full max-h-full p-2 pb-2">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                  <div className="flex flex-col">
                    <label className="text-lg pb-1 pr-6">Project Name</label>
                    <input
                      className="border hourly-rate w-22 h-12 rounded-lg px-4"
                      type="text"
                      name="projectName"
                      placeholder="Select or enter a project"
                      list="existingProjects"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-lg pb-1" >Part Name</label>
                    <input
                      className="border hourly-rate w-62 h-12 rounded-lg  px-4"
                      type="text"
                      name="PartName"
                      placeholder="Select or enter part Name"
                      list="existingParts"
                      value={partName}
                      onChange={(e) => setPartName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">



                <div className="flex flex-col">
                  <label className="text-lg pb-1 " >Start Date</label>
                  {/* <input
                    type="date"
                    className="border hourly-rate w-[170px] h-10 rounded-lg px-2"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />\ */}
                  <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
                    <Popup_DatePicker
                      value={start}
                      onChange={(date) => {
                        setStart(date);
                      }}
                    />
                  </div>

                </div>
                <div className="flex flex-col">
                  <label className="text-lg pb-1 " >End Date</label>
                  {/* <input
                    type="date"
                    className="border hourly-rate w-[170px] h-10 rounded-lg px-2"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  /> */}
                  <div className="border hourly-rate border-grey py-1.5 w-[118px] h-8 rounded-lg pl-2">
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
                className="bg-white p-1 z-[2000] rounded-lg px-1 hover:shadow-xl text-[#5fec13] min-w-[110px] border-[#5fec13] border-[1px]"
                type="submit"
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
