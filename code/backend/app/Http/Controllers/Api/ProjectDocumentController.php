<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectDocumentRequest;
use App\Http\Requests\UpdateProjectDocumentRequest;
use App\Http\Resources\ProjectDocumentResource;
use App\Models\Project;
use App\Models\ProjectDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectDocumentController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ProjectDocument::class, 'document');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $documents = $project->documents()->with(['uploader'])->paginate(10);
        return ProjectDocumentResource::collection($documents);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectDocumentRequest $request, Project $project): ProjectDocumentResource
    {
        $data = $request->validated();
        if (!isset($data['uploaded_by'])) {
            $data['uploaded_by'] = auth()->id();
        }

        $document = $project->documents()->create($data);
        return new ProjectDocumentResource($document);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, ProjectDocument $document): ProjectDocumentResource
    {
        $document->load(['uploader', 'project']);
        return new ProjectDocumentResource($document);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectDocumentRequest $request, Project $project, ProjectDocument $document): ProjectDocumentResource
    {
        $document->update($request->validated());
        return new ProjectDocumentResource($document);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, ProjectDocument $document): JsonResponse
    {
        $document->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
