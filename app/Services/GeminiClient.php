<?php

namespace App\Services;

use App\Exceptions\GeminiApiException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiClient
{
    public function isConfigured(): bool
    {
        return ! empty($this->getApiKeys());
    }

    public function getApiKey(): ?string
    {
        $keys = $this->getApiKeys();

        return $keys[0] ?? null;
    }

    /**
     * @return list<string>
     */
    public function getApiKeys(): array
    {
        $geminiKeys = config('gemini.api_keys');
        $defaultEnvKeys = array_values(array_unique(array_filter([
            env('GEMINI_API_KEY'),
            ...array_map('trim', explode(',', (string) env('GEMINI_API_KEYS', ''))),
        ])));

        // Jika gemini.api_keys disetel khusus secara dinamis (misal pada unit test)
        if (is_array($geminiKeys) && ! empty($geminiKeys) && $geminiKeys !== $defaultEnvKeys) {
            return array_values(array_unique(array_filter(array_map('trim', $geminiKeys))));
        }

        // Jika services.gemini.api_key secara eksplisit disetel null/kosong (misal pada unit test)
        if (config()->has('services.gemini.api_key') && ! filled(config('services.gemini.api_key'))) {
            return [];
        }

        // Jika services.gemini.api_key disetel secara dinamis ke string khusus
        $servicesKey = config('services.gemini.api_key');
        if (filled($servicesKey) && $servicesKey !== env('GEMINI_API_KEY')) {
            return [(string) $servicesKey];
        }

        // Default: ambil dari config gemini.api_keys atau gemini.api_key
        if (is_array($geminiKeys) && ! empty($geminiKeys)) {
            return array_values(array_unique(array_filter(array_map('trim', $geminiKeys))));
        }

        $single = config('gemini.api_key') ?: $servicesKey;

        return filled($single) ? [(string) $single] : [];
    }

    public function getModel(): string
    {
        $servicesModel = config('services.gemini.model');
        if (filled($servicesModel) && $servicesModel !== env('GEMINI_MODEL')) {
            return (string) $servicesModel;
        }

        return (string) (config('gemini.model') ?: $servicesModel ?: 'gemini-flash-lite-latest');
    }

    public function getBaseUrl(): string
    {
        return (string) config('gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta/models');
    }

    public function getTimeout(): int
    {
        return (int) config('gemini.timeout', 45);
    }

    /**
     * Kirim permintaan ke Gemini API dengan dukungan auto-failover ke key cadangan jika terkena limit kuota.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     *
     * @throws GeminiApiException
     */
    public function generateContent(array $payload, ?string $model = null): array
    {
        $keys = $this->getApiKeys();
        if (empty($keys)) {
            throw new GeminiApiException('API key Gemini belum dikonfigurasi di config/gemini.php atau .env.');
        }

        $targetModel = $model ?? $this->getModel();
        $url = rtrim($this->getBaseUrl(), '/').'/'.rawurlencode($targetModel).':generateContent';
        $timeout = $this->getTimeout();

        $lastException = null;
        $lastStatus = 500;
        $lastErrorMessage = '';

        foreach ($keys as $index => $apiKey) {
            try {
                $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                    ->acceptJson()
                    ->connectTimeout(20)
                    ->timeout($timeout)
                    ->post($url, $payload);
            } catch (ConnectionException $exception) {
                $lastException = $exception;
                Log::warning("Koneksi ke Gemini gagal menggunakan key index #{$index}: ".$exception->getMessage());
                continue;
            }

            if ($response->successful()) {
                $json = $response->json();
                if (is_array($json)) {
                    return $json;
                }

                throw new GeminiApiException('Format respon dari Gemini tidak valid.');
            }

            $lastStatus = $response->status();
            $responseData = $response->json();
            $lastErrorMessage = is_array($responseData) && isset($responseData['error']['message'])
                ? $responseData['error']['message']
                : $response->body();

            // Jika kena Rate Limit (429) atau Quota Limit (403), coba key berikutnya jika tersedia
            $isQuotaOrRateLimit = $lastStatus === 429
                || ($lastStatus === 403 && (
                    str_contains($lastErrorMessage, 'quota')
                    || str_contains($lastErrorMessage, 'RESOURCE_EXHAUSTED')
                    || str_contains($lastErrorMessage, 'free tier is not available')
                ));

            if ($isQuotaOrRateLimit && count($keys) > 1 && $index < count($keys) - 1) {
                Log::warning("Gemini API key #{$index} terkena limit ({$lastStatus}), otomatis beralih ke key cadangan berikutnya.");
                continue;
            }

            // Error lain atau key sudah habis
            break;
        }

        $detail = $lastErrorMessage !== '' ? ': '.$lastErrorMessage : '.';

        throw new GeminiApiException("Gemini API gagal memproses permintaan (HTTP {$lastStatus}){$detail}", $lastException, $lastStatus);
    }
}
