<?php

namespace App\Http\Controllers\Widget;

use App\Events\ConversationUpdated;
use App\Events\MessageSent;
use App\Events\TypingIndicator;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Workspace;
use App\Models\VisitorSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WidgetController extends Controller
{
    /**
     * Initialize a visitor session and return workspace widget config.
     */
    public function init(Request $request)
    {
        $workspace = $this->resolveWorkspace($request);

        $data = $request->validate([
            'email'       => 'nullable|email',
            'name'        => 'nullable|string|max:100',
            'current_url' => 'nullable|string|max:1000',
            'referrer'    => 'nullable|string|max:1000',
        ]);

        $contact = null;
        if (!empty($data['email'])) {
            $contact = $workspace->contacts()->firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'] ?? null]
            );
        }

        $userAgent = $request->header('User-Agent', '');
        $session = VisitorSession::create([
            'workspace_id'    => $workspace->id,
            'contact_id'      => $contact?->id,
            'current_url'     => $data['current_url'] ?? null,
            'referrer'        => $data['referrer'] ?? null,
            'browser'         => $this->detectBrowser($userAgent),
            'os'              => $this->detectOs($userAgent),
            'ip'              => $request->ip(),
            'last_activity_at'=> now(),
        ]);

        $onlineAgents = $workspace->onlineAgents()->count();

        return response()->json([
            'session_token'  => $session->session_token,
            'widget_config'  => [
                'color'        => $workspace->widget_color,
                'position'     => $workspace->widget_position,
                'greeting'     => $workspace->widget_greeting,
                'agent_label'  => $workspace->widget_agent_label,
                'show_branding'=> $workspace->show_branding,
            ],
            'online_agents'  => $onlineAgents,
            'contact'        => $contact,
        ]);
    }

    /**
     * Start a new conversation or return existing open one for session.
     */
    public function startConversation(Request $request)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);

        $data = $request->validate([
            'message'  => 'required|string|max:5000',
            'email'    => 'nullable|email',
            'name'     => 'nullable|string|max:100',
            'subject'  => 'nullable|string|max:255',
        ]);

        // Resolve or create contact
        if (!$session->contact_id && !empty($data['email'])) {
            $contact = $workspace->contacts()->firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'] ?? null, 'browser' => $session->browser, 'os' => $session->os, 'country' => $session->country, 'city' => $session->city]
            );
            $session->update(['contact_id' => $contact->id]);
        }

        $contact = $session->contact ?? null;
        $onlineAgents = $workspace->onlineAgents()->count();

        $conversation = $workspace->conversations()->create([
            'contact_id'       => $contact?->id,
            'visitor_session_id'=> $session->id,
            'status'           => $onlineAgents > 0 ? 'open' : 'pending',
            'is_ticket'        => $onlineAgents === 0,
            'subject'          => $data['subject'] ?? Str::limit($data['message'], 60),
            'last_message_at'  => now(),
        ]);

        $message = $conversation->messages()->create([
            'sender_type' => 'contact',
            'sender_id'   => $contact?->id,
            'content'     => $data['message'],
            'type'        => 'text',
        ]);

        event(new MessageSent($message, $conversation));
        event(new ConversationUpdated($conversation));

        return response()->json([
            'conversation_id' => $conversation->id,
            'status'          => $conversation->status,
            'is_ticket'       => $conversation->is_ticket,
            'message'         => $message,
        ], 201);
    }

    /**
     * Send a message to an existing conversation.
     */
    public function sendMessage(Request $request, int $conversationId)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);

        $conversation = $workspace->conversations()->findOrFail($conversationId);

        $data = $request->validate(['content' => 'required|string|max:5000']);

        $message = $conversation->messages()->create([
            'sender_type' => 'contact',
            'sender_id'   => $session->contact_id,
            'content'     => $data['content'],
            'type'        => 'text',
        ]);

        $conversation->update(['last_message_at' => now(), 'status' => 'open']);

        event(new MessageSent($message, $conversation));
        event(new ConversationUpdated($conversation));

        return response()->json($message, 201);
    }

    /**
     * Get messages for a conversation (visitor view).
     */
    public function messages(Request $request, int $conversationId)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);

        $conversation = $workspace->conversations()->findOrFail($conversationId);

        $messages = $conversation->messages()
            ->where('is_private', false)
            ->orderBy('created_at')
            ->get()
            ->map(function ($msg) {
                $sender = null;
                if ($msg->sender_type === 'agent' && $msg->sender_id) {
                    $agent = \App\Models\User::find($msg->sender_id);
                    $sender = $agent ? ['name' => $agent->name, 'avatar' => $agent->avatar] : null;
                }
                return array_merge($msg->toArray(), ['sender' => $sender]);
            });

        return response()->json($messages);
    }

    public function typing(Request $request, int $conversationId)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);

        $conversation = $workspace->conversations()->findOrFail($conversationId);
        $data = $request->validate(['is_typing' => 'required|boolean']);

        $contact = $session->contact;
        event(new TypingIndicator(
            $conversation->id,
            'contact',
            $session->contact_id,
            $contact?->name ?? 'Visitor',
            $data['is_typing'],
        ));

        return response()->json(['ok' => true]);
    }

    public function submitCsat(Request $request, int $conversationId)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);
        $conversation = $workspace->conversations()->findOrFail($conversationId);

        $data = $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $rating = $conversation->csatRating()->updateOrCreate(
            ['conversation_id' => $conversation->id],
            array_merge($data, ['contact_id' => $session->contact_id])
        );

        return response()->json($rating, 201);
    }

    public function updateActivity(Request $request)
    {
        $workspace = $this->resolveWorkspace($request);
        $session = $this->resolveSession($request, $workspace);

        $session->update([
            'current_url'      => $request->input('current_url', $session->current_url),
            'last_activity_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    private function resolveWorkspace(Request $request): Workspace
    {
        $apiKey = $request->header('X-Widget-Key') ?? $request->input('api_key');
        $workspace = Workspace::where('api_key', $apiKey)->first();
        abort_if(!$workspace, 401, 'Invalid widget API key.');
        return $workspace;
    }

    private function resolveSession(Request $request, Workspace $workspace): VisitorSession
    {
        $token = $request->header('X-Session-Token') ?? $request->input('session_token');
        $session = VisitorSession::where('session_token', $token)
            ->where('workspace_id', $workspace->id)
            ->first();
        abort_if(!$session, 401, 'Invalid or expired session.');
        return $session;
    }

    private function detectBrowser(string $ua): string
    {
        if (str_contains($ua, 'Firefox')) return 'Firefox';
        if (str_contains($ua, 'Edg')) return 'Edge';
        if (str_contains($ua, 'Chrome')) return 'Chrome';
        if (str_contains($ua, 'Safari')) return 'Safari';
        return 'Unknown';
    }

    private function detectOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac')) return 'macOS';
        if (str_contains($ua, 'Linux')) return 'Linux';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        return 'Unknown';
    }
}
