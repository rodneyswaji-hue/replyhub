<?php

namespace App\Events;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
        public Conversation $conversation,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("workspace.{$this->conversation->workspace_id}"),
            new PrivateChannel("conversation.{$this->conversation->id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'              => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_type'     => $this->message->sender_type,
                'sender_id'       => $this->message->sender_id,
                'content'         => $this->message->content,
                'type'            => $this->message->type,
                'attachments'     => $this->message->attachments,
                'is_private'      => $this->message->is_private,
                'created_at'      => $this->message->created_at?->toIso8601String(),
                'sender'          => $this->getSenderData(),
            ],
            'conversation' => [
                'id'     => $this->conversation->id,
                'status' => $this->conversation->status,
            ],
        ];
    }

    private function getSenderData(): array
    {
        if ($this->message->sender_type === 'agent') {
            $agent = \App\Models\User::find($this->message->sender_id);
            return $agent ? ['id' => $agent->id, 'name' => $agent->name, 'avatar' => $agent->avatar] : [];
        }
        if ($this->message->sender_type === 'contact') {
            $contact = \App\Models\Contact::find($this->message->sender_id);
            return $contact ? ['id' => $contact->id, 'name' => $contact->name, 'email' => $contact->email] : [];
        }
        return [];
    }
}
