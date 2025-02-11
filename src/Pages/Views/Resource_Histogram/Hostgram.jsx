import { useEffect, useState, useRef } from "react";
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import axiosClient from "@axios";
import { Button } from "@nextui-org/react";
import { Dropdown } from "react-bootstrap";
import { gantt } from "dhtmlx-gantt";
import Backdrop from "@mui/material/Backdrop";
import { PuffLoader } from "react-spinners";
import "@MainStyle";
import { color } from "framer-motion";

export const Hostgram = () => {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isBackdropOpen, setBackdropOpen] = useState(false);
  const [data, setdata] = useState([]);
  const [filter, setfilter] = useState([]);
  const [latetask, setlatetask] = useState([]);
  const [view, setView] = useState("Day");
  const [Ganttdata, setGanttdata] = useState([]);
  const [isToggled, setIsToggled] = useState(false);
  const [isAVAToggled, setIsAVAToggled] = useState(false);
  const [emp, setemp] = useState([]);
  const isReloaded = sessionStorage.getItem("isReloaded");

  // Function to hide markers
  function hideMarkers() {
    const markers = document.querySelectorAll(
      ".gantt_marker:not([class*='dynamicMarkerClass_']):not([class*='AVAMarkerClass_'])"
    );
    markers.forEach((marker) => {
      marker.classList.add("hiden");
    });
  }

  // Function to show markers
  function showMarkers() {
    const markers = document.querySelectorAll(
      ".gantt_marker:not([class*='dynamicMarkerClass_']):not([class*='AVAMarkerClass_'])"
    );
    markers.forEach((marker) => {
      marker.classList.remove("hiden");
    });
  }

  function hideAVAMarkers() {
    const markers = document.querySelectorAll(
      ".gantt_marker[class*='AVAMarkerClass_']"
    );
    markers.forEach((marker) => {
      marker.classList.add("hiden");
    });
  }

  // Function to show markers
  function showAVAMarkers() {
    const markers = document.querySelectorAll(
      ".gantt_marker[class*='AVAMarkerClass_']"
    );
    markers.forEach((marker) => {
      marker.classList.remove("hiden");
    });
  }

  const handleToggle = () => {
    setIsToggled((prev) => {
      const newState = !prev;

      try {
        if (newState) {
          console.log("Plugin enabled");
          showMarkers(); // Show markers when toggled on
        } else {
          console.log("Plugin disabled");
          hideMarkers(); // Hide markers when toggled off
        }
      } catch (error) {
        console.error("Error toggling plugin:", error);
      }

      return newState;
    });
  };
  const handleAVAToggle = () => {
    setIsAVAToggled((prev) => {
      const newState = !prev;

      try {
        if (newState) {
          console.log("Plugin enabled");
          showAVAMarkers(); // Show markers when toggled on
        } else {
          console.log("Plugin disabled");
          hideAVAMarkers(); // Hide markers when toggled off
        }
      } catch (error) {
        console.error("Error toggling plugin:", error);
      }

      return newState;
    });
  };

  function hideHolidays() {
    const markers = document.querySelectorAll(
      ".gantt_marker[class*='dynamicMarkerClass_']" // Matches the dynamic marker class
    );

    markers.forEach((marker) => {
      marker.classList.add("hiden"); // Adds the 'hidden' class to hide the element
    });
  }

  // Function to show markers
  function showHolidays() {
    const markers = document.querySelectorAll(
      ".gantt_marker[class*='dynamicMarkerClass_']" // Correct syntax
    );
    markers.forEach((marker) => {
      marker.classList.remove("hiden"); // Remove 'hidden' class to show markers
    });
  }

  // Function to handle view changes
  const ViewChange = (view) => {
    console.log("View changed to:", view);

    // Show or hide markers based on the view
    if (view === "day") {
      console.log("Showing holidays for day view");
      showHolidays();
    } else if (view === "week" || view === "month") {
      console.log("Hiding holidays for week or month view");
      hideHolidays();
    }
  };

  // Function to fetch all task assignments
  const fetchAllAssignments = async () => {
    try {
      const resp = await axiosClient.get("/gantt");
      setGanttdata(resp.data);
      console.log(resp.data);

      // console.log("All Task Assignments:", resp.data); // Log all data after fetch
    } catch (error) {
      console.error("Error fetching all tasks:", error);
    }
  };

  const Employee = async () => {
    try {
      const resp = await axiosClient.get("gethost");
      const storedTaskName = localStorage.getItem("taskname");

      // Filter tasks based on stored task name if it exists
      const filteredTasks = storedTaskName
        ? resp.data.employees.filter((task) => task.Ptask === storedTaskName)
        : resp.data.employees;

      sessionStorage.removeItem("isReloaded");

      setdata(filteredTasks);
      // console.log("Filtered Tasks:", filteredTasks); // Log filtered tasks

      const lateTasks = [];
      const now = new Date();

      resp.data.employees.forEach((task) => {
        const endDate = new Date(task.end_date);
        const progress = task.progress;
        // console.log(endDate);
        // console.log(task);

        if (endDate >= now && task.progress < 100) {
          lateTasks.push(task);
        }
      });

      setlatetask(lateTasks);
      // console.log("Late Tasks:", lateTasks); // Log late tasks
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const Employee2 = async () => {
    try {
      const resp = await axiosClient.get("employees");
      setemp(resp.data.employees);
      // console.log("Employee Data:", resp.data.employees); // Log all employee data
    } catch (error) {
      console.error("Error fetching Employee2 data:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosClient.get("getemploye");
      if (response.status === 200) {
        const { employees, teams } = response.data;
        const teamGroupedEmployees = teams.map((team) => ({
          teamName: team.name,
          members: employees.filter(
            (employee) => employee.team?.id === team.id
          ),
        }));
        setfilter(teamGroupedEmployees);
        // console.log("Team Grouped Employees:", teamGroupedEmployees); // Log grouped employees
      } else {
        alert("Problem fetching employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const i = useRef(0);
  useEffect(() => {
    if (i.current === 0) {
      const fetchData = async () => {
        try {
          if (isReloaded) {
            await Promise.all([
              Employee2(),
              fetchEmployees(),
              Employee(),
              fetchAllAssignments(),
            ]);
          } else {
            localStorage.removeItem("taskname");
            await Promise.all([
              Employee2(),
              fetchEmployees(),
              Employee(),
              fetchAllAssignments(),
            ]);
          }
          setIsDataFetched(true);
          setBackdropOpen(true);
        } catch (error) {
          console.error("Error during data fetch:", error);
        }
      };

      fetchData();

      // Increment i at the end of the effect
      i.current += 1;
    }
  }, []);

  const handleResetFilter = () => {
    localStorage.removeItem("taskname");
    window.location.reload();
  };
  gantt.plugins({
    marker: true,
  });
  const handleFilter = (clickedTask) => {
    localStorage.setItem("taskname", clickedTask.Ptask);
    sessionStorage.setItem("isReloaded", "true");
    window.location.reload();
  };
  if (isReloaded) {
    const markers = document.querySelectorAll(
      ".gantt_marker:not([class*='dynamicMarkerClass_'])"
    );
    markers.forEach((marker) => {
      console.log(marker.classList);
      marker.classList.remove("hiden");
    });
  }

  const Today = () => {
    const today = new Date();
    gantt.showDate(today);
  };

  // Get the current year
  var currentYear = new Date().getFullYear();
  var startDate = new Date(); // January 1st
  startDate.setDate(startDate.getDate() - 3); // Subtract 3 days

  var endDate = new Date(currentYear, 11, 31); // December 31st
  // gantt.config.start_date = startDate;

  // gantt.config.end_date = endDate;

  gantt.addMarker({
    start_date: new Date(), // Set the date to today
    text: "", // Text label for the marker
    title: "Today: " + gantt.date.date_to_str("%d %M %Y")(new Date()), // Tooltip for the marker
  });

  useEffect(() => {
    if (!isDataFetched) return; // Wait until all data is fetched

    let clickedTask;

    gantt.attachEvent("onTaskClick", (id, e) => {
      clickedTask = gantt.getTask(id);
      handleFilter(clickedTask);
    });

    function groupConsecutiveAssignments(assignments = []) {
      if (!Array.isArray(assignments) || assignments.length === 0) {
        console.warn("No valid assignments provided");
        return [];
      }

      const sortedAssignments = [...assignments].sort((a, b) => {
        if (a.employee !== b.employee)
          return a.employee.localeCompare(b.employee);
        if (a.task_id !== b.task_id) return a.task_id - b.task_id;
        return new Date(a.date) - new Date(b.date);
      });

      const groupedTasks = [];
      let currentGroup = [];
      const firstOccurrence = new Set();

      for (let i = 0; i < sortedAssignments.length; i++) {
        const current = sortedAssignments[i];
        const previous = currentGroup[currentGroup.length - 1];

        if (
          currentGroup.length === 0 ||
          (previous &&
            new Date(current.date) - new Date(previous.date) === 86400000 &&
            current.task_id === previous.task_id &&
            current.employee === previous.employee)
        ) {
          currentGroup.push(current);
        } else {
          groupedTasks.push(currentGroup);
          currentGroup = [current];
        }
      }

      if (currentGroup.length > 0) {
        groupedTasks.push(currentGroup);
      }

      // Prepare output with split tasks, start/end dates, and first occurrence CSS logic
      return groupedTasks.map((group, index) => {
        const dates = group.map((item) => new Date(item.date));
        const startDate = new Date(Math.min(...dates))
          .toISOString()
          .split("T")[0];
        const endDate = new Date(Math.max(...dates))
          .toISOString()
          .split("T")[0];

        const isFirstOccurrence = !firstOccurrence.has(group[0].task_id);
        if (isFirstOccurrence) {
          firstOccurrence.add(group[0].task_id);
        }
        // console.log(group[0]);

        return {
          group_id: index + 1,
          task_id: group[0].task_id,
          part_id: group[0].parts_id,
          task_name: group[0].task_name,
          project_Name: group[0].project_name,
          color: group[0].color,
          employee: group[0].employee,
          start_date: new Date(startDate),
          end_date:
            new Date(startDate) === new Date(endDate)
              ? new Date(startDate)
              : new Date(endDate),
          assignments: group,
          css: isFirstOccurrence ? "sqrend" : "",
        };
      });
    }

    const groupedTasks = groupConsecutiveAssignments(Ganttdata.taskAssignments);
    // console.log(groupedTasks);

    const processedIds = [];
    const projects = {};

    const addedTeams = new Set(); // Track teams already added

    filter.forEach((team) => {
      // Check if the team has already been added
      if (!addedTeams.has(team.teamName)) {
        const teamPlaceholder = {
          id: "teamname" + team.teamName,
          text: team.teamName,
          start_date: null,
          Ptask: null,
          progress: 0,
          open: true,
          color: "white",
          render: "split",
        };
        gantt.addTask(teamPlaceholder); // Add team name to Gantt
        addedTeams.add(team.teamName); // Mark team as added

        // Add each member of the team as a project under the team
        team.members.forEach((member) => {
          // console.log(member);

          // const isChkOrEmpty = !member.nrms?.[0]?.pivot?.OAP || member.nrms[0].pivot.OAP === "Chk";

          // if (isChkOrEmpty) {
          //   console.log(member); // Log member if OAP is "Chk" or empty/null
          // } else {
          //   console.log("OAP is not 'Chk' and not empty");
          // }

          const memberProject = {
            id: "project_" + member.first_name,
            text: member.first_name,
            Ptask: member.Ptask || null,
            open: true,
            end_date: "2050",
            color: "white", // High opacity for hiding
            render: "split",
          };

          gantt.addTask(memberProject, team.teamName); // Add under team
          projects[member.first_name] = memberProject; // Store project task
        });
      }
    });
    const tasksByTeam = filter.map((team) => {
      const teamTasks = team.members.flatMap((member) => {
        // console.log(data);

        return data.flatMap((dataItem) => {
          const sortedGroupedTasks = groupedTasks.sort((a, b) => {
            const startDateA = new Date(a.start_date);
            const startDateB = new Date(b.start_date);
            const endDateA = new Date(a.end_date);
            const endDateB = new Date(b.end_date);

            if (startDateA < startDateB) return -1;
            if (startDateA > startDateB) return 1;
            if (endDateA < endDateB) return -1;
            if (endDateA > endDateB) return 1;
            return 0;
          });

          const updatedItems = sortedGroupedTasks.filter(
            (group) =>
              group.employee === member.first_name &&
              group.employee === dataItem.project &&
              group.part_id === dataItem.part_id
          );

          let lastTaskEndDate = null;

          return updatedItems
            .map((group) => {
              if (!group.start_date || !group.end_date) {
                console.error("Group has invalid date:", group);
                return null;
              }

              if (processedIds.includes(group.group_id)) return null;

              processedIds.push(group.group_id);

              const start_date = new Date(group.start_date);
              const end_date = new Date(group.end_date);
              start_date.setHours(start_date.getHours() - 2);
              let duration = Math.ceil(
                (end_date - start_date) / (1000 * 60 * 60 * 24)
              );

              if (start_date.getTime() === end_date.getTime()) {
                duration = 1;
              }

              const hasSameDateAsPrevious =
                lastTaskEndDate &&
                start_date.getTime() >= lastTaskEndDate.getTime();

              if (!group.employee || !start_date || !end_date) return null;

              const task = {
                id: group.group_id,
                text: group.task_name ,
                project: group.employee,
                part_Name: group.part_Name,
                start_date: start_date,
                duration: duration,
                PP: dataItem.PP,
                progress: dataItem.progress / 100,
                color: dataItem.color,
                due_date: new Date(dataItem.end_date),
                Ptask: dataItem.Ptask,
                progress: parseFloat(dataItem.progress),
                zIndex: hasSameDateAsPrevious ? 10 : 1, // Assign a higher z-index if dates match
              };

              const subtask = {
                id: "subtask_" + group.group_id,
                task_id: "subtask_" + group.group_id,
                project: group.employee,
                text: group.task_name ,
                start_date: start_date,
                duration: duration,
                render: "split",
                progress: dataItem.progress / 100,
                progressColor: "grey",
                due_date: new Date(dataItem.end_date),
                Ptask: dataItem.Ptask,
                color: dataItem.color,
                zIndex: hasSameDateAsPrevious ? 10 : 1, // Assign a higher z-index if dates match
              };

              if (!projects.hasOwnProperty(group.employee)) {
                const projectTask = {
                  id: "project_" + dataItem.id,
                  text: group.employee,
                  start_date: null,
                  Ptask: dataItem.Ptask,
                  open: true,
                  render: "split",
                  css: "black",
                };
                gantt.addTask(projectTask);
                projects[group.employee] = projectTask;
              }

              // Check if the duration is greater than 1 before adding the task
              if (projects[group.employee].duration) {
                gantt.addTask(subtask, projects[group.employee].id);
                lastTaskEndDate = end_date;
                // console.log(`Task with ID ${projects[group.employee].id} = added because duration is 1 or more.`);
              }
              // gantt.addTask(subtask)

              return task;
            })
            .filter(Boolean);
        });
      });
      gantt.render();

      return { teamName: team.teamName, tasks: teamTasks };
    });

    const markerRules = [];
    const sizes = [];

    const markerSet = new Map(); // To track created markers by task.text
    let taskGroups = {};

    tasksByTeam.forEach((element) => {
      element.tasks.forEach((task) => {
        if (task.start_date) {
          const CompDate = new Date(task.due_date);
          const DocDate = new Date(task.start_date); // Initialize with the start date
          CompDate.setHours(CompDate.getHours() - 2); // Increase by 2 hours

          if (!taskGroups[task.text]) {
            taskGroups[task.text] = {}; // Initialize an object for projects
          }

          if (!taskGroups[task.text][task.project]) {
            taskGroups[task.text][task.project] = {
              firstDocDate: DocDate,
              lastCompDate: CompDate,
              color: task.color,
            };
          } else {
            taskGroups[task.text][task.project].lastCompDate = CompDate; // Update the last occurrence's CompDate for this project
          }

          // console.log(taskGroups);

          const currentDate = new Date(); // Current date for comparison
          const ganttTask = gantt.getTask("subtask_" + task.id);
          const styleElement = document.createElement("style");
          document.head.appendChild(styleElement);
          const size = {
            ...gantt.getTaskPosition(ganttTask, CompDate),
            taskId: task.id,
            taskname: task.text,
            project: task.project,
          };
          sizes.push(size);

          const styleSheet = styleElement.sheet;

          sizes.forEach((sizeElement, index) => {
            const topValue =
              sizeElement.top < 0
                ? Math.max(sizeElement.top, 0) + 2
                : sizeElement.top + 2;

            let startHourOffset =
              taskGroups[task.text][task.project].firstDocDate.getHours();
            let endHourOffset =
              taskGroups[task.text][task.project].lastCompDate.getHours();

            // Adjust position if overlapping
            let adjustedLeft = sizeElement.left;
            let adjustedTop = topValue;
            for (let i = 0; i < index; i++) {
              if (
                sizes[i].top === sizeElement.top &&
                sizes[i].left === sizeElement.left
              ) {
                endHourOffset += 12; // Move next to the previous marker
                break;
              }
            }

            if (sizeElement.project === task.project) {
              // Generate CSS rules dynamically
              const startRule = `.myDynamicClass${task.id}_start { display: flex; /* Add flexbox */
  align-items: center; /* Vertically center text */
  justify-content: center; /* Horizontally center text */ border: 2px solid green !important; width:30px !important; position: absolute; top: ${adjustedTop}px; left: ${adjustedLeft}px; height: 29px !important; background-color: ${task.color}; font-weight: bold; z-index:20; }`;
              const endRule = `.myDynamicClass${task.id}_end { display: flex; /* Add flexbox */
  align-items: center; /* Vertically center text */
  justify-content: center; /* Horizontally center text */ border: 2px solid black !important; width:30px !important; position: absolute; top: ${adjustedTop}px; left: ${adjustedLeft}px; height: 29px !important; background-color: ${task.color}; font-weight: bold; z-index:20; }`;
              const lateRule = `.myDynamicClass${task.id}_late { display: flex; /* Add flexbox */
  align-items: center; /* Vertically center text */
  justify-content: center; /* Horizontally center text */ border: 2px solid red !important; width:30px !important; position: absolute; top: ${adjustedTop}px; left: ${adjustedLeft}px; height: 29px !important; background-color: ${task.color}; font-weight: bold; z-index:20; }`;
              const contentWidthRules = [
                `.myDynamicClass${task.id}_start .gantt_marker_content { width: 25px !important; }`,
                `.myDynamicClass${task.id}_end .gantt_marker_content { width: 25px !important; }`,
                `.myDynamicClass${task.id}_late .gantt_marker_content { width: 25px !important; }`,
              ];

              if (task.end_date >= CompDate) {
                styleSheet.insertRule(lateRule, 0);
                // styleSheet.insertRule(startRule, 0); // Start marker
                contentWidthRules.forEach((rule) =>
                  styleSheet.insertRule(rule, 0)
                );
              } else {
                styleSheet.insertRule(endRule, 0); // End marker
                contentWidthRules.forEach((rule) =>
                  styleSheet.insertRule(rule, 0)
                );
                styleSheet.insertRule(startRule, 0); // Start marker
              }
            }
          });

          if (localStorage.getItem("taskname") === task.Ptask) {
            const Endmarker = {
              id: `${task.id}_end`,
              start_date: CompDate,
              css: `myDynamicClass${task.id}_end`,
              text: `${task.text}`,
              project: task.project,
            };

            const Docmarker = {
              id: `${task.id}_start`,
              start_date: taskGroups[task.text][task.project].firstDocDate,
              css: `myDynamicClass${task.id}_start`,
              text: `${task.text}`,
              project: task.project,
            };

            gantt.addMarker(Endmarker);
            gantt.addMarker(Docmarker);
          } else {
            const Endmarker = {
              id: `${task.id}_end`,
              start_date: CompDate,
              css: `myDynamicClass${task.id}_end hiden`,
              text: `${task.text}`,
              project: task.project,
            };

            const Docmarker = {
              id: `${task.id}_start`,
              start_date: taskGroups[task.text][task.project].firstDocDate,
              css: `myDynamicClass${task.id}_start hiden`,
              text: `${task.text}`,
              project: task.project,
            };

            gantt.addMarker(Endmarker);
            gantt.addMarker(Docmarker);
          }
        }
      });
    });

    // Step 1: Sort tasks by Ptask

    const sortedTasks = data
      .slice()
      .sort((a, b) => a.Ptask.localeCompare(b.Ptask));
    // Step 2: Clear existing legend items
    var legendContainer = document.getElementById("legend");
    while (legendContainer.firstChild) {
      legendContainer.removeChild(legendContainer.firstChild);
    }

    // Step 3: Initialize variables for tracking added tasks
    var addedTasks = [];

    // Step 4: Iterate over sorted tasks and populate the legend
    sortedTasks.forEach(function (task) {
      // Step 4.1: Define task-specific Gantt class
      gantt.templates.task_class = (start, end, task) => {
        if (
          task.progress < 100 &&
          task.due_date <= task.end_date &&
          task.id.startsWith("subtask_")
        ) {
          return "borderRed";
        }
      };

      // Step 4.2: Check if the task is already in the legend
      if (addedTasks.includes(task.Ptask + task.color)) {
        return; // Skip duplicate tasks
      }

      // Step 4.3: Create legend item
      var legendItem = document.createElement("div");
      legendItem.classList.add("legend-item");

      // Step 4.4: Create and style legend color box
      var legendColor = document.createElement("div");
      legendColor.classList.add("legend-color");
      legendColor.style.backgroundColor = task.color;

      // Step 4.5: Create legend text
      var legendText = document.createElement("div");
      legendText.classList.add("legend-text");
      legendText.textContent = task.Ptask;

      // Step 4.6: Update tracking and append to container
      addedTasks.push(task.Ptask + task.color);
      legendItem.appendChild(legendColor);
      legendItem.appendChild(legendText);
      legendContainer.appendChild(legendItem);
    });

    // Step 5: Return cleanup function for component lifecycle
    return () => {};
  }, [data, view, isDataFetched]);

  useEffect(() => {
    const teamNames = filter.map((team) => team.teamName);
    const employeesData = emp.map((employee) => {
      const name = employee.first_name;
      const availabilities = employee.availabilities;

      // Group availabilities by month
      const groupedByMonth = availabilities.reduce((result, availability) => {
        let date = new Date(availability.date); // Ensure availability.date is valid
        if (isNaN(date)) {
          console.error(`Invalid date: ${availability.date}`);
          return result; // Skip this entry if the date is invalid
        }

        const Total = availability.Total;
        date.setHours(date.getHours() - 2);

        const month = date.getMonth(); // 0-based month index
        const year = date.getFullYear();

        const key = `${year}-${month + 1}`; // Use "Year-Month" as key
        if (!result[key]) {
          result[key] = [];
        }

        // Check if the availability has total hours, consider missing if "00:00:00"
        if (availability.total_ava !== "00:00:00") {
          result[key].push({ date: date.toISOString(), Total }); // Convert date to ISO string
        }

        return result;
      }, {});

      // Extract missing days for each month (excluding weekends)
      const missingDaysByMonth = {};
      Object.entries(groupedByMonth).forEach(([monthKey, availableDates]) => {
        const [year, month] = monthKey.split("-").map(Number);

        // Convert availableDates to a set of stringified dates for easier comparison
        const availableDatesSet = new Set(
          availableDates.map((entry) => entry.date.split("T")[0]) // Use the 'date' property
        );

        // Get all days in the current month
        const totalDays = new Date(year, month, 0).getDate(); // Get the last day of the month
        const missingDays = [];

        for (let day = 1; day <= totalDays; day++) {
          const currentDay = new Date(year, month - 1, day); // Date object for each day
          const isWeekend =
            currentDay.getDay() === 0 || currentDay.getDay() === 6; // Sunday (0) or Saturday (6)
          const currentDayString = currentDay.toISOString().split("T")[0]; // Format for comparison

          if (!isWeekend && !availableDatesSet.has(currentDayString)) {
            missingDays.push(currentDay); // Push the full Date object
          }
        }

        // Store missing days for the current month
        missingDaysByMonth[monthKey] = missingDays;
      });

      // Construct employee data
      return {
        name,
        groupedAvailabilities: groupedByMonth,
        missingDaysByMonth,
      };
    });

    gantt.config.columns = [
      {
        name: "text",
        label: "Operative",
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
    gantt.config.show_tasks_outside_timescale = true; //
    gantt.config.smart_rendering = true;
    gantt.config.render_item = true;
    gantt.config.links = false;
    gantt.config.show_links = false;
    gantt.config.drag_progress = false;
    gantt.config.skip_off_time = false; // shows non-working time in the chart
    gantt.templates.task_row_class = function (start, end, task) {
      // Check if the task's text matches any team name
      if (teamNames.includes(task.text)) {
        return "greyed-out-row"; // Apply the greyed-out class
      }
      return ""; // No class for other tasks
    };

    gantt.attachEvent("onGanttScroll", function (left, top) {
      const container = document.getElementById("gantt_container");
      if (container.scrollHeight > container.clientHeight) {
        // Add scroll bar if content overflows
        container.style.overflowY = "scroll";
      } else {
        container.style.overflowY = "hidden";
      }
    });

    // Utility function to get tasks within a date range
    gantt.getTaskByTime = function (startDate, endDate) {
      return gantt.getTaskBy((task) => {
        const taskStart = new Date(task.start_date); // Convert task start date to a Date object
        const taskEnd = new Date(task.end_date); // Convert task end date to a Date object
        return taskStart < endDate && taskEnd > startDate; // Check for overlap
      });
    };

    gantt.templates.timeline_cell_class = (task, date) => {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend"; // Custom CSS class for weekend timeline cells
      }
      return "";
    };

    gantt.templates.task_row_class = function (start, end, task) {
      if (teamNames.includes(task.text)) {
        return "greyed-out-row"; // Apply the greyed-out class
      }
      return ""; // No class for other tasks
    };

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
    .weekend { background-color: #E0DFDF; color: #FFFFFF; } /* Weekend */
  `;

    var styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    // Define cell class for tasks
    employeesData.forEach((element) => {
      Object.entries(element.missingDaysByMonth).forEach(
        ([month, missingDays]) => {
          if (Array.isArray(missingDays) && missingDays.length > 0) {
            missingDays.forEach((date) => {
              const markerStartDate = new Date(date);

              markerStartDate.setMinutes(markerStartDate.getMinutes() + 30);

              const ganttTask = gantt.getTask("project_" + element.name);

              if (ganttTask) {
                const size = gantt.getTaskPosition(ganttTask, markerStartDate);

                if (!size) return; // Skip if size is undefined

                const topValue =
                  size.top < 0 ? Math.max(size.top, 0) + 35 : size.top;

                const sanitizedClassName = `dynamicMarkerClass_${ganttTask.id.replace(
                  /[^a-zA-Z0-9_-]/g,
                  ""
                )}`;

                if (
                  !document.querySelector(
                    `style[data-class="${sanitizedClassName}"]`
                  )
                ) {
                  const topOffset = topValue + 2;
                  const cssRule = `
                  .${sanitizedClassName} {
                    width: 63px;
                    position: absolute;
                    top: ${topOffset}px !important;
                    height: 31px !important;
                    background-color: #7f7979 !important;
                    display: flex;
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold !important;
                    font-size: 16px !important; 
                    text-align: center !important;
                  }
                `;

                  const styleElement = document.createElement("style");
                  styleElement.setAttribute("data-class", sanitizedClassName);
                  document.head.appendChild(styleElement);
                  const styleSheet = styleElement.sheet;
                  styleSheet.insertRule(cssRule, styleSheet.cssRules.length);
                }

                const marker = {
                  id:
                    ganttTask.id +
                    "_dynamicMarkerClass_" +
                    markerStartDate.getTime(),
                  start_date: markerStartDate,
                  css: sanitizedClassName,
                  text: "H", // Marker text
                  project: ganttTask.project,
                };
                if (view == "Day") {
                  gantt.addMarker(marker);
                } else if (view == "week") {
                  gantt.deleteMarker(marker);
                } else if (view == "month") {
                  gantt.deleteMarker(marker);
                }
              }
            });
          }
        }
      );
    });

    employeesData.forEach((element) => {
      Object.entries(element.groupedAvailabilities).forEach(
        ([month, existingDays]) => {
          if (Array.isArray(existingDays) && existingDays.length > 0) {
            existingDays.forEach((entry) => {
              const markerStartDate = new Date(entry.date); // Use the `date` property from entry

              if (isNaN(markerStartDate.getTime())) return; // Skip invalid dates

              markerStartDate.setMinutes(markerStartDate.getMinutes() + 30);

              const ganttTask = gantt.getTask("project_" + element.name);

              if (ganttTask) {
                const size = gantt.getTaskPosition(ganttTask, markerStartDate);

                if (!size) return; // Skip if size is undefined

                const topValue =
                  size.top < 0 ? Math.max(size.top, 0) + 35 : size.top;

                const sanitizedClassName2 = `AVAMarkerClass_${ganttTask.id.replace(
                  /[^a-zA-Z0-9_-]/g,
                  ""
                )}`;
                if (
                  !document.querySelector(
                    `style[data-class="${sanitizedClassName2}"]`
                  )
                ) {
                  const topOffset = topValue + 2;
                  const cssRule = `
                    .${sanitizedClassName2} {
                      width: 45px;
                      margin-left:5px;
                      position: absolute;
                      top: ${topOffset}px !important;
                      height: 27px !important;
                      display: flex;
                      background-color: rgb(149 161 165 / 99%)  !important;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold !important;
                      border-radius: 30% !important;
                      font-size: 16px !important;
                      text-align: center !important;
                    }

                  `;

                  const styleElement = document.createElement("style");
                  styleElement.setAttribute("data-class", sanitizedClassName2);
                  document.head.appendChild(styleElement);
                  const styleSheet = styleElement.sheet;
                  styleSheet.insertRule(cssRule, styleSheet.cssRules.length);
                }

                // Class names to search for
                const class1 = "gantt_marker";
                const class2 = "_AVAMarkerClass_";

                // New class name to apply to the child elements
                const newClass = "colorblack";

                // Select all elements containing both classes
                const elements = document.querySelectorAll(`.${class1}`);

                if (elements.length > 0) {
                  // console.log(`Found ${elements.length} elements with both classes "${class1}" and "${class2}":`);
                  elements.forEach((element, index) => {
                    // console.log(`Element ${index + 1}:`, element);
                    // console.log(`Class: ${element.className}`);
                    // console.log(`Inner Content: ${element.innerHTML.trim()}`); // Gets the inner content

                    // Find child elements and add the new class
                    const childElements = element.querySelectorAll("*"); // Modify this selector as needed for specific children
                    childElements.forEach((child) => {
                      child.classList.add("colorblack"); // Add the new class to the child
                    });
                  });

                  // Add the CSS rule for the new class dynamically
                  if (
                    !document.querySelector(`style[data-class="${newClass}"]`)
                  ) {
                    const styleElement = document.createElement("style");
                    styleElement.setAttribute("data-class", newClass);
                    styleElement.textContent = `
      .${newClass} {
        color: black !important;
      }
    `;
                    document.head.appendChild(styleElement);
                  }
                } else {
                  console.log(
                    `No elements found with both classes "${class1}" and "${class2}".`
                  );
                }

                const fullTime = entry.Total; // Example input
                const formattedTime = fullTime.split(":").slice(0, 2).join(":"); // Extract "08:00"
                console.log(entry.Total); // Output: "08:00"

                const marker = {
                  id:
                    ganttTask.id +
                    "_AVAMarkerClass_" +
                    markerStartDate.getTime(),
                  start_date: markerStartDate,
                  css: sanitizedClassName2 + " hiden",
                  color: "marker_weekend",
                  text: formattedTime, // Format as HH:00:00:00
                  project: ganttTask.project,
                };

                // Handle marker addition based on the current view
                if (view === "Day") {
                  gantt.addMarker(marker);
                } else if (view === "week" || view === "month") {
                  gantt.deleteMarker(marker.id);
                }
              }
            });
          }
        }
      );
    });

    if (view === "Day") {
      gantt.plugins({
        marker: true,
      });

      ViewChange(view); // Pass the new view mode (e.g., 'day', 'week', 'month')

      gantt.config.min_grid_column_width = 60;
      gantt.config.min_column_width = 60;
      // const startDate = new Date(); // Example: Current date
      // startDate.setDate(startDate.getDate() - 3); // Subtract 3 days

      // // Set the adjusted start date in the Gantt configuration
      // gantt.config.start_date = new Date(startDate); // Ensure it's a Date object
      // const endDate = new Date(); // Example: Current date
      // endDate.setDate(endDate.getDate() + 30); // Subtract 3 days

      // // Set the adjusted start date in the Gantt configuration
      // gantt.config.start_date = new Date(endDate); // Ensure it's a Date object

      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%d, %D" },
      ];
    } else if (view === "Week") {
      ViewChange(view); // Pass the new view mode (e.g., 'day', 'week', 'month')

      gantt.config.min_grid_column_width = 40;
      gantt.config.min_column_width = 40;
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%d-%D" },
      ];
    } else {
      ViewChange(view); // Pass the new view mode (e.g., 'day', 'week', 'month'

      gantt.config.scales = [{ unit: "month", step: 1, format: "%F, %Y" }];
    }

    gantt.init("gantt_container");

    return () => {};
  }, [data, view, isDataFetched]);

  const handleViewChange = (selectedItem) => {
    setView(selectedItem);
    setIsDataFetched(false);
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
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(238, 238, 238, 0.5)", // Change the backdrop color here
        }}
        open={!isBackdropOpen}
      >
        <PuffLoader color="#056fdc" size={200} />
      </Backdrop>
      <div
        className="flex sm:flex-row  lg:flex-row gap-3   items-start"
        style={{ marginBottom: "13px", marginTop: "-27px" }}
      >
        <div className="flex   lg: gap-2  ml-2 mt-2">
          <Dropdown
            onSelect={handleViewChange}
            className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100"
          >
            <Dropdown.Toggle
              variant=""
              id="dropdown-basic"
              className="w-full border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100"
            >
              {view} View
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-full"
              aria-label="Single selection example"
              variant="flat"
              selectionMode="single"
              selectedKeys={view}
            >
              <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
              <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
              <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown
            className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100"
            style={{ outline: "none" }}
          >
            <Dropdown.Toggle variant="" id="dropdown-basic">
              Late Tasks List
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ outline: "none" }}
              closeOnSelect={false}
              className="h-48  overflow-x-auto"
              aria-label="Example with disabled actions"
            >
              {latetask.map((da, index) => (
                <Dropdown.Item
                  style={{ outline: "none" }}
                  className=""
                  key={index}
                >
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="flex flex-row gap-2 justify-center items-center overflow-hidden">
                      <svg
                        viewBox="0 0 24 24"
                        height="24px"
                        width="24px"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"
                            fill="#909399"
                          ></path>
                        </g>
                      </svg>
                      <p>
                        {da.text} of {da.Ptask} has passed the completion date
                        with a completion percentage of{" "}
                        {da.progress !== null ? da.progress : 0}%
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
                      <svg
                        aria-hidden="true"
                        fill="none"
                        focusable="false"
                        height="1.3em"
                        role="presentation"
                        viewBox="0 0 24 24"
                        width="1.3em"
                      >
                        <path
                          d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
                          fill="currentColor"
                          opacity={0.399}
                        />
                        <path
                          clipRule="evenodd"
                          d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
                          fill="currentColor"
                          fillRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button
            onClick={handleResetFilter}
            className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100 "
            variant="bordered"
          >
            Reset Filter
          </Button>

          <Button
            onClick={Today}
            variant="bordered"
            className="border-[1px]  bg-gray-200  border-gray-100 rounded-md focus:border-gray-100"
          >
            Go To Today
          </Button>
          <Button
            onClick={handleToggle}
            style={{
              padding: "10px 20px",
              backgroundColor: isToggled ? "#E5E7EB" : "#848282", // Replace with equivalent color codes for bg-gray-200 and bg-gray-500
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Flags
          </Button>
          <Button
            onClick={handleAVAToggle}
            style={{
              padding: "10px 20px",
              backgroundColor: isAVAToggled ? "#E5E7EB" : "#848282", // Replace with equivalent color codes for bg-gray-200 and bg-gray-500
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Availability
          </Button>
        </div>
        <div
          id="legend"
          className="flex flex-col mt-2 lg:flex-row gap-3 items-center pl-5 legend"
        ></div>
      </div>

      <div
        id="gantt_container"
        style={{
          zoom: "110%",
          height: "119vh", // Fullscreen height
          width: "100%", // Ensure full width
          backgroundColor: "white", // Optional: Give a background color
        }}
      >
        <h1>Gantt Chart</h1>
        {/* Your Gantt chart rendering logic here */}
      </div>
    </>
  );
};
export default Hostgram;
