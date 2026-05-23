<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Employee::with('activeContract')->withTrashed(false);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('contract_type')) {
            $query->where('contract_type', $request->contract_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('position', 'like', "%{$s}%")
                  ->orWhere('cin', 'like', "%{$s}%");
            });
        }

        $employees = $query->orderBy('last_name')->paginate($request->get('per_page', 20));

        return EmployeeResource::collection($employees);
    }

    public function store(StoreEmployeeRequest $request): EmployeeResource
    {
        $employee = Employee::create($request->validated());
        return new EmployeeResource($employee->load('contracts'));
    }

    public function show(Employee $employee): EmployeeResource
    {
        return new EmployeeResource($employee->load('contracts'));
    }

    public function update(StoreEmployeeRequest $request, Employee $employee): EmployeeResource
    {
        $employee->update($request->validated());
        return new EmployeeResource($employee->load('contracts'));
    }

    public function destroy(Employee $employee): \Illuminate\Http\JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employé archivé avec succès.']);
    }
}
