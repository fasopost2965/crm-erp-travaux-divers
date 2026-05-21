<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectSignatureRequest;
use App\Http\Resources\ProjectSignatureResource;
use App\Models\Project;
use App\Models\ProjectSignature;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectSignatureController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ProjectSignature::class, 'signature');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $signatures = $project->signatures()->with(['signer'])->paginate(10);
        return ProjectSignatureResource::collection($signatures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectSignatureRequest $request, Project $project): ProjectSignatureResource
    {
        $data = $request->validated();
        if (!isset($data['signed_by'])) {
            $data['signed_by'] = auth()->id();
        }

        $signature = $project->signatures()->create($data);
        return new ProjectSignatureResource($signature);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, ProjectSignature $signature): ProjectSignatureResource
    {
        $signature->load(['signer', 'project']);
        return new ProjectSignatureResource($signature);
    }
}
