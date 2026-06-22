<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id', 'contact_id', 'assigned_to', 'visitor_session_id',
        'status', 'channel', 'subject', 'priority', 'is_ticket',
        'last_message_at', 'first_reply_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_ticket'      => 'boolean',
            'last_message_at' => 'datetime',
            'first_reply_at'  => 'datetime',
            'resolved_at'     => 'datetime',
        ];
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function assignedAgent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function visitorSession()
    {
        return $this->belongsTo(VisitorSession::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function labels()
    {
        return $this->belongsToMany(Label::class, 'conversation_labels');
    }

    public function notes()
    {
        return $this->hasMany(ConversationNote::class);
    }

    public function csatRating()
    {
        return $this->hasOne(CsatRating::class);
    }
}
