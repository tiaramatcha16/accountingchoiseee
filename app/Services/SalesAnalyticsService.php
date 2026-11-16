<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class SalesAnalyticsService
{
    /**
     * @return array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}
     */
    public function range(
        CarbonImmutable $start,
        CarbonImmutable $end,
        CarbonImmutable $previousStart,
        CarbonImmutable $previousEnd,
        string $label,
    ): array {
        return [
            'start' => $start->startOfDay(),
            'end' => $end->endOfDay(),
            'previousStart' => $previousStart->startOfDay(),
            'previousEnd' => $previousEnd->endOfDay(),
            'label' => $label,
        ];
    }

    /**
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $chartRange
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $productRange
     * @return array{chart: array<string, mixed>, products: array<string, mixed>}
     */
    public function build(array $chartRange, array $productRange, string $chartGroup, int $page = 1, bool $allProducts = false): array
    {
        return [
            'chart' => $this->buildChart($chartRange, $chartGroup),
            'products' => $this->buildProductReport($productRange, max(1, $page), $allProducts),
        ];
    }

    /**
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $range
     * @return array<string, mixed>
     */
    private function buildChart(array $range, string $group): array
    {
        return [
            'label' => $range['label'],
            'group' => $group,
            'groupLabel' => $this->groupLabel($group),
            'from' => $range['start']->toDateString(),
            'to' => $range['end']->toDateString(),
            'previousFrom' => $range['previousStart']->toDateString(),
            'previousTo' => $range['previousEnd']->toDateString(),
            'current' => $this->summary($range['start'], $range['end']),
            'previous' => $this->summary($range['previousStart'], $range['previousEnd']),
            'trend' => $this->trend($range, $group),
        ];
    }

    /**
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $range
     * @return array<string, mixed>
     */
    private function buildProductReport(array $range, int $page, bool $allProducts): array
    {
        $current = $this->summary($range['start'], $range['end']);
        $previous = $this->summary($range['previousStart'], $range['previousEnd']);
        $performance = $this->productPerformanceQuery($range);
        $topProducts = (clone $performance)
            ->where('products.status', Product::STATUS_PUBLISHED)
            ->orderByDesc('current_units')
            ->orderByDesc('current_revenue')
            ->orderBy('products.title')
            ->limit(8)
            ->get()
            ->map(fn (object $product) => $this->presentProduct($product, $current['revenue']))
            ->values()
            ->all();

        if ($allProducts) {
            $rows = (clone $performance)
                ->orderByDesc('current_revenue')
                ->orderBy('products.title')
                ->get()
                ->map(fn (object $product) => $this->presentProduct($product, $current['revenue']))
                ->values();
            $table = [
                'data' => $rows,
                'current_page' => 1,
                'last_page' => 1,
                'total' => $rows->count(),
                'prev_page_url' => null,
                'next_page_url' => null,
            ];
        } else {
            $table = (clone $performance)
                ->orderByDesc('current_revenue')
                ->orderBy('products.title')
                ->paginate(25, ['*'], 'page', $page)
                ->withQueryString()
                ->through(fn (object $product) => $this->presentProduct($product, $current['revenue']));
        }

        return [
            'label' => $range['label'],
            'from' => $range['start']->toDateString(),
            'to' => $range['end']->toDateString(),
            'previousFrom' => $range['previousStart']->toDateString(),
            'previousTo' => $range['previousEnd']->toDateString(),
            'current' => $current,
            'previous' => $previous,
            'topProducts' => $topProducts,
            'table' => $table,
        ];
    }

    /**
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $range
     */
    private function productPerformanceQuery(array $range): Builder
    {
        return DB::table('products')
            ->leftJoinSub($this->productSales($range['start'], $range['end']), 'current_sales', 'current_sales.product_id', '=', 'products.id')
            ->leftJoinSub($this->productSales($range['previousStart'], $range['previousEnd']), 'previous_sales', 'previous_sales.product_id', '=', 'products.id')
            ->select([
                'products.id',
                'products.title',
                'products.category',
                'products.status',
            ])
            ->selectRaw('COALESCE(current_sales.units, 0) as current_units')
            ->selectRaw('COALESCE(current_sales.revenue, 0) as current_revenue')
            ->selectRaw('COALESCE(previous_sales.units, 0) as previous_units')
            ->selectRaw('COALESCE(previous_sales.revenue, 0) as previous_revenue');
    }

    private function productSales(CarbonImmutable $start, CarbonImmutable $end): Builder
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', Order::STATUS_PAID)
            ->whereBetween('orders.paid_at', [$start, $end])
            ->select('order_items.product_id')
            ->selectRaw('COUNT(*) as units, SUM(order_items.unit_price) as revenue')
            ->groupBy('order_items.product_id');
    }

    /**
     * @return array{revenue: int, orders: int, units: int, averageOrderValue: int}
     */
    private function summary(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $orders = DB::table('orders')
            ->where('status', Order::STATUS_PAID)
            ->whereBetween('paid_at', [$start, $end])
            ->selectRaw('COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue')
            ->first();
        $units = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', Order::STATUS_PAID)
            ->whereBetween('orders.paid_at', [$start, $end])
            ->count();
        $orderCount = (int) $orders->orders;
        $revenue = (int) $orders->revenue;

        return [
            'revenue' => $revenue,
            'orders' => $orderCount,
            'units' => $units,
            'averageOrderValue' => $orderCount === 0 ? 0 : (int) round($revenue / $orderCount),
        ];
    }

    /**
     * @param  array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}  $range
     * @return list<array{label: string, currentRevenue: int, previousRevenue: int, currentOrders: int, previousOrders: int}>
     */
    private function trend(array $range, string $group): array
    {
        $current = $this->revenueBuckets($range['start'], $range['end'], $group);
        $previous = $this->revenueBuckets($range['previousStart'], $range['previousEnd'], $group);
        $cursor = $this->bucketStart($range['start'], $group);
        $previousCursor = $this->bucketStart($range['previousStart'], $group);
        $lastBucket = $this->bucketStart($range['end'], $group);
        $points = [];

        while ($cursor->lessThanOrEqualTo($lastBucket)) {
            $currentBucket = $this->bucketKey($cursor, $group);
            $previousBucket = $this->bucketKey($previousCursor, $group);
            $points[] = [
                'label' => $this->bucketLabel($cursor, $group),
                'currentRevenue' => $current[$currentBucket]['revenue'] ?? 0,
                'previousRevenue' => $previous[$previousBucket]['revenue'] ?? 0,
                'currentOrders' => $current[$currentBucket]['orders'] ?? 0,
                'previousOrders' => $previous[$previousBucket]['orders'] ?? 0,
            ];
            $cursor = $this->advanceBucket($cursor, $group);
            $previousCursor = $this->advanceBucket($previousCursor, $group);
        }

        return $points;
    }

    /**
     * @return array<string, array{revenue: int, orders: int}>
     */
    private function revenueBuckets(CarbonImmutable $start, CarbonImmutable $end, string $group): array
    {
        $driver = DB::connection()->getDriverName();
        $format = match ([$driver, $group]) {
            ['mysql', 'day'] => 'DATE(paid_at)',
            ['mysql', 'week'] => 'DATE_SUB(DATE(paid_at), INTERVAL WEEKDAY(paid_at) DAY)',
            ['mysql', 'month'] => "DATE_FORMAT(paid_at, '%Y-%m')",
            ['mysql', 'year'] => "DATE_FORMAT(paid_at, '%Y')",
            ['pgsql', 'day'] => "TO_CHAR(paid_at, 'YYYY-MM-DD')",
            ['pgsql', 'week'] => "TO_CHAR(DATE_TRUNC('week', paid_at), 'YYYY-MM-DD')",
            ['pgsql', 'month'] => "TO_CHAR(paid_at, 'YYYY-MM')",
            ['pgsql', 'year'] => "TO_CHAR(paid_at, 'YYYY')",
            ['sqlite', 'day'] => "strftime('%Y-%m-%d', paid_at)",
            ['sqlite', 'week'] => "date(paid_at, '-' || ((CAST(strftime('%w', paid_at) AS INTEGER) + 6) % 7) || ' days')",
            ['sqlite', 'month'] => "strftime('%Y-%m', paid_at)",
            ['sqlite', 'year'] => "strftime('%Y', paid_at)",
            default => throw new \LogicException('Database driver or chart grouping is not supported for sales analytics.'),
        };

        return DB::table('orders')
            ->where('status', Order::STATUS_PAID)
            ->whereBetween('paid_at', [$start, $end])
            ->selectRaw($format.' as bucket, COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders')
            ->groupByRaw($format)
            ->orderByRaw($format)
            ->get()
            ->mapWithKeys(fn (object $row) => [(string) $row->bucket => [
                'revenue' => (int) $row->revenue,
                'orders' => (int) $row->orders,
            ]])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function presentProduct(object $product, int $totalRevenue): array
    {
        $revenue = (int) $product->current_revenue;

        return [
            'id' => (int) $product->id,
            'title' => $product->title,
            'category' => $product->category,
            'status' => $product->status,
            'currentUnits' => (int) $product->current_units,
            'previousUnits' => (int) $product->previous_units,
            'currentRevenue' => $revenue,
            'previousRevenue' => (int) $product->previous_revenue,
            'revenueShare' => $totalRevenue === 0 ? 0 : round($revenue / $totalRevenue * 100, 1),
        ];
    }

    private function bucketStart(CarbonImmutable $date, string $group): CarbonImmutable
    {
        return match ($group) {
            'week' => $date->startOfWeek(Carbon::MONDAY),
            'month' => $date->startOfMonth(),
            'year' => $date->startOfYear(),
            default => $date->startOfDay(),
        };
    }

    private function bucketKey(CarbonImmutable $date, string $group): string
    {
        return match ($group) {
            'month' => $date->format('Y-m'),
            'year' => $date->format('Y'),
            default => $date->format('Y-m-d'),
        };
    }

    private function bucketLabel(CarbonImmutable $date, string $group): string
    {
        return match ($group) {
            'month' => $this->monthName((int) $date->format('n')).' '.$date->format('Y'),
            'year' => $date->format('Y'),
            'week' => 'Minggu '.$date->format('j').' '.$this->monthName((int) $date->format('n')),
            default => $date->format('j').' '.$this->monthName((int) $date->format('n')),
        };
    }

    private function advanceBucket(CarbonImmutable $date, string $group): CarbonImmutable
    {
        return match ($group) {
            'week' => $date->addWeek(),
            'month' => $date->addMonth(),
            'year' => $date->addYear(),
            default => $date->addDay(),
        };
    }

    private function groupLabel(string $group): string
    {
        return match ($group) {
            'week' => 'Mingguan',
            'month' => 'Bulanan',
            'year' => 'Tahunan',
            default => 'Harian',
        };
    }

    private function monthName(int $month): string
    {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][$month - 1];
    }
}
