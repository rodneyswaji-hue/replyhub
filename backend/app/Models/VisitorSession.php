<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VisitorSession extends Model
{
    protected $fillable = [
        'workspace_id', 'contact_id', 'session_token',
        'current_url', 'referrer', 'browser', 'os',
        'country', 'city', 'ip', 'last_activity_at',
    ];

    protected function casts(): array
    {
        return ['last_activity_at' => 'datetime'];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($session) {
            if (empty($session->session_token)) {
                $session->session_token = Str::random(64);
            }
        });
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
