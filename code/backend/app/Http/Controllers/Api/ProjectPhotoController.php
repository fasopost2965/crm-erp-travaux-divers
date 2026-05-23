<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectPhotoRequest;
use App\Http\Resources\ProjectPhotoResource;
use App\Models\Project;
use App\Models\ProjectPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ProjectPhotoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ProjectPhoto::class, 'photo');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $photos = $project->photos()->with(['uploader'])->paginate(10);
        return ProjectPhotoResource::collection($photos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectPhotoRequest $request, Project $project): ProjectPhotoResource
    {
        $validated = $request->validated();
        $path = $request->file('photo')->store('project-photos', 'public');

        $photo = $project->photos()->create([
            'title' => $validated['title'],
            'stage' => $validated['stage'],
            'file_path' => $path,
            'uploaded_by' => auth()->id(),
        ]);

        return new ProjectPhotoResource($photo);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, ProjectPhoto $photo): ProjectPhotoResource
    {
        $photo->load(['uploader', 'project']);
        return new ProjectPhotoResource($photo);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, ProjectPhoto $photo): JsonResponse
    {
        Storage::disk('public')->delete($photo->file_path);
        $photo->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
