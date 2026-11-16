<?php

namespace App\Services;

use App\Exceptions\GoogleDriveCopyException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GoogleDriveAccessTokenService
{
    public function isConfigured(): bool
    {
        return filled(config('services.google_drive.client_id'))
            && filled(config('services.google_drive.client_secret'))
            && filled(config('services.google_drive.refresh_token'));
    }

    public function accessToken(): string
    {
        if (! $this->isConfigured()) {
            throw new GoogleDriveCopyException('Google Drive OAuth credentials are not configured.');
        }

        $cachedToken = Cache::get('google-drive-access-token');
        if (is_string($cachedToken) && $cachedToken !== '') {
            return $cachedToken;
        }

        try {
            $response = Http::asForm()
                ->acceptJson()
                ->timeout(20)
                ->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google_drive.client_id'),
                    'client_secret' => config('services.google_drive.client_secret'),
                    'refresh_token' => config('services.google_drive.refresh_token'),
                    'grant_type' => 'refresh_token',
                ]);
        } catch (ConnectionException $exception) {
            throw new GoogleDriveCopyException('Could not connect to Google OAuth.', $exception);
        }

        $data = $response->json();
        $accessToken = is_array($data) ? ($data['access_token'] ?? null) : null;

        if (! $response->successful() || ! is_string($accessToken) || $accessToken === '') {
            throw new GoogleDriveCopyException('Google OAuth did not return a valid access token (HTTP '.$response->status().').');
        }

        $expiresIn = is_array($data) ? (int) ($data['expires_in'] ?? 3600) : 3600;
        Cache::put('google-drive-access-token', $accessToken, now()->addSeconds(max(60, $expiresIn - 60)));

        return $accessToken;
    }
}
