<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

// Agents subscribe to their workspace channel for new conversations
Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    return (int) $user->workspace_id === (int) $workspaceId;
});

// Agents subscribe to individual conversation channels
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    return $conversation && (int) $conversation->workspace_id === (int) $user->workspace_id;
});

// Presence channel for agent roster (shows who is online)
Broadcast::channel('presence-workspace.{workspaceId}', function ($user, $workspaceId) {
    if ((int) $user->workspace_id !== (int) $workspaceId) {
        return false;
    }
    return [
        'id'     => $user->id,
        'name'   => $user->name,
        'avatar' => $user->avatar,
        'status' => $user->status,
    ];
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
