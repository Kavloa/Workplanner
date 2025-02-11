<?php

namespace App\Models;

use Illuminate\Support\Facades\Http;

class TimeTrackingAPI
{
    // Function to handle User Login and get the token
    public static function login($username, $password)
    {
        $payload = [
            "loginname" => $username,
            "password" => $password,
            "subscription" => []
        ];

        $response = Http::post("https://timetracking.trevorsadd.co.uk/account/login", $payload);
        return $response->json();
    }

    // Function to call IndividualSearch API for an employee
    public static function individualSearch($employeeId)
    {
        $payload = [
            "pageno" => 1,
            "ispage" => true,
            "pagesize" => 10,
            "sortcol" => "t.date",
            "filter" => [
                [
                    "table" => "u",
                    "column" => "id",
                    "value" => $employeeId,
                    "operation" => "In"
                ],
                // Additional filters as needed
            ],
            "Dfilter" => [
                "summary" => false
            ],
            "count" => 0,
            "duration" => 0
        ];
    
        return Http::withToken(session('tokan'))
            ->withoutVerifying() // Bypass SSL verification
            ->post("https://timetracking.trevorsadd.co.uk/reports/GetView", $payload)
            ->json();
    }
    

    // Function to call Getprojectlist API for an employee
    public static function getProjectList($employeeId)
    {
        return Http::withToken(session('tokan'))
            ->post("https://timetracking.trevorsadd.co.uk/project/search", ["id" => $employeeId])
            ->json();
    }

    // Function to call Getuserlist API for an employee
    public static function getUserList($employeeId, $firstName, $lastName, $loginName)
    {
        $payload = [
            "id" => $employeeId,
            "firstname" => $firstName,
            "lastname" => $lastName,
            "loginname" => $loginName
        ];

        return Http::withToken(session('tokan'))
            ->post("https://timetracking.trevorsadd.co.uk/Account/Getreportstousers", $payload)
            ->json();
    }
}
