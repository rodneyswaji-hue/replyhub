<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AgentInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->workspace->load('users'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'                => 'string|max:100',
            'widget_color'        => 'string|size:7',
            'widget_position'     => 'in:bottom-right,bottom-left',
            'widget_greeting'     => 'string|max:255',
            'widget_agent_label'  => 'string|max:100',
            'show_branding'       => 'boolean',
            'business_hours'      => 'nullable|array',
            'auto_reply'          => 'nullable|array',
        ]);

        $workspace = $request->user()->workspace;
        $workspace->update($data);

        return response()->json($workspace);
    }

    public function agents(Request $request)
    {
        $agents = $request->user()->workspace->users()
            ->select('id', 'name', 'email', 'role', 'avatar', 'status', 'last_seen_at', 'created_at')
            ->get();

        return response()->json($agents);
    }

    public function updateAgent(Request $request, User $agent)
    {
        abort_if($agent->workspace_id !== $request->user()->workspace_id, 403);
        abort_if(!$request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name'   => 'string|max:100',
            'role'   => 'in:admin,agent',
            'avatar' => 'nullable|string',
        ]);

        $agent->update($data);

        return response()->json($agent);
    }

    public function removeAgent(Request $request, User $agent)
    {
        abort_if($agent->workspace_id !== $request->user()->workspace_id, 403);
        abort_if(!$request->user()->isAdmin(), 403);
        abort_if($agent->role === 'owner', 422, 'Cannot remove workspace owner.');

        $agent->delete();

        return response()->json(['message' => 'Agent removed']);
    }

    public function inviteAgent(Request $request)
    {
        abort_if(!$request->user()->isAdmin(), 403);

        $data = $request->validate([
            'email' => 'required|email',
            'role'  => 'in:admin,agent',
        ]);

        // Check if user already in workspace
        $existing = $request->user()->workspace->users()->where('email', $data['email'])->first();
        if ($existing) {
            return response()->json(['message' => 'User already in workspace'], 422);
        }

        $invitation = \App\Models\AgentInvitation::updateOrCreate(
            ['workspace_id' => $request->user()->workspace_id, 'email' => $data['email']],
            ['role' => $data['role'] ?? 'agent', 'token' => Str::random(64), 'expires_at' => now()->addDays(7)]
        );

        // TODO: Send invitation email
        return response()->json(['message' => 'Invitation sent', 'token' => $invitation->token]);
    }

    public function apiKey(Request $request)
    {
        abort_if(!$request->user()->isOwner(), 403);
        $workspace = $request->user()->workspace;
        $workspace->update(['api_key' => 'rh_' . Str::random(60)]);
        return response()->json(['api_key' => $workspace->api_key]);
    }
}
