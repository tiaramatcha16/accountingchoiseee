<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesAnalyticsExportService
{
    private const GREEN = '047857';

    private const DARK_GREEN = '064E3B';

    private const PALE_GREEN = 'ECFDF5';

    /**
     * @param  array<string, mixed>  $report
     */
    public function pdf(array $report): Response
    {
        return Pdf::loadView('admin.sales-analytics-pdf', ['report' => $report])
            ->setPaper('a4', 'landscape')
            ->download($this->filename('pdf'));
    }

    /**
     * @param  array<string, mixed>  $report
     */
    public function excel(array $report): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $chart = $report['chart'];
        $products = $report['products'];
        $summary = $spreadsheet->getActiveSheet();
        $summary->setTitle('Ringkasan');
        $summary->getTabColor()->setRGB(self::GREEN);
        $this->writeRow($summary, 1, ['LAPORAN ANALITIK PENJUALAN']);
        $summary->mergeCells('A1:B1');
        $summary->getRowDimension(1)->setRowHeight(34);
        $summary->getStyle('A1:B1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 18, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::DARK_GREEN]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $this->writeRow($summary, 2, ['Dibuat', now('UTC')->format('d/m/Y H:i').' UTC']);
        $summary->mergeCells('A2:B2');
        $summary->getStyle('A2:B2')->applyFromArray([
            'font' => ['italic' => true, 'color' => ['rgb' => '64748B']],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $this->sectionHeading($summary, 3, 'RINGKASAN GRAFIK');
        $this->writeRow($summary, 4, ['Rentang', $chart['label'].' ('.$chart['from'].' s.d. '.$chart['to'].')']);
        $this->writeRow($summary, 5, ['Pengelompokan', $chart['groupLabel']]);
        $this->writeRow($summary, 6, ['Pendapatan', $chart['current']['revenue']]);
        $this->writeRow($summary, 7, ['Pesanan lunas', $chart['current']['orders']]);
        $this->writeRow($summary, 8, ['Unit terjual', $chart['current']['units']]);
        $this->writeRow($summary, 9, ['Periode pembanding', $chart['previousFrom'].' s.d. '.$chart['previousTo']]);
        $this->writeRow($summary, 10, ['Pendapatan pembanding', $chart['previous']['revenue']]);
        $this->sectionHeading($summary, 12, 'PERFORMA TEMPLATE');
        $this->writeRow($summary, 13, ['Rentang', $products['label'].' ('.$products['from'].' s.d. '.$products['to'].')']);
        $this->writeRow($summary, 14, ['Pendapatan', $products['current']['revenue']]);
        $this->writeRow($summary, 15, ['Pesanan lunas', $products['current']['orders']]);
        $this->writeRow($summary, 16, ['Unit terjual', $products['current']['units']]);
        $this->writeRow($summary, 17, ['Periode pembanding', $products['previousFrom'].' s.d. '.$products['previousTo']]);
        $this->writeRow($summary, 18, ['Pendapatan pembanding', $products['previous']['revenue']]);
        $summary->getStyle('A4:A10')->getFont()->setBold(true);
        $summary->getStyle('A13:A18')->getFont()->setBold(true);
        $this->styleDetailRows($summary, 'A4:B10');
        $this->styleDetailRows($summary, 'A13:B18');
        $summary->getStyle('B6')->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $summary->getStyle('B10')->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $summary->getStyle('B14')->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $summary->getStyle('B18')->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $summary->getStyle('B7:B8')->getNumberFormat()->setFormatCode('#,##0');
        $summary->getStyle('B15:B16')->getNumberFormat()->setFormatCode('#,##0');
        $summary->getColumnDimension('A')->setWidth(30);
        $summary->getColumnDimension('B')->setWidth(52);
        $summary->setShowGridlines(false);
        $summary->getPageSetup()->setOrientation('landscape')->setFitToWidth(1)->setFitToHeight(1);
        $summary->getPageSetup()->setFitToPage(true);

        $trendSheet = $spreadsheet->createSheet();
        $trendSheet->setTitle('Tren Pendapatan');
        $trendSheet->getTabColor()->setRGB('0F766E');
        $this->writeRow($trendSheet, 1, ['TREN PENDAPATAN']);
        $trendSheet->mergeCells('A1:E1');
        $this->styleTitle($trendSheet, 'A1:E1');
        $this->writeRow($trendSheet, 2, [
            'Rentang: '.$chart['from'].' s.d. '.$chart['to'].' · Pembanding: '.$chart['previousFrom'].' s.d. '.$chart['previousTo'],
        ]);
        $trendSheet->mergeCells('A2:E2');
        $trendSheet->getStyle('A2:E2')->getFont()->setItalic(true)->getColor()->setRGB('64748B');
        $this->writeRow($trendSheet, 3, ['Periode', 'Pendapatan', 'Pesanan lunas', 'Pendapatan pembanding', 'Pesanan pembanding']);
        $this->styleTableHeader($trendSheet, 'A3:E3');
        foreach ($chart['trend'] as $index => $point) {
            $this->writeRow($trendSheet, $index + 4, [
                $point['label'],
                $point['currentRevenue'],
                $point['currentOrders'],
                $point['previousRevenue'],
                $point['previousOrders'],
            ]);
        }
        $trendLastRow = max(3, count($chart['trend']) + 3);
        $this->styleTableBody($trendSheet, 'A4:E'.$trendLastRow);
        $trendSheet->getStyle('B4:B'.$trendLastRow)->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $trendSheet->getStyle('D4:D'.$trendLastRow)->getNumberFormat()->setFormatCode('"Rp" #,##0');
        $trendSheet->getStyle('C4:C'.$trendLastRow)->getNumberFormat()->setFormatCode('#,##0');
        $trendSheet->getStyle('E4:E'.$trendLastRow)->getNumberFormat()->setFormatCode('#,##0');
        foreach (['A' => 24, 'B' => 24, 'C' => 20, 'D' => 28, 'E' => 24] as $column => $width) {
            $trendSheet->getColumnDimension($column)->setWidth($width);
        }
        $trendSheet->setAutoFilter('A3:E'.$trendLastRow);
        $trendSheet->freezePane('A4');
        $trendSheet->setShowGridlines(false);
        $trendSheet->getPageSetup()->setOrientation('landscape')->setFitToWidth(1);
        $trendSheet->getPageSetup()->setFitToPage(true);

        $productSheet = $spreadsheet->createSheet();
        $productSheet->setTitle('Per Template');
        $productSheet->getTabColor()->setRGB('D97706');
        $this->writeRow($productSheet, 1, ['PERFORMA PENJUALAN PER TEMPLATE']);
        $productSheet->mergeCells('A1:H1');
        $this->styleTitle($productSheet, 'A1:H1');
        $this->writeRow($productSheet, 2, [
            'Rentang: '.$products['from'].' s.d. '.$products['to'].' · Pembanding: '.$products['previousFrom'].' s.d. '.$products['previousTo'],
        ]);
        $productSheet->mergeCells('A2:H2');
        $productSheet->getStyle('A2:H2')->getFont()->setItalic(true)->getColor()->setRGB('64748B');
        $this->writeRow($productSheet, 4, [
            'Template',
            'Kategori',
            'Status',
            'Unit terjual',
            'Unit pembanding',
            'Pendapatan',
            'Pendapatan pembanding',
            'Porsi omzet',
        ]);
        $this->styleTableHeader($productSheet, 'A4:H4');
        if ($products['table']['data'] === []) {
            $this->writeRow($productSheet, 5, ['Belum ada penjualan template pada rentang ini.']);
            $productSheet->mergeCells('A5:H5');
        } else {
            foreach ($products['table']['data'] as $index => $product) {
                $this->writeRow($productSheet, $index + 5, [
                    $product['title'],
                    $product['category'],
                    $product['status'],
                    $product['currentUnits'],
                    $product['previousUnits'],
                    $product['currentRevenue'],
                    $product['previousRevenue'],
                    $product['revenueShare'],
                ]);
            }
        }
        $productLastRow = max(5, count($products['table']['data']) + 4);
        $this->styleTableBody($productSheet, 'A5:H'.$productLastRow);
        if ($products['table']['data'] !== []) {
            $productSheet->getStyle('D5:E'.$productLastRow)->getNumberFormat()->setFormatCode('#,##0');
            $productSheet->getStyle('F5:G'.$productLastRow)->getNumberFormat()->setFormatCode('"Rp" #,##0');
            $productSheet->getStyle('H5:H'.$productLastRow)->getNumberFormat()->setFormatCode('0.0"%"');
        }
        foreach (['A' => 38, 'B' => 24, 'C' => 16, 'D' => 16, 'E' => 18, 'F' => 22, 'G' => 28, 'H' => 18] as $column => $width) {
            $productSheet->getColumnDimension($column)->setWidth($width);
        }
        $productSheet->setAutoFilter('A4:H'.max(4, count($products['table']['data']) + 4));
        $productSheet->freezePane('A5');
        $productSheet->setShowGridlines(false);
        $productSheet->getPageSetup()->setOrientation('landscape')->setFitToWidth(1);
        $productSheet->getPageSetup()->setFitToPage(true);

        return response()->streamDownload(function () use ($spreadsheet) {
            try {
                (new Xlsx($spreadsheet))->save('php://output');
            } finally {
                $spreadsheet->disconnectWorksheets();
            }
        }, $this->filename('xlsx'), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function sectionHeading(Worksheet $sheet, int $row, string $title): void
    {
        $this->writeRow($sheet, $row, [$title]);
        $sheet->mergeCells('A'.$row.':B'.$row);
        $sheet->getRowDimension($row)->setRowHeight(22);
        $sheet->getStyle('A'.$row.':B'.$row)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::GREEN]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
    }

    private function styleTitle(Worksheet $sheet, string $range): void
    {
        $sheet->getRowDimension(1)->setRowHeight(32);
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::DARK_GREEN]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
    }

    private function styleTableHeader(Worksheet $sheet, string $range): void
    {
        [$firstCell] = explode(':', $range);
        $headerRow = (int) preg_replace('/\D/', '', $firstCell);
        $sheet->getRowDimension($headerRow)->setRowHeight(28);
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::GREEN]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => [
                'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::DARK_GREEN]],
            ],
        ]);
    }

    private function styleTableBody(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'bottom' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'DCE7E3']],
            ],
        ]);
        [$start, $end] = explode(':', $range);
        [$startColumn, $startRow] = Coordinate::coordinateFromString($start);
        [$endColumn, $endRow] = Coordinate::coordinateFromString($end);
        if ($endRow < $startRow) {
            return;
        }

        for ($row = $startRow; $row <= $endRow; $row++) {
            if (($row - $startRow) % 2 === 1) {
                $sheet->getStyle($startColumn.$row.':'.$endColumn.$row)
                    ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB(self::PALE_GREEN);
            }
        }
    }

    private function styleDetailRows(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => [
                'bottom' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'DCE7E3']],
            ],
        ]);
    }

    /**
     * @param  list<mixed>  $values
     */
    private function writeRow(Worksheet $sheet, int $row, array $values): void
    {
        foreach ($values as $index => $value) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValueExplicit(
                $column.$row,
                $value,
                is_int($value) || is_float($value) ? DataType::TYPE_NUMERIC : DataType::TYPE_STRING,
            );
        }
    }

    private function filename(string $extension): string
    {
        return 'laporan-penjualan-'.now('UTC')->format('Ymd-His').'.'.$extension;
    }
}
