<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public User $agent) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("workspace.{$this->agent->workspace_id}")];
    }

    public function broadcastWith(): array
    {
        return [
            'agent' => [
                'id'     => $this->agent->id,
                'name'   => $this->agent->name,
                'avatar' => $this->agent->avatar,
                'status' => $this->agent->status,
            ],
        ];
    }
}
