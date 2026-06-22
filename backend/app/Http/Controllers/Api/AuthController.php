<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'workspace_name' => 'required|string|max:100',
            'name'           => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
        ]);

        $slug = Str::slug($data['workspace_name']);
        $baseSlug = $slug;
        $i = 1;
        while (Workspace::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }

        $workspace = Workspace::create([
            'name' => $data['workspace_name'],
            'slug' => $slug,
        ]);

        $user = User::create([
            'workspace_id' => $workspace->id,
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password'     => $data['password'],
            'role'         => 'owner',
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'      => $user->load('workspace'),
            'workspace' => $workspace,
            'token'     => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($data)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth')->plainTextToken;

        $user->update([
            'status'       => 'online',
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'user'      => $user->load('workspace'),
            'workspace' => $user->workspace,
            'token'     => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->update(['status' => 'offline', 'last_seen_at' => now()]);
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('workspace'));
    }

    public function updateStatus(Request $request)
    {
        $data = $request->validate(['status' => 'required|in:online,away,offline']);
        $user = $request->user();
        $user->update(['status' => $data['status'], 'last_seen_at' => now()]);

        event(new \App\Events\AgentStatusChanged($user));

        return response()->json($user);
    }
}
