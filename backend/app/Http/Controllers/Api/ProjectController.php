<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Part;
use App\Models\Sub;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index()
    {
        $project = Project::with('parts.subs')->get();
        return response()->json(['project' => $project], 200);
    }

    public function copy(Request $request)
    {
        $validated = $request->validate([
            'nameProject' => 'required|string|max:255',
            'namePart' => 'required|string|max:255',
            'type' => ['required', Rule::in(['With All Data', 'With Allocation', 'Without Data', 'DuplicatePart'])],
            'selectproject' => 'required|integer|exists:projects,id',
            'color' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $oldProject = Project::findOrFail($validated['selectproject']);
        $newProject = $this->createOrFindProject($validated['nameProject'], $validated['color'], $validated['type'] !== 'DuplicatePart');
        $partExists = $newProject->parts()->where('PartName', $validated['namePart'])->exists();

        if (!$partExists) {
            $newPart = $newProject->parts()->create(['PartName' => $validated['namePart'], 'TS' => 1]);
            $firstPart = $oldProject->parts()->first();

            if ($firstPart) {
                $attributes = [
                    'Doc_Supply' => $validated['start_date'],
                    'Completion' => $validated['end_date'],
                    // 'TS' => 1,
                ];

                if (in_array($validated['type'], ['With All Data', 'With Allocation'])) {
                    $attributes = array_merge($attributes, [
                        'Algorithm_1' => null,
                        'Algorithm_2' => null,
                        'Override_1' => null,
                        'Override_2' => null,
                        'Override_3' => null,
                    ]);
                }

                if ($validated['type'] === 'Without Data') {
                    $this->copySubsWithoutData($firstPart, $newPart, $attributes);
                } else {
                    $this->copySubs($firstPart, $newPart, $attributes);
                }
            }
        }

        return response()->json(['message' => 'Copy operation completed successfully'], 200);
    }

    private function createOrFindProject($nameProject, $color, $createIfNotFound = true)
    {
        $existingProject = Project::where('ProjectName', $nameProject)
            ->when($color, fn ($query) => $query->where('Color', $color))
            ->first();

        if ($existingProject) {
            return $existingProject;
        }

        return $createIfNotFound ? Project::create(['ProjectName' => $nameProject, 'Color' => $color]) : null;
    }

    private function copySubsWithoutData($sourcePart, $targetPart, $attributes = [])
    {
        foreach ($sourcePart->subs as $sub) {
            $subData = array_merge(
                $sub->only(['TaskName', 'Doc_Supply', 'Completion']), 
                $attributes
            );
            $targetPart->subs()->create($subData);
        }
    }

    private function copySubs($sourcePart, $targetPart, $attributes = [])
    {
        foreach ($sourcePart->subs as $sub) {
            $subData = [
                'TaskName' => $sub->TaskName,
                'Doc_Supply' => $attributes['Doc_Supply'] ?? null,
                'Completion' => $attributes['Completion'] ?? null,
            ];
            $targetPart->subs()->create($subData);
        }
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'selectedProject' => 'required|integer|exists:projects,id',
        ]);

        $project = Project::find($validated['selectedProject']);

        if ($project) {
            $project->delete();
            return response()->json(['message' => 'Project deleted successfully'], 200);
        }

        return response()->json(['message' => 'Project not found'], 404);
    }
}
