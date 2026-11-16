<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\SalesAnalyticsException;
use App\Http\Controllers\Controller;
use App\Services\SalesAnalyticsExportService;
use App\Services\SalesAnalyticsService;
use App\Services\SalesRecommendationService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SalesAnalyticsController extends Controller
{
    public function index(Request $request, SalesAnalyticsService $analytics): Response
    {
        $selection = $this->filters($request, $analytics);
        $report = $analytics->build(
            $selection['chartRange'],
            $selection['productRange'],
            $selection['filters']['chartGroup'],
            max(1, (int) $request->input('page', 1)),
        );

        return Inertia::render('admin/analytics', [
            'report' => $report,
            'filters' => $selection['filters'],
        ]);
    }

    public function recommendations(
        Request $request,
        SalesAnalyticsService $analytics,
        SalesRecommendationService $recommendations,
    ): JsonResponse {
        $selection = $this->filters($request, $analytics);

        try {
            $report = $analytics->build(
                $selection['chartRange'],
                $selection['productRange'],
                $selection['filters']['chartGroup'],
            );

            return response()->json($recommendations->generate($report['products']));
        } catch (SalesAnalyticsException $exception) {
            Log::warning('AI sales recommendations were unavailable.', [
                'reason' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Rekomendasi AI belum tersedia saat ini. Laporan penjualan tetap dapat digunakan.',
            ], 503);
        }
    }

    public function exportPdf(
        Request $request,
        SalesAnalyticsService $analytics,
        SalesAnalyticsExportService $exports,
    ): SymfonyResponse {
        $selection = $this->filters($request, $analytics);
        $report = $analytics->build(
            $selection['chartRange'],
            $selection['productRange'],
            $selection['filters']['chartGroup'],
            allProducts: true,
        );

        return $exports->pdf($report);
    }

    public function exportExcel(
        Request $request,
        SalesAnalyticsService $analytics,
        SalesAnalyticsExportService $exports,
    ): SymfonyResponse {
        $selection = $this->filters($request, $analytics);
        $report = $analytics->build(
            $selection['chartRange'],
            $selection['productRange'],
            $selection['filters']['chartGroup'],
            allProducts: true,
        );

        return $exports->excel($report);
    }

    /**
     * @return array{
     *   filters: array{chartPreset: string, chartStart: string, chartEnd: string, chartGroup: string, productPreset: string, productStart: string, productEnd: string},
     *   chartRange: array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string},
     *   productRange: array{start: CarbonImmutable, end: CarbonImmutable, previousStart: CarbonImmutable, previousEnd: CarbonImmutable, label: string}
     * }
     */
    private function filters(Request $request, SalesAnalyticsService $analytics): array
    {
        $validated = $request->validate([
            'chart_preset' => ['sometimes', 'required', Rule::in(['week', 'month', 'year', 'custom'])],
            'chart_start' => ['nullable', 'required_if:chart_preset,custom', 'date_format:Y-m-d'],
            'chart_end' => ['nullable', 'required_if:chart_preset,custom', 'date_format:Y-m-d', 'after_or_equal:chart_start'],
            'chart_group' => ['sometimes', 'required', Rule::in(['day', 'week', 'month', 'year'])],
            'product_preset' => ['sometimes', 'required', Rule::in(['week', 'month', 'year', 'custom'])],
            'product_start' => ['nullable', 'required_if:product_preset,custom', 'date_format:Y-m-d'],
            'product_end' => ['nullable', 'required_if:product_preset,custom', 'date_format:Y-m-d', 'after_or_equal:product_start'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);
        $today = CarbonImmutable::today('UTC');
        $chartPreset = $validated['chart_preset'] ?? 'month';
        $productPreset = $validated['product_preset'] ?? 'month';
        $chartGroup = $validated['chart_group'] ?? 'day';

        [$chartStart, $chartEnd, $chartLabel] = $this->chartPeriod($chartPreset, $today, $validated);
        [$productStart, $productEnd, $productLabel] = $this->productPeriod($productPreset, $today, $validated);
        $this->ensureCurrentOrPast($chartStart, $chartEnd, 'Grafik');
        $this->ensureCurrentOrPast($productStart, $productEnd, 'Template');
        $chartPrevious = $this->previousRange($chartStart, $chartEnd, $chartPreset);
        $productPrevious = $this->previousRange($productStart, $productEnd, $productPreset);
        $chartRange = $analytics->range($chartStart, $chartEnd, $chartPrevious[0], $chartPrevious[1], $chartLabel);
        $productRange = $analytics->range($productStart, $productEnd, $productPrevious[0], $productPrevious[1], $productLabel);

        return [
            'filters' => [
                'chartPreset' => $chartPreset,
                'chartStart' => $chartStart->toDateString(),
                'chartEnd' => $chartEnd->toDateString(),
                'chartGroup' => $chartGroup,
                'productPreset' => $productPreset,
                'productStart' => $productStart->toDateString(),
                'productEnd' => $productEnd->toDateString(),
            ],
            'chartRange' => $chartRange,
            'productRange' => $productRange,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{CarbonImmutable, CarbonImmutable, string}
     */
    private function chartPeriod(string $preset, CarbonImmutable $today, array $validated): array
    {
        if ($preset === 'custom') {
            return [
                $this->parseDate($validated['chart_start']),
                $this->parseDate($validated['chart_end']),
                'Rentang khusus',
            ];
        }

        $start = match ($preset) {
            'week' => $today->subDays(6),
            'year' => $today->subYearNoOverflow()->addDay(),
            default => $today->subDays(29),
        };
        $label = match ($preset) {
            'week' => '7 hari terakhir',
            'year' => '1 tahun terakhir',
            default => '1 bulan terakhir',
        };

        return [$start, $today, $label];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{CarbonImmutable, CarbonImmutable, string}
     */
    private function productPeriod(string $preset, CarbonImmutable $today, array $validated): array
    {
        if ($preset === 'custom') {
            return [
                $this->parseDate($validated['product_start']),
                $this->parseDate($validated['product_end']),
                'Rentang khusus',
            ];
        }

        $start = match ($preset) {
            'week' => $today->startOfWeek(Carbon::MONDAY),
            'year' => $today->startOfYear(),
            default => $today->startOfMonth(),
        };
        $label = match ($preset) {
            'week' => 'Minggu ini',
            'year' => 'Tahun ini',
            default => 'Bulan ini',
        };

        return [$start, $today, $label];
    }

    /**
     * @return array{CarbonImmutable, CarbonImmutable}
     */
    private function previousRange(CarbonImmutable $start, CarbonImmutable $end, string $preset): array
    {
        if ($preset === 'week') {
            return [$start->subWeek(), $end->subWeek()];
        }

        if ($preset === 'month') {
            $previousStart = $start->subMonthNoOverflow();

            return [$previousStart, $end->subMonthNoOverflow()];
        }

        if ($preset === 'year') {
            return [$start->subYearNoOverflow(), $end->subYearNoOverflow()];
        }

        $days = $start->diffInDays($end) + 1;
        $previousEnd = $start->subDay();

        return [$previousEnd->subDays($days - 1), $previousEnd];
    }

    private function parseDate(string $date): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('!Y-m-d', $date, 'UTC');
    }

    private function ensureCurrentOrPast(CarbonImmutable $start, CarbonImmutable $end, string $section): void
    {
        $today = CarbonImmutable::today('UTC');
        if ($start->greaterThan($today) || $end->greaterThan($today)) {
            throw ValidationException::withMessages([
                'date' => "Rentang tanggal {$section} tidak boleh berada di masa depan.",
            ]);
        }
    }
}
