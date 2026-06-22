<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->workspace->contacts()
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        return response()->json($query->paginate(50));
    }

    public function show(Request $request, $id)
    {
        $contact = $request->user()->workspace->contacts()->findOrFail($id);
        return response()->json($contact->load(['conversations' => fn($q) => $q->latest()->limit(10)]));
    }
}
