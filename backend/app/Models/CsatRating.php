<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CsatRating extends Model
{
    protected $fillable = ['conversation_id', 'contact_id', 'rating', 'feedback'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
