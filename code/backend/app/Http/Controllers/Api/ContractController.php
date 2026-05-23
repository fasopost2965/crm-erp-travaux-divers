<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Models\Employee;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContractController extends Controller
{
    public function index(Employee $employee): AnonymousResourceCollection
    {
        $contracts = $employee->contracts()->orderBy('start_date', 'desc')->get();
        return ContractResource::collection($contracts);
    }

    public function store(StoreContractRequest $request, Employee $employee): ContractResource
    {
        $contract = $employee->contracts()->create($request->validated());
        return new ContractResource($contract);
    }

    public function show(Employee $employee, Contract $contract): ContractResource
    {
        abort_if($contract->employee_id !== $employee->id, 404);
        return new ContractResource($contract);
    }

    public function update(StoreContractRequest $request, Employee $employee, Contract $contract): ContractResource
    {
        abort_if($contract->employee_id !== $employee->id, 404);
        $contract->update($request->validated());
        return new ContractResource($contract);
    }

    public function destroy(Employee $employee, Contract $contract): \Illuminate\Http\JsonResponse
    {
        abort_if($contract->employee_id !== $employee->id, 404);
        $contract->delete();
        return response()->json(['message' => 'Contrat supprimé.']);
    }
}
