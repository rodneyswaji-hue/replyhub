<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->string('country', 2)->nullable();
            $table->string('city')->nullable();
            $table->string('timezone')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'email']);
        });

        Schema::create('visitor_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token', 64)->unique();
            $table->string('current_url')->nullable();
            $table->string('referrer')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('country', 2)->nullable();
            $table->string('city')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_sessions');
        Schema::dropIfExists('contacts');
    }
};
