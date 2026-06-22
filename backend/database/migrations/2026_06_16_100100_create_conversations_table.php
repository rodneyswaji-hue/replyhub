<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('visitor_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('open'); // open | pending | resolved | closed
            $table->string('channel')->default('chat'); // chat | email
            $table->string('subject')->nullable();
            $table->string('priority')->default('normal'); // low | normal | high | urgent
            $table->boolean('is_ticket')->default(false);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('first_reply_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'status']);
            $table->index(['workspace_id', 'assigned_to']);
            $table->index('last_message_at');
        });

        Schema::create('conversation_labels', function (Blueprint $table) {
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('label_id')->constrained()->cascadeOnDelete();
            $table->primary(['conversation_id', 'label_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('sender_type'); // agent | contact | system
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->text('content');
            $table->string('type')->default('text'); // text | note | file | system
            $table->json('attachments')->nullable();
            $table->boolean('is_private')->default(false); // internal agent notes
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('typing_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('sender_type');
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->timestamp('last_typed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_indicators');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_labels');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('labels');
    }
};
