<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->workspace->labels()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => 'required|string|size:7',
        ]);

        $label = $request->user()->workspace->labels()->create($data);
        return response()->json($label, 201);
    }

    public function update(Request $request, Label $label)
    {
        abort_if($label->workspace_id !== $request->user()->workspace_id, 403);
        $data = $request->validate(['name' => 'string|max:50', 'color' => 'string|size:7']);
        $label->update($data);
        return response()->json($label);
    }

    public function destroy(Request $request, Label $label)
    {
        abort_if($label->workspace_id !== $request->user()->workspace_id, 403);
        $label->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
