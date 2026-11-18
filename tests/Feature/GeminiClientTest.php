<?php

use App\Exceptions\GeminiApiException;
use App\Services\GeminiClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

test('GeminiClient detects when configured with single or multiple keys', function () {
    config(['services.gemini.api_key' => 'test-key-1']);
    config(['gemini.api_keys' => ['test-key-1', 'test-key-2']]);

    $client = new GeminiClient();
    expect($client->isConfigured())->toBeTrue()
        ->and($client->getApiKey())->toBe('test-key-1')
        ->and($client->getApiKeys())->toContain('test-key-1', 'test-key-2');
});

test('GeminiClient sends request with primary key and returns valid response', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                ['content' => ['parts' => [['text' => '{"title":"Test"}']]]],
            ],
        ], 200),
    ]);

    config(['services.gemini.api_key' => 'primary-key']);
    $client = new GeminiClient();
    $result = $client->generateContent(['contents' => []]);

    expect($result)->toBeArray()
        ->and($result['candidates'][0]['content']['parts'][0]['text'])->toBe('{"title":"Test"}');

    Http::assertSent(fn (Request $request) => $request->hasHeader('x-goog-api-key', 'primary-key'));
});

test('GeminiClient automatically fails over to backup key on rate limit (429)', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::sequence()
            ->push(['error' => ['message' => 'Quota exceeded', 'code' => 429]], 429)
            ->push([
                'candidates' => [
                    ['content' => ['parts' => [['text' => '{"success":true}']]]],
                ],
            ], 200),
    ]);

    config(['services.gemini.api_key' => null]);
    config(['gemini.api_key' => 'key-1']);
    config(['gemini.api_keys' => ['key-1', 'key-2']]);

    $client = new GeminiClient();
    $result = $client->generateContent(['contents' => []]);

    expect($result['candidates'][0]['content']['parts'][0]['text'])->toBe('{"success":true}');
    Http::assertSentCount(2);
});

test('GeminiClient throws descriptive exception when all keys fail', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'error' => ['message' => 'API key invalid', 'code' => 400],
        ], 400),
    ]);

    config(['services.gemini.api_key' => 'invalid-key']);
    $client = new GeminiClient();

    expect(fn () => $client->generateContent(['contents' => []]))
        ->toThrow(GeminiApiException::class);
});
