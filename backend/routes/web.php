<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['service' => 'ReplyHub API', 'version' => '1.0']);
});

// Broadcasting auth for both Sanctum token-auth agents and widget visitors
Broadcast::routes(['middleware' => ['api']]);

