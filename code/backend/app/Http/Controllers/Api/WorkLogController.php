<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorkLogRequest;
use App\Http\Requests\UpdateWorkLogRequest;
use App\Http\Resources\WorkLogResource;
use App\Models\Project;
use App\Models\WorkLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class WorkLogController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(WorkLog::class, 'work_log');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $workLogs = $project->workLogs()->with(['task', 'user'])->paginate(10);
        return WorkLogResource::collection($workLogs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWorkLogRequest $request, Project $project): WorkLogResource
    {
        $data = $request->validated();
        if (!isset($data['user_id'])) {
            $data['user_id'] = auth()->id();
        }

        $workLog = $project->workLogs()->create($data);
        return new WorkLogResource($workLog);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, WorkLog $workLog): WorkLogResource
    {
        $workLog->load(['task', 'user', 'project']);
        return new WorkLogResource($workLog);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkLogRequest $request, Project $project, WorkLog $workLog): WorkLogResource
    {
        $workLog->update($request->validated());
        return new WorkLogResource($workLog);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, WorkLog $workLog): JsonResponse
    {
        $workLog->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
