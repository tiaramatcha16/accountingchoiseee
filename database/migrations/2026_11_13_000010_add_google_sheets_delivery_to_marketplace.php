<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('file_path')->nullable()->change();
            $table->string('original_filename')->nullable()->change();
            $table->string('google_sheet_id')->nullable();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('google_sheet_id')->nullable();
            $table->string('delivery_file_id')->nullable();
            $table->text('delivery_url')->nullable();
        });
    }

    public function down(): void
    {
        if (
            DB::table('products')->whereNotNull('google_sheet_id')->exists()
            || DB::table('order_items')->whereNotNull('google_sheet_id')->exists()
        ) {
            throw new RuntimeException('Cannot remove Google Sheets support while products or orders still use it.');
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['google_sheet_id', 'delivery_file_id', 'delivery_url']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('google_sheet_id');
            $table->string('file_path')->nullable(false)->change();
            $table->string('original_filename')->nullable(false)->change();
        });
    }
};
