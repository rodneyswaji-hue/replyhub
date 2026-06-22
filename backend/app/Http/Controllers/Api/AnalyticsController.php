<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $workspace = $request->user()->workspace;
        $from = now()->subDays((int) $request->input('days', 30))->startOfDay();

        $conversations = $workspace->conversations()->where('created_at', '>=', $from);

        $totalConversations = (clone $conversations)->count();
        $openConversations = $workspace->conversations()->where('status', 'open')->count();
        $pendingConversations = $workspace->conversations()->where('status', 'pending')->count();
        $resolvedConversations = (clone $conversations)->where('status', 'resolved')->count();

        $avgFirstReply = (clone $conversations)
            ->whereNotNull('first_reply_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (first_reply_at - created_at))) as avg_seconds')
            ->value('avg_seconds');

        $avgResolution = (clone $conversations)
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_seconds')
            ->value('avg_seconds');

        $csatAvg = $workspace->conversations()
            ->join('csat_ratings', 'conversations.id', '=', 'csat_ratings.conversation_id')
            ->where('csat_ratings.created_at', '>=', $from)
            ->avg('csat_ratings.rating');

        return response()->json([
            'total_conversations'   => $totalConversations,
            'open_conversations'    => $openConversations,
            'pending_conversations' => $pendingConversations,
            'resolved_conversations'=> $resolvedConversations,
            'avg_first_reply_secs'  => round($avgFirstReply ?? 0),
            'avg_resolution_secs'   => round($avgResolution ?? 0),
            'csat_avg'              => round($csatAvg ?? 0, 2),
        ]);
    }

    public function volumeChart(Request $request)
    {
        $workspace = $request->user()->workspace;
        $days = (int) $request->input('days', 30);
        $from = now()->subDays($days)->startOfDay();

        $data = $workspace->conversations()
            ->where('created_at', '>=', $from)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as total, SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved")
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function agentPerformance(Request $request)
    {
        $workspace = $request->user()->workspace;
        $from = now()->subDays((int) $request->input('days', 30))->startOfDay();

        $data = $workspace->users()
            ->leftJoin('conversations', function ($join) use ($from) {
                $join->on('users.id', '=', 'conversations.assigned_to')
                     ->where('conversations.created_at', '>=', $from);
            })
            ->selectRaw('
                users.id, users.name, users.avatar, users.status,
                COUNT(conversations.id) as total_assigned,
                SUM(CASE WHEN conversations.status = \'resolved\' THEN 1 ELSE 0 END) as resolved,
                AVG(EXTRACT(EPOCH FROM (conversations.first_reply_at - conversations.created_at))) as avg_first_reply
            ')
            ->groupBy('users.id', 'users.name', 'users.avatar', 'users.status')
            ->get();

        return response()->json($data);
    }

    public function csatChart(Request $request)
    {
        $workspace = $request->user()->workspace;
        $from = now()->subDays((int) $request->input('days', 30))->startOfDay();

        $data = DB::table('csat_ratings')
            ->join('conversations', 'csat_ratings.conversation_id', '=', 'conversations.id')
            ->where('conversations.workspace_id', $workspace->id)
            ->where('csat_ratings.created_at', '>=', $from)
            ->selectRaw("DATE(csat_ratings.created_at) as date, AVG(rating) as avg_rating, COUNT(*) as total")
            ->groupByRaw('DATE(csat_ratings.created_at)')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }
}
