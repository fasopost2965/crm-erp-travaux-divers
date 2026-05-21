<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Authenticate user and return token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants incorrects.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();
        $user->load('role');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'tokenType' => 'Bearer',
            'user' => new UserResource($user)
        ]);
    }

    /**
     * Revoke authenticated user token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Return currently authenticated user profile.
     */
    public function me(Request $request): UserResource
    {
        $user = $request->user();
        $user->load('role');
        return new UserResource($user);
    }
}
