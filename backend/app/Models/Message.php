<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id', 'sender_type', 'sender_id',
        'content', 'type', 'attachments', 'is_private', 'read_at',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'is_private'  => 'boolean',
            'read_at'     => 'datetime',
        ];
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        if ($this->sender_type === 'agent') {
            return $this->belongsTo(User::class, 'sender_id');
        }
        return $this->belongsTo(Contact::class, 'sender_id');
    }

    public function getAgentAttribute(): ?User
    {
        return $this->sender_type === 'agent'
            ? User::find($this->sender_id)
            : null;
    }
}
