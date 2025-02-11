<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AvailabilityImport;

class AvailabilityImportController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->input('data');

        try {
            foreach ($data as $employee) {
                foreach ($employee['data'] as $availability) {
                    // Extract values
                    $employeeId = $employee['ID'];
                    $date = $availability['date'];
                    $values = $availability['values'];

                    // Update or create record
                    AvailabilityImport::updateOrCreate(
                        [
                            'employee_id' => $employeeId,
                            'date' => $date,
                        ],
                        [
                            'strt1' => $values['start1'] ?? null,
                            'end1' => $values['end1'] ?? null,
                            'strt2' => $values['start2'] ?? null,
                            'end2' => $values['end2'] ?? null,
                            'strt3' => null, // Adjust as needed
                            'end3' => null, // Adjust as needed
                            'strt4' => null, // Adjust as needed
                            'end4' => null, // Adjust as needed
                            'Total' =>  $values['formattedTotal'], // Adjust as needed
                            'total_ava' =>  $values['formattedTotal'], // Adjust as needed
                        ]
                    );
                }
            }

            return response()->json(['message' => 'Data saved successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
