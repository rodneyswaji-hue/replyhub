<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    protected $fillable = ['workspace_id', 'name', 'color'];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_labels');
    }
}
