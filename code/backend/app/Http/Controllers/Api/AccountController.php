<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AccountController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Account::class, 'account');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $accounts = Account::with(['contacts', 'opportunities'])->paginate(10);
        return AccountResource::collection($accounts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountRequest $request): AccountResource
    {
        $account = Account::create($request->validated());
        return new AccountResource($account);
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $account): AccountResource
    {
        $account->load(['contacts', 'opportunities']);
        return new AccountResource($account);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountRequest $request, Account $account): AccountResource
    {
        $account->update($request->validated());
        return new AccountResource($account);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account): JsonResponse
    {
        $account->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
