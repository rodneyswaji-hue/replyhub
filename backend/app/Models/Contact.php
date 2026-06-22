<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id', 'name', 'email', 'phone', 'avatar',
        'country', 'city', 'timezone', 'browser', 'os', 'metadata',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function visitorSessions()
    {
        return $this->hasMany(VisitorSession::class);
    }
}
