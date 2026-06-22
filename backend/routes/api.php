<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CannedResponseController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Widget\WidgetController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes ────────────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// ─── Widget Public Routes (authenticated by API key header) ───────────────
Route::prefix('widget')->group(function () {
    Route::post('/init',                                [WidgetController::class, 'init']);
    Route::post('/conversations',                       [WidgetController::class, 'startConversation']);
    Route::get('/conversations/{conversationId}/messages', [WidgetController::class, 'messages']);
    Route::post('/conversations/{conversationId}/messages', [WidgetController::class, 'sendMessage']);
    Route::post('/conversations/{conversationId}/typing',   [WidgetController::class, 'typing']);
    Route::post('/conversations/{conversationId}/csat',     [WidgetController::class, 'submitCsat']);
    Route::post('/activity',                            [WidgetController::class, 'updateActivity']);
});

// ─── Authenticated Agent Routes ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/auth/me',        [AuthController::class, 'me']);
    Route::post('/auth/logout',   [AuthController::class, 'logout']);
    Route::patch('/auth/status',  [AuthController::class, 'updateStatus']);

    // Workspace
    Route::get('/workspace',               [WorkspaceController::class, 'show']);
    Route::patch('/workspace',             [WorkspaceController::class, 'update']);
    Route::get('/workspace/agents',        [WorkspaceController::class, 'agents']);
    Route::patch('/workspace/agents/{agent}', [WorkspaceController::class, 'updateAgent']);
    Route::delete('/workspace/agents/{agent}', [WorkspaceController::class, 'removeAgent']);
    Route::post('/workspace/invite',       [WorkspaceController::class, 'inviteAgent']);
    Route::post('/workspace/api-key',      [WorkspaceController::class, 'apiKey']);

    // Conversations
    Route::get('/conversations',            [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::patch('/conversations/{conversation}', [ConversationController::class, 'update']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
    Route::post('/conversations/{conversation}/typing',  [ConversationController::class, 'typing']);
    Route::post('/conversations/{conversation}/labels',  [ConversationController::class, 'assignLabels']);

    // Labels
    Route::apiResource('labels', LabelController::class);

    // Canned Responses
    Route::apiResource('canned-responses', CannedResponseController::class);

    // Contacts
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contacts/{id}', [ContactController::class, 'show']);

    // Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('/overview',     [AnalyticsController::class, 'overview']);
        Route::get('/volume',       [AnalyticsController::class, 'volumeChart']);
        Route::get('/agents',       [AnalyticsController::class, 'agentPerformance']);
        Route::get('/csat',         [AnalyticsController::class, 'csatChart']);
    });
});
