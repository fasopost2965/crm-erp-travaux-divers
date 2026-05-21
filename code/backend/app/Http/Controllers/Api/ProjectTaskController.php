<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectTaskRequest;
use App\Http\Requests\UpdateProjectTaskRequest;
use App\Http\Resources\ProjectTaskResource;
use App\Models\Project;
use App\Models\ProjectTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectTaskController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ProjectTask::class, 'task');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $tasks = $project->tasks()->with(['assignee'])->paginate(10);
        return ProjectTaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectTaskRequest $request, Project $project): ProjectTaskResource
    {
        $task = $project->tasks()->create($request->validated());
        return new ProjectTaskResource($task);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, ProjectTask $task): ProjectTaskResource
    {
        $task->load(['assignee', 'project']);
        return new ProjectTaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectTaskRequest $request, Project $project, ProjectTask $task): ProjectTaskResource
    {
        $task->update($request->validated());
        return new ProjectTaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, ProjectTask $task): JsonResponse
    {
        $task->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
