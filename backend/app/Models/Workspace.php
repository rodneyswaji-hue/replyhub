<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'api_key', 'plan',
        'widget_color', 'widget_position', 'widget_greeting',
        'widget_agent_label', 'widget_avatar', 'show_branding',
        'business_hours', 'auto_reply',
    ];

    protected function casts(): array
    {
        return [
            'show_branding'  => 'boolean',
            'business_hours' => 'array',
            'auto_reply'     => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($workspace) {
            if (empty($workspace->api_key)) {
                $workspace->api_key = 'rh_' . Str::random(60);
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function labels()
    {
        return $this->hasMany(Label::class);
    }

    public function cannedResponses()
    {
        return $this->hasMany(CannedResponse::class);
    }

    public function onlineAgents()
    {
        return $this->users()->where('status', 'online');
    }
}
