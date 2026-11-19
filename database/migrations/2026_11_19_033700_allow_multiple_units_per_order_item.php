<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->unique(['order_id', 'product_id', 'unit_number']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropUnique('order_items_order_id_product_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->unique(['order_id', 'product_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropUnique('order_items_order_id_product_id_unit_number_unique');
        });
    }
};
