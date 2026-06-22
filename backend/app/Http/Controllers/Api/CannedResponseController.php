<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CannedResponse;
use Illuminate\Http\Request;

class CannedResponseController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->workspace->cannedResponses()
            ->with('creator:id,name')
            ->orderBy('title');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('shortcut', 'ilike', "%{$search}%")
                  ->orWhere('content', 'ilike', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string|max:100',
            'shortcut' => 'nullable|string|max:50|alpha_dash',
            'content'  => 'required|string|max:5000',
        ]);

        $canned = $request->user()->workspace->cannedResponses()->create(
            array_merge($data, ['created_by' => $request->user()->id])
        );

        return response()->json($canned->load('creator:id,name'), 201);
    }

    public function update(Request $request, CannedResponse $cannedResponse)
    {
        abort_if($cannedResponse->workspace_id !== $request->user()->workspace_id, 403);

        $data = $request->validate([
            'title'    => 'string|max:100',
            'shortcut' => 'nullable|string|max:50|alpha_dash',
            'content'  => 'string|max:5000',
        ]);

        $cannedResponse->update($data);

        return response()->json($cannedResponse->load('creator:id,name'));
    }

    public function destroy(Request $request, CannedResponse $cannedResponse)
    {
        abort_if($cannedResponse->workspace_id !== $request->user()->workspace_id, 403);
        $cannedResponse->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
