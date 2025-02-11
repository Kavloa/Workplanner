<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>Gantt Chart Demo</title>
    <script src="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js"></script>
    <link href="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

    <style type="text/css">
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
        }

        #header {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
        }

        #controls {
            padding: 10px;
            text-align: center;
            background-color: #f0f0f0;
        }

        #gantt_here {
            width: 100%; /* Adjust the overall width of the Gantt chart */
            height: 80%;
        }
    </style>
</head>
<body>
    <div id="header">
        <h1>Gantt Chart Demo</h1>
    </div>

    <div id="controls">
        <label for="viewMode">View Mode:</label>
        <select id="viewMode" onchange="changeView()">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
        </select>
    </div>

    <div id="gantt_here"></div>

    <script type="text/javascript">
        gantt.init("gantt_here");

        function changeView() {
            var selectedView = document.getElementById("viewMode").value;
            gantt.config.scale_unit = selectedView;
            gantt.config.date_scale = selectedView == "month" ? "%F %Y" : "%d %M %H:%i"; // Include hours
            gantt.config.step = 1; // Show hours individually
            
            // Adjust task duration based on the new scale_unit
            var tasks = gantt.getTaskByTime();
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var newDuration = gantt.calculateDuration(task.start_date, task.end_date);
                gantt.getTask(task.id).duration = newDuration;
            }

            gantt.render();
        }

        var tasks = [
            { id: 1, text: "Task 1", start_date: new Date("2022-01-01 08:30:00"), duration: 1.5, end_date: new Date("2022-01-01 10:00:00") },
            { id: 2, text: "Task 2", start_date: new Date("2022-01-01 10:45:00"), duration: 2.75, end_date: new Date("2022-01-01 13:30:00") },
            { id: 3, text: "Task 3", start_date: new Date("2022-01-01 13:00:00"), duration: 5.25, end_date: new Date("2022-01-01 18:15:00") }
        ];

        gantt.config.start_date = new Date("2022-01-01");
        gantt.config.autosize = "y"; // Auto adjust the height based on the number of tasks
        gantt.config.grid_width = 250; // Set a fixed width for the grid area
        gantt.config.columns = [
            { name: "text", label: "Task", tree: true, width: 400 }
            // You can add more columns here if needed
        ];

        gantt.parse({ data: tasks });

        changeView(); // Initialize with the default view
    </script>
</body>
</html>
