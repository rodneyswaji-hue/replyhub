<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentInvitation extends Model
{
    protected $fillable = ['workspace_id', 'email', 'role', 'token', 'expires_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}
