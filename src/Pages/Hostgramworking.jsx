import React, { useEffect, useState } from "react";
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import axiosClient from "@axios";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
;
import { Inputhours2 } from "./components/inputhous";
import { Inputhours3 } from "./components/inputview";
import { Button } from "@nextui-org/react";
import { Dropdown } from "react-bootstrap";

export const Hostgram = () => {
  const [data, setdata] = useState([]);
  const [filter, setfilter] = useState([]);
  const [updateddata, setupdateddata] = useState([]);
  const [latetask, setlatetask] = useState([]);
  const [view, setView] = useState("");
  const [Ganttdata, setGanttdata] = useState([]);


  // Function to fetch all task assignments
  const fetchAllAssignments = async () => {
    try {
      const resp = await axiosClient.get('/gantt');
      console.log('All Task Assignments:', resp.data);
      setGanttdata(resp.data);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  };

  // Function to fetch task assignments by task ID
  const fetchAssignmentsByTaskId = async (taskId) => {
    try {
      const resp = await axiosClient.get(`/gantt/task/${taskId}`);
      console.log(`Task Assignments for Task ID ${taskId}:`, resp.data);
    } catch (error) {
      console.error(`Error fetching tasks for Task ID ${taskId}:`, error);
    }
  };

  // Function to fetch task assignments by employee name
  const fetchAssignmentsByEmployee = async (employeeName) => {
    try {
      const resp = await axiosClient.get(`/gantt/employee/${employeeName}`);
      console.log(`Task Assignments for Employee ${employeeName}:`, resp.data);
    } catch (error) {
      console.error(`Error fetching tasks for Employee ${employeeName}:`, error);
    }
  };


  const Employee = async () => {
    try {
      const resp = await axiosClient.get("gethost");
      const storedTaskName = localStorage.getItem("taskname");

      // Filter tasks based on stored task name if it exists
      const filteredTasks = resp.data.employees;

      setdata(filteredTasks);
      // console.log(resp.data.employees);
      console.log(data);

      // Determine late tasks
      const lateTasks = [];
      const now = new Date();

      // Assuming resp.data.employees is an array of employee data
      // console.log("Employee Data:", resp.data.employees);

      resp.data.employees.forEach(task => {
        const endDate = new Date(task.end_date);
        const progress = task.progress;

        if (endDate <= now && progress < 100) {
          lateTasks.push(task);
        }
      });

      setlatetask(lateTasks);

      console.log("Late Tasks:", lateTasks);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };



  const Updatedalgo = async () => {
    const respo = await axiosClient.get("tasks");
    const updatedTasks = respo.data.map((task, index) => ({
      ...task,
      id: index + 1,
    }));
    // console.log("Updated Algo Data:", updatedTasks);
    setupdateddata(updatedTasks);
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
        setfilter(teamGroupedEmployees);
      } else {
        alert("Problem fetching employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  useEffect(() => {
    const isReloaded = sessionStorage.getItem("isReloaded");

    if (isReloaded) {
      Updatedalgo();
      fetchEmployees();
      Employee();
    } else {
      localStorage.removeItem("taskname");
      Updatedalgo();
      fetchEmployees();
      Employee();
    }
  }, []);

  const handleResetFilter = () => {
    localStorage.removeItem("taskname");
    window.location.reload();
  };

  const handleFilter = (clickedTask) => {
    localStorage.setItem("taskname", clickedTask.Ptask);
    sessionStorage.setItem("isReloaded", "true");
    window.location.reload();
  };

  const Today = () => {
    const today = new Date();
    gantt.showDate(today);
  };

  function extractTaskId(taskName) {
    var numbers = taskName.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0]);
    }
    return null;
  }
  gantt.plugins({
    // tooltip: true 
  });

  function formatDate(date) {
    let d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // gantt.config.tooltip_offset_x = 180;
  // gantt.config.tooltip_offset_y = 80;
  // gantt.templates.tooltip_text = function(start,end,task){
  //   console.log(task);



  // return "<b>Task:</b> " + task.text + "<br/>" + 
  //        "<b>Part Name:</b> " + task.part_Name + "<br/>" + 
  //        "<b>Start Date:</b> " + formatDate(task.start_date) + "<br/>" + 
  //        "<b>End Date:</b> " + formatDate(task.end_date);

  // }
  function generateUniqueColor(taskId) {
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

  useEffect(() => {
    const teamNames = filter.map(team => team.teamName);

    gantt.config.columns = [
      {
        name: "text",
        label: "Operative",
        tree: true,
        align: "left",
        width: 170,
        template: function (obj) {
          if (teamNames.includes(obj.text)) {
            return `<div style="background-color: #666666; color: white; padding-left: 10px; padding-right: 80px; width:100%; margin-right:0;">${obj.text}</div>`;
          } else {
            return `<div style="color: black; padding-left: 10px;">${obj.text}</div>`;
          }
        },
      },
    ];




    gantt.attachEvent("onGanttScroll", function (left, top) {
      const container = document.getElementById("gantt_container");
      if (container.scrollHeight > container.clientHeight) {
        // Add scroll bar if content overflows
        container.style.overflowY = "scroll";
      } else {
        container.style.overflowY = "hidden";
      }
    });

    // Enable smart rendering

    gantt.templates.subscale_class = (date) => {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend";
      }
      return "";
    };
  
    gantt.templates.task_cell_class = (task, date) => {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend";
      }
      return "";
    };
  
    gantt.config.smart_rendering = true;  
      gantt.config.render_item = true;


    var markers = [];
    var Size = [];

    if (view === "Day") {
      gantt.config.skip_off_time = false; // hides non-working time in the chart

      gantt.config.scales = [
        { unit: "month", step: 1, format: "%M" }, // Month scale
        { unit: "day", step: 1, format: "%d %D" } // Day scale
    ];
    
      gantt.templates.scale_cell_class = function (date) {
        var month = date.getMonth(); // Get the month index (0-11)

        var monthsToHighlight = [0, 2, 4, 6, 8, 10]; // Specify the months to highlight (0-11, where 0 is January)
        var monthsToIgnore = [1, 3, 5, 7, 9, 11];

        if (monthsToHighlight.includes(month)) {
          return "highlighted-month month_" + month;
        }

        if (monthsToIgnore.includes(month)) {
          return "ignore-month month_" + month;
        }

        if (date.getDay() === 0 || date.getDay() === 6) {
          return "weekend";
        }

        return "month_" + month;
      };

      gantt.templates.subscale_class = function (date) {
        if (date.getDay() === 0 || date.getDay() === 6) {
          return "weekend";
        }
        return "";
      };

      // CSS styles for each month cell and weekend
      var styles = `
          .month_0 { background-color: #CFCFCF; color: #000000; } /* January */
          .month_1 { background-color: #454545; color: #FFFFFF; } /* February */
          .month_2 { background-color: #CFCFCF; color: #000000; } /* March */
          .month_3 { background-color: #454545; color: #FFFFFF; } /* April */
          .month_4 { background-color: #CFCFCF; color: #000000; } /* May */
          .month_5 { background-color: #454545; color: #FFFFFF; } /* June */
          .month_6 { background-color: #CFCFCF; color: #000000; } /* July */
          .month_7 { background-color: #454545; color: #FFFFFF; } /* August */
          .month_8 { background-color: #CFCFCF; color: #000000; } /* September */
          .month_9 { background-color: #454545; color: #FFFFFF; } /* October */
          .month_10 { background-color: #CFCFCF; color: #000000; } /* November */
          .month_11 { background-color: #454545; color: #FFFFFF; } /* December */
          .highlighted-month { color: #000000 !important; } /* Highlighted months with black text */
          .ignore-month { color: #FFFFFF !important; } /* Highlighted months with black text */
          .weekend { background-color: #A9A9A9; color: #FFFFFF; } /* Weekend */
      `;

      var styleTag = document.createElement("style");
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);

      // Add template for weekends in task cells
      gantt.templates.task_cell_class = function (task, date) {
        if (date.getDay() === 0 || date.getDay() === 6) {
          return "weekend";
        }
        return "";
      };

      gantt.render();

    } else if (view === "Week") {
      gantt.config.skip_off_time = false; // hides non-working time in the chart

      gantt.config.scale_unit = "week";
      gantt.config.date_scale = "%j %M";
      gantt.templates.scale_cell_class = function (date) {
        var month = date.getMonth(); // Get the month index (0-11)

        var monthsToHighlight = [0, 2, 4, 6, 8, 10]; // Specify the months to highlight (0-11, where 0 is January)
        var monthsToIgnore = [1, 3, 5, 7, 9, 11];

        if (monthsToHighlight.includes(month)) {
          return "highlighted-month month_" + month;
        }

        if (monthsToIgnore.includes(month)) {
          return "ignore-month month_" + month;
        }

        return "month_" + month;
      };

      gantt.config.subscales = null;

      // CSS styles for each month cell
      var styles = `
          .month_0 { background-color: #CFCFCF; color: #000000; } /* January */
          .month_1 { background-color: #454545; color: #FFFFFF; } /* February */
          .month_2 { background-color: #CFCFCF; color: #000000; } /* March */
          .month_3 { background-color: #454545; color: #FFFFFF; } /* April */
          .month_4 { background-color: #CFCFCF; color: #000000; } /* May */
          .month_5 { background-color: #454545; color: #FFFFFF; } /* June */
          .month_6 { background-color: #CFCFCF; color: #000000; } /* July */
          .month_7 { background-color: #454545; color: #FFFFFF; } /* August */
          .month_8 { background-color: #CFCFCF; color: #000000; } /* September */
          .month_9 { background-color: #454545; color: #FFFFFF; } /* October */
          .month_10 { background-color: #CFCFCF; color: #000000; } /* November */
          .month_11 { background-color: #454545; color: #FFFFFF; } /* December */
          .highlighted-month { color: #000000 !important; } /* Highlighted months with black text */
          .ignore-month { color: #FFFFFF !important; } /* Highlighted months with black text */
          `;

      var styleTag = document.createElement("style");
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);

      gantt.render();
    } else {
      gantt.config.skip_off_time = false; // hides non-working time in the chart

      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" }
    ];
          gantt.templates.scale_cell_class = function (date) {
        var month = date.getMonth(); // Get the month index (0-11)

        var monthsToHighlight = [0, 2, 4, 6, 8, 10]; // Specify the months to highlight (0-11, where 0 is January)
        var monthsToIgnore = [1, 3, 5, 7, 9, 11];

        if (monthsToIgnore.includes(month)) {
          return "ignore-month month_" + month;
        }

        if (monthsToHighlight.includes(month)) {
          return "highlighted-month month_" + month;
        }

        return "month_" + month;
      };
      gantt.config.subscales = null;

      // CSS styles for each month cell
      var styles = `
          .month_0 { background-color: #CFCFCF; color: #000000; } /* January */
          .month_1 { background-color: #454545; color: #FFFFFF; } /* February */
          .month_2 { background-color: #CFCFCF; color: #000000; } /* March */
          .month_3 { background-color: #454545; color: #FFFFFF; } /* April */
          .month_4 { background-color: #CFCFCF; color: #000000; } /* May */
          .month_5 { background-color: #454545; color: #FFFFFF; } /* June */
          .month_6 { background-color: #CFCFCF; color: #000000; } /* July */
          .month_7 { background-color: #454545; color: #FFFFFF; } /* August */
          .month_8 { background-color: #CFCFCF; color: #000000; } /* September */
          .month_9 { background-color: #454545; color: #FFFFFF; } /* October */
          .month_10 { background-color: #CFCFCF; color: #000000; } /* November */
          .month_11 { background-color: #454545; color: #FFFFFF; } /* December */
            .highlighted-month { color: #000000 !important; } /* Highlighted months with black text */
          .ignore-month { color: #FFFFFF !important; } /* Highlighted months with black text */

          `;

      var styleTag = document.createElement("style");
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);

      gantt.render();
    }


    const storedTaskName = localStorage.getItem("taskname");

    gantt.plugins({
      marker: true,
    });

    let clickedTask;
    gantt.eachTask((task) => {
      if (!task.id.includes("project_")) {
        // handleFilter(task);
      }
    });

    gantt.attachEvent("onTaskClick", (id, e) => {
      clickedTask = gantt.getTask(id);
      if (!id.includes("project_")) {
        handleFilter(clickedTask);
      }
    });

    // console.log(filter);
    // Logging team and members
    // Iterate over the filtered teams and assign a unique id to each team based on the first member's id
    filter.forEach(team => {
      team.id = team.members[0].id - 1;
      // console.log(team.id);
      team.members.forEach(member => {
        // You can uncomment this line if you need to log member names
        // console.log(member.first_name);
      });
    });
    const sortedUpdatedData = updateddata.sort((a, b) => parseInt(a.project_id, 10) - parseInt(b.project_id, 10));
    const processedIds = [];
    const projects = {};
    console.log(sortedUpdatedData);

    const tasksByTeam = filter.map(team => {
      let teamNameAdded = false;
      const teamTasks = team.members.flatMap(member => {
        return data.flatMap(dataItem => {
          const updatedItem = sortedUpdatedData.find((item, index) =>
            !processedIds.includes(item.id) &&
            item.employee_name === member.first_name &&
            item.employee_name === dataItem.project 
          );
          if (!updatedItem) return [];
    
          processedIds.push(updatedItem.id);
    
          const start_date = new Date(updatedItem.Start_date);
          const end_date = new Date(updatedItem.End_date);
    
          if (!updatedItem.employee_name || !start_date || !end_date) return [];
          
          const task = {
            id: updatedItem.id,
            text: updatedItem.Task_name + " (" + updatedItem.part_id + ")",
            project: updatedItem.employee_name,
            part_Name: updatedItem.part_Name,
            start_date: start_date,
            duration: (end_date - start_date),
            end_date: end_date,
            color: dataItem.color,
            due_date: new Date(updatedItem.End_date),
            Ptask: dataItem.Ptask,
            progress: parseFloat(dataItem.progress),
            progressColor: "lightgrey",
            progressTextStyle: "color: black; border-radius: 100px",
          };
          if (projects.hasOwnProperty(updatedItem.employee_name)) {
            const subtask = {
              id: "subtask_" + updatedItem.id,
              task_id: "subtask_" + updatedItem.id,
              project: updatedItem.employee_name,
              text: updatedItem.Task_name + " (" + updatedItem.part_id + ")",
              start_date: start_date,
              duration: (end_date - start_date) , // Convert milliseconds to days
              part_Name: updatedItem.part_Name,
              due_date: new Date(dataItem.end_date),
              end_date: end_date,
              render: "split",
              Ptask: dataItem.Ptask,
              color: dataItem.color,
            };
    
            // Add subtask to the existing project's subtask array
            // projects[updatedItem.employee_name].subtask.push(subtask);  // Add to the subtask array of the project
            gantt.addTask(subtask, projects[updatedItem.employee_name].id); // Add subtask to Gantt under the project
            console.log(`Subtask successfully added: ${subtask.text} under project: ${projects[updatedItem.employee_name].text}`);

                      } else {
                        if (!teamNameAdded) {
                          const Teamnames = {
                            id: "teamname_" + dataItem.id,
                            text: team.teamName,
                            start_date: null,
                            Ptask: null,
                            progress: 0,
                            open: true,
                            render: "split",
                            color: "white",
                            textColor: "white",
                          };
                          gantt.addTask(Teamnames); // Add team name if not already added
                          teamNameAdded = true;
                        }
                
    
            // Add subtask under the newly created project task
            const subtask = {
              id: "subtask_" + updatedItem.id,
              task_id: "subtask_" + updatedItem.id,
              project: updatedItem.employee_name,
              text: updatedItem.Task_name + " (" + updatedItem.part_id + ")",
              part_Name: updatedItem.part_Name,
              start_date: start_date,
              duration: (end_date - start_date) , // Convert milliseconds to days
              render: "split",
              end_date: end_date,
              due_date: new Date(dataItem.end_date),
              Ptask: dataItem.Ptask,
              color: dataItem.color,
            };

            const projectTask = {
              id: "project_" + dataItem.id,
              text: updatedItem.employee_name,
              start_date: null,
              // subtask: [], // Initialize the subtask array
              Ptask: dataItem.Ptask,
              progress: 0,
              open: true,
              render: "split",
              color: "white",
            };
    
            gantt.addTask(projectTask); // Add project task to Gantt

            // Add subtask to the subtask array of the project task
            gantt.addTask(subtask, projectTask.id); // Link subtask to project task on Gantt
            console.log(`Subtask successfully added: ${subtask.text} under new project: ${projectTask.text}`);

            // Add subtask to the subtask array of the project task
            gantt.addTask(subtask, projectTask.id); // Link subtask to project task on Gantt
            
            projects[updatedItem.employee_name] = projectTask; // Store project task for future reference
          }
    
          return task;
        });
      });
    
      return { teamName: team.teamName, tasks: teamTasks };
    });
    

    
    gantt.render();


    const markerRules = [];
    const sizes = [];

    tasksByTeam.forEach((element) => {

      element.tasks.forEach((task) => {
        console.log(task);

        if (task.start_date) {
          const markerStartDate = new Date(task.due_date);
          const ganttTask = gantt.getTask("subtask_" + task.id);
          const styleElement = document.createElement("style");
          document.head.appendChild(styleElement);
          const size = {
            ...gantt.getTaskPosition(ganttTask, markerStartDate),
            taskId: task.id,
            taskname: task.text,
            project: task.project,
          };
          sizes.push(size);

          const styleSheet = styleElement.sheet;

          sizes.forEach((sizeElement) => {
            const topValue = sizeElement.top < 0 ? Math.max(sizeElement.top, 0) + 35 : sizeElement.top;
            if (sizeElement.project === task.project) {
              const rule = `.myDynamicClass${task.id} {border: 1px solid black !important; width:30px !important; position: absolute; top: ${topValue}px; left: ${sizeElement.left}px; height: 25px !important; background-color: ${task.color}; font-weight: bold; }`;
              const rule2 = `.myDynamicClass${task.id} {border: 1px solid red !important; width:30px !important; position: absolute; top: ${topValue}px; left: ${sizeElement.left}px; height: 25px !important; background-color: ${task.color}; font-weight: bold; }`;
              if (task.end_date >= markerStartDate) {
                // console.log(dataItem.color);
                styleSheet.insertRule(rule2, 0);
                markerRules.push(rule2);
              } else {
                styleSheet.insertRule(rule, 0);
                markerRules.push(rule);
              }
            }
          });

          if (ganttTask) {
            const marker = {
              id: task.id,
              start_date: markerStartDate,
              css: `myDynamicClass${task.id}`,
              text: task.text,
              project: task.project,
            };
            console.log(marker);

            gantt.addMarker(marker);
          }

        }
      });
    });

    const allTasks = [];

    gantt.eachTask((task) => {
      allTasks.push({
        id: task.id,
        text: task.text,
        // start_date: task.start_date,
        // end_date: task.end_date,
        progress: task.progress,
        parent: task.parent,
      });
    });

    // Log all tasks to the console
    console.log("All tasks:", allTasks);



    gantt.init("gantt_container");

    const sortedTasks = data
      .slice()
      .sort((a, b) => a.Ptask.localeCompare(b.Ptask));

    var legendContainer = document.getElementById("legend");
    while (legendContainer.firstChild) {
      legendContainer.removeChild(legendContainer.firstChild);
    }
    var addedTasks = [];
    sortedTasks.forEach(function (task) {
      // gantt.templates.task_class = (start, end, task) => {
      //   if (task.progress < 100 && task.due_date <= task.end_date && task.id.startsWith("subtask_")) {
      //     return "borderRed";
      //   }

      // };
      if (addedTasks.includes(task.Ptask + task.color)) {
        return;
      } else {
        var legendItem = document.createElement("div");
        legendItem.classList.add("legend-item");

        var legendColor = document.createElement("div");
        legendColor.classList.add("legend-color");
        legendColor.style.backgroundColor = task.color;

        var legendText = document.createElement("div");
        legendText.classList.add("legend-text");
        legendText.textContent = task.Ptask;

        addedTasks.push(task.Ptask + task.color);
        const color = task.color;
        legendColor.style.backgroundColor = color;

        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendText);
        legendContainer.appendChild(legendItem);
      }
    });
    var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
    var markerId = gantt.addMarker({
      start_date: new Date(),
      css: "today",
      text: "",
      title: dateToStr(new Date()),
    });

    console.log("Gantt Tasks:", tasksByTeam);

    return () => { };
  }, [data, view]);

  const handleViewChange = (selectedItem) => {
    setView(selectedItem);
    console.log("Selected View:", selectedItem);
  };

  const handleDelete = (index, e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedLatetask = [...latetask];
    updatedLatetask.splice(index, 1);
    setlatetask(updatedLatetask);
  };

  return (
    <>
      <div
        className="flex sm:flex-row  lg:flex-row gap-3   items-start"
        style={{ marginBottom: "13px", marginTop: "-27px" }}
      >
        <div className="flex   lg: gap-2  ml-2 mt-2">
          <Dropdown onSelect={handleViewChange} className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100">
            <Dropdown.Toggle variant="" id="dropdown-basic" className="w-full border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100">
              {view} View
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-full" aria-label="Single selection example" variant="flat" selectionMode="single" selectedKeys={view}>
              <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
              <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
              <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100" style={{ outline: "none" }} >
            <Dropdown.Toggle variant="" id="dropdown-basic">
              Late Tasks List
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ outline: "none" }} closeOnSelect={false} className="h-48  overflow-x-auto" aria-label="Example with disabled actions">
              {latetask.map((da, index) => (

                <Dropdown.Item style={{ outline: "none" }} className="" key={index}>
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="flex flex-row gap-2 justify-center items-center overflow-hidden">
                      <svg viewBox="0 0 24 24" height="24px" width="24px" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                          <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill="#909399"></path>
                        </g>
                      </svg>
                      <p>
                        {da.text} of {da.Ptask} has passed the completion date with a completion percentage of {da.progress !== null ? da.progress : 0}%
                      </p>
                    </div>
                    <span
                      className="z-50"
                      onClick={(e) => handleDelete(index, e)}
                      style={{
                        cursor: "pointer",
                        color: "gray",
                      }}
                    >
                      <svg aria-hidden="true" fill="none" focusable="false" height="1.3em" role="presentation" viewBox="0 0 24 24" width="1.3em">
                        <path d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z" fill="currentColor" />
                        <path d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z" fill="currentColor" opacity={0.399} />
                        <path clipRule="evenodd" d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z" fill="currentColor" fillRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </Dropdown.Item>
              ))}


            </Dropdown.Menu>
          </Dropdown>

          <Button onClick={handleResetFilter} className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100 " variant="bordered">
            Reset Filter
          </Button>

          <Button onClick={Today} variant="bordered" className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100">
            Go To Today
          </Button>
        </div>
        <div id="legend" className="flex flex-col mt-2 lg:flex-row gap-3 items-center pl-5 legend"></div>
      </div>
      <div id="gantt_container" style={{ height: "93vh", zoom: "130%" }}></div>
    </>
  );
};
export default Hostgram;
