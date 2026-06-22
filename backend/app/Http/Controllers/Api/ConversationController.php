<?php

namespace App\Http\Controllers\Api;

use App\Events\ConversationUpdated;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $workspace = $request->user()->workspace;

        $query = $workspace->conversations()
            ->with(['contact', 'assignedAgent', 'latestMessage', 'labels'])
            ->orderByDesc('last_message_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->boolean('is_ticket')) {
            $query->where('is_ticket', true);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'ilike', "%{$search}%")
                  ->orWhereHas('contact', fn($c) => $c->where('name', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%"));
            });
        }

        return response()->json($query->paginate(25));
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);

        $conversation->load(['contact', 'assignedAgent', 'visitorSession', 'labels', 'notes.user', 'csatRating']);

        return response()->json($conversation);
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);

        $messages = $conversation->messages()
            ->where('is_private', false)
            ->orWhere(fn($q) => $q->where('is_private', true))
            ->orderBy('created_at')
            ->get()
            ->map(function ($msg) {
                return array_merge($msg->toArray(), ['sender' => $this->resolveSender($msg)]);
            });

        return response()->json($messages);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);

        $data = $request->validate([
            'content'    => 'required|string|max:10000',
            'type'       => 'in:text,note',
            'is_private' => 'boolean',
        ]);

        $user = $request->user();

        $message = $conversation->messages()->create([
            'sender_type' => 'agent',
            'sender_id'   => $user->id,
            'content'     => $data['content'],
            'type'        => $data['type'] ?? 'text',
            'is_private'  => $data['is_private'] ?? false,
        ]);

        if (!($data['is_private'] ?? false)) {
            $update = ['last_message_at' => now()];
            if (!$conversation->first_reply_at) {
                $update['first_reply_at'] = now();
            }
            if ($conversation->status === 'pending') {
                $update['status'] = 'open';
            }
            $conversation->update($update);

            event(new MessageSent($message, $conversation));
            event(new ConversationUpdated($conversation));
        }

        return response()->json(array_merge(
            $message->toArray(),
            ['sender' => ['id' => $user->id, 'name' => $user->name, 'avatar' => $user->avatar]]
        ), 201);
    }

    public function update(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);

        $data = $request->validate([
            'status'      => 'in:open,pending,resolved,closed',
            'priority'    => 'in:low,normal,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'subject'     => 'string|max:255',
            'is_ticket'   => 'boolean',
        ]);

        if (isset($data['status']) && $data['status'] === 'resolved') {
            $data['resolved_at'] = now();
        }

        $conversation->update($data);

        event(new ConversationUpdated($conversation));

        return response()->json($conversation->fresh(['contact', 'assignedAgent', 'labels']));
    }

    public function assignLabels(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);
        $data = $request->validate(['label_ids' => 'array', 'label_ids.*' => 'exists:labels,id']);
        $conversation->labels()->sync($data['label_ids'] ?? []);
        event(new ConversationUpdated($conversation));
        return response()->json($conversation->load('labels'));
    }

    public function typing(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($request, $conversation);
        $data = $request->validate(['is_typing' => 'required|boolean']);
        $user = $request->user();

        event(new \App\Events\TypingIndicator(
            $conversation->id,
            'agent',
            $user->id,
            $user->name,
            $data['is_typing'],
        ));

        return response()->json(['ok' => true]);
    }

    private function authorizeConversation(Request $request, Conversation $conversation)
    {
        abort_if($conversation->workspace_id !== $request->user()->workspace_id, 403);
    }

    private function resolveSender(Message $msg): array
    {
        if ($msg->sender_type === 'agent' && $msg->sender_id) {
            $agent = \App\Models\User::find($msg->sender_id);
            return $agent ? ['id' => $agent->id, 'name' => $agent->name, 'avatar' => $agent->avatar] : [];
        }
        if ($msg->sender_type === 'contact' && $msg->sender_id) {
            $contact = \App\Models\Contact::find($msg->sender_id);
            return $contact ? ['id' => $contact->id, 'name' => $contact->name, 'email' => $contact->email] : [];
        }
        return [];
    }
}
