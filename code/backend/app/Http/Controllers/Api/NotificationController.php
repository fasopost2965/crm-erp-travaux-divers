<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $notifications = $user->notifications()->latest()->take(30)->get()->map(function ($n) {
            $data = json_decode($n->data, true) ?? [];
            return [
                'id'        => $n->id,
                'type'      => $n->type,
                'title'     => $data['title'] ?? 'Notification',
                'message'   => $data['message'] ?? '',
                'link'      => $data['link'] ?? null,
                'category'  => $data['category'] ?? 'info',
                'readAt'    => $n->read_at?->toIso8601String(),
                'createdAt' => $n->created_at->toIso8601String(),
            ];
        });

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount'   => $unreadCount,
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'link'     => 'nullable|string',
            'category' => 'nullable|in:info,success,warning,error',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = isset($validated['user_ids'])
            ? \App\Models\User::whereIn('id', $validated['user_ids'])->get()
            : \App\Models\User::all();

        foreach ($users as $user) {
            $user->notifications()->create([
                'id'              => Str::uuid(),
                'type'            => 'App\\Notifications\\GeneralNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id'   => $user->id,
                'data'            => json_encode([
                    'title'    => $validated['title'],
                    'message'  => $validated['message'],
                    'link'     => $validated['link'] ?? null,
                    'category' => $validated['category'] ?? 'info',
                ]),
            ]);
        }

        return response()->json(['message' => 'Notification envoyée.'], 201);
    }
}
