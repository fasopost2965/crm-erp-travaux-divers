<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $projects = Project::with(['account', 'quote', 'manager'])->paginate(10);
        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request): ProjectResource
    {
        $project = Project::create($request->validated());
        $project->load(['account', 'quote', 'manager']);
        return new ProjectResource($project);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): ProjectResource
    {
        $project->load(['account', 'quote', 'manager']);
        return new ProjectResource($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->validated());
        return new ProjectResource($project);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
