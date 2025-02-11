<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection details
$servername = "localhost"; // Replace with your server's IP address
$username = "workplanner";      // Replace with your MySQL username
$password = "8nMab2o4hU0RYuQ";  // Replace with your MySQL password
$dbname = "workplanner";        // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";

// Run a simple query to test the database connection further
$sql = "SELECT * FROM projects LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    // Output the first row of the result
    while ($row = $result->fetch_assoc()) {
        echo "Project ID: " . $row["id"] . " - Project Name: " . $row["name"];
    }
} else {
    echo "0 results or query failed";
}

// Close the connection
$conn->close();
?>
