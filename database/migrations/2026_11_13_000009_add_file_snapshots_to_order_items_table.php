<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
        });

        DB::table('order_items as oi')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->select('oi.id as order_item_id', 'p.file_path', 'p.original_filename')
            ->orderBy('oi.id')
            ->chunkById(500, function ($items) {
                foreach ($items as $item) {
                    DB::table('order_items')
                        ->where('id', $item->order_item_id)
                        ->update([
                            'file_path' => $item->file_path,
                            'file_name' => $item->original_filename,
                        ]);
                }
            }, 'oi.id', 'order_item_id');
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_name']);
        });
    }
};
