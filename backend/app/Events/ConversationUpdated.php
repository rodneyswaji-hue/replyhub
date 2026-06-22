<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Conversation $conversation) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("workspace.{$this->conversation->workspace_id}"),
            new PrivateChannel("conversation.{$this->conversation->id}"),
        ];
    }

    public function broadcastWith(): array
    {
        $this->conversation->load(['contact', 'assignedAgent', 'latestMessage', 'labels']);

        return [
            'conversation' => [
                'id'              => $this->conversation->id,
                'status'          => $this->conversation->status,
                'priority'        => $this->conversation->priority,
                'assigned_to'     => $this->conversation->assigned_to,
                'is_ticket'       => $this->conversation->is_ticket,
                'last_message_at' => $this->conversation->last_message_at?->toIso8601String(),
                'assigned_agent'  => $this->conversation->assignedAgent
                    ? ['id' => $this->conversation->assignedAgent->id, 'name' => $this->conversation->assignedAgent->name]
                    : null,
            ],
        ];
    }
}
