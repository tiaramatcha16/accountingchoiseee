<?php

namespace App\Services;

use App\Exceptions\GoogleDriveCopyException;
use App\Models\OrderItem;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class GoogleDriveCopyService
{
    private const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

    public function __construct(private GoogleDriveAccessTokenService $tokens) {}

    public function isConfigured(): bool
    {
        return $this->tokens->isConfigured();
    }

    public function createBuyerCopy(OrderItem $item, string $buyerEmail, string $orderNumber): string
    {
        if (! $this->isConfigured()) {
            throw new GoogleDriveCopyException('Google Drive OAuth credentials are not configured.');
        }

        $masterId = $item->google_sheet_id;
        if (! is_string($masterId) || preg_match('/\A[A-Za-z0-9_-]+\z/', $masterId) !== 1) {
            throw new GoogleDriveCopyException('The purchased Google Sheets master ID is invalid.');
        }

        if (is_string($item->delivery_url) && $item->delivery_url !== '' && is_string($item->delivery_file_id) && $item->delivery_file_id !== '') {
            return $item->delivery_url;
        }

        $accessToken = $this->tokens->accessToken();
        $fileId = $item->delivery_file_id;

        if (! is_string($fileId) || $fileId === '') {
            $existingCopy = $this->findExistingCopy($accessToken, $item);
            $file = $existingCopy ?? $this->copyMaster($accessToken, $item, $masterId, $orderNumber);
            $fileId = $file['id'];
            $item->forceFill(['delivery_file_id' => $fileId])->save();
        }

        $deliveryUrl = 'https://docs.google.com/spreadsheets/d/'.$fileId.'/edit';
        $item->forceFill(['delivery_url' => $deliveryUrl])->save();

        $this->ensureBuyerPermission($accessToken, $fileId, $buyerEmail);

        return $deliveryUrl;
    }

    public function validateMaster(string $masterId): void
    {
        if (preg_match('/\A[A-Za-z0-9_-]+\z/', $masterId) !== 1) {
            throw new GoogleDriveCopyException('The purchased Google Sheets master ID is invalid.');
        }

        $this->masterMetadata($this->tokens->accessToken(), $masterId);
    }

    /**
     * @return array{id: string}
     */
    private function findExistingCopy(string $accessToken, OrderItem $item): ?array
    {
        $query = "appProperties has { key='accountingchoice_order_item_id' and value='".$item->id."' } and trashed=false";
        $data = $this->driveRequest(
            fn () => $this->drive($accessToken)->get(self::DRIVE_API_URL.'/files', [
                'q' => $query,
                'spaces' => 'drive',
                'corpora' => 'allDrives',
                'includeItemsFromAllDrives' => 'true',
                'supportsAllDrives' => 'true',
                'pageSize' => 1,
                'fields' => 'files(id)',
            ]),
            'Could not look up an existing Google Sheets copy',
        );

        $fileId = $data['files'][0]['id'] ?? null;

        return is_string($fileId) && $fileId !== '' ? ['id' => $fileId] : null;
    }

    /**
     * @return array{id: string}
     */
    private function copyMaster(string $accessToken, OrderItem $item, string $masterId, string $orderNumber): array
    {
        $this->masterMetadata($accessToken, $masterId);

        $name = mb_substr($item->product_title.' - '.$orderNumber, 0, 180);
        $requestBody = [
            'name' => $name,
            'appProperties' => [
                'accountingchoice_order_item_id' => (string) $item->id,
            ],
        ];

        $folderId = config('services.google_drive.folder_id');
        if (is_string($folderId) && $folderId !== '') {
            $requestBody['parents'] = [$folderId];
        }

        $data = $this->driveRequest(
            fn () => $this->drive($accessToken)->post(
                self::DRIVE_API_URL.'/files/'.rawurlencode($masterId).'/copy?supportsAllDrives=true&ignoreDefaultVisibility=true&fields=id,mimeType',
                $requestBody,
            ),
            'Could not copy the Google Sheets master',
        );

        $fileId = $data['id'] ?? null;
        if (! is_string($fileId) || preg_match('/\A[A-Za-z0-9_-]+\z/', $fileId) !== 1) {
            throw new GoogleDriveCopyException('Google Drive returned an invalid copy ID.');
        }

        if (($data['mimeType'] ?? null) !== 'application/vnd.google-apps.spreadsheet') {
            throw new GoogleDriveCopyException('Google Drive copy is not a Google Sheets spreadsheet.');
        }

        $this->applySecurityRestrictions($accessToken, $fileId);

        return ['id' => $fileId];
    }

    public function applySecurityRestrictions(string $accessToken, string $fileId): void
    {
        try {
            $this->driveRequest(
                fn () => $this->drive($accessToken)->patch(
                    self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'?supportsAllDrives=true',
                    [
                        'copyRequiresWriterPermission' => true,
                        'writersCanShare' => false,
                        'downloadRestrictions' => [
                            'itemDownloadRestriction' => [
                                'restrictedForReaders' => true,
                                'restrictedForWriters' => true,
                            ],
                        ],
                    ],
                ),
                'Could not apply security restrictions to the Google Sheets copy',
            );
        } catch (\Throwable $e) {
            $this->driveRequest(
                fn () => $this->drive($accessToken)->patch(
                    self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'?supportsAllDrives=true',
                    [
                        'copyRequiresWriterPermission' => true,
                        'writersCanShare' => false,
                    ],
                ),
                'Could not apply security restrictions to the Google Sheets copy',
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function masterMetadata(string $accessToken, string $masterId): array
    {
        $metadata = $this->driveRequest(
            fn () => $this->drive($accessToken)->get(self::DRIVE_API_URL.'/files/'.rawurlencode($masterId), [
                'fields' => 'id,mimeType',
                'supportsAllDrives' => 'true',
            ]),
            'Could not access the Google Sheets master',
        );

        if (($metadata['mimeType'] ?? null) !== 'application/vnd.google-apps.spreadsheet') {
            throw new GoogleDriveCopyException('The master link is not a native Google Sheets spreadsheet.');
        }

        return $metadata;
    }

    private function ensureBuyerPermission(string $accessToken, string $fileId, string $buyerEmail): void
    {
        $data = $this->driveRequest(
            fn () => $this->drive($accessToken)->get(
                self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'/permissions',
                ['fields' => 'permissions(id,emailAddress,role,type)', 'supportsAllDrives' => 'true'],
            ),
            'Could not inspect Google Sheets copy permissions',
        );

        $permissions = is_array($data['permissions'] ?? null) ? $data['permissions'] : [];

        foreach ($permissions as $perm) {
            if (($perm['type'] ?? null) === 'anyone' && isset($perm['id'])) {
                try {
                    $this->driveRequest(
                        fn () => $this->drive($accessToken)->delete(
                            self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'/permissions/'.rawurlencode($perm['id']).'?supportsAllDrives=true'
                        ),
                        'Could not remove public link permission',
                    );
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Could not delete anyone permission on {$fileId}: ".$e->getMessage());
                }
            }
        }

        $matchingPermission = collect($permissions)->first(
            fn ($permission) => ($permission['type'] ?? null) === 'user'
                && mb_strtolower((string) ($permission['emailAddress'] ?? '')) === mb_strtolower($buyerEmail),
        );

        if (is_array($matchingPermission) && in_array($matchingPermission['role'] ?? null, ['owner', 'writer'], true)) {
            return;
        }

        if (is_array($matchingPermission) && is_string($matchingPermission['id'] ?? null)) {
            $this->driveRequest(
                fn () => $this->drive($accessToken)->patch(
                    self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'/permissions/'.rawurlencode($matchingPermission['id']).'?supportsAllDrives=true&fields=id,role',
                    ['role' => 'writer'],
                ),
                'Could not grant the buyer edit access to the Google Sheets copy',
            );

            return;
        }

        try {
            $this->driveRequest(
                fn () => $this->drive($accessToken)->post(
                    self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'/permissions?sendNotificationEmail=false&supportsAllDrives=true&fields=id',
                    [
                        'type' => 'user',
                        'role' => 'writer',
                        'emailAddress' => $buyerEmail,
                    ],
                ),
                'Could not share the Google Sheets copy with the buyer',
            );
        } catch (GoogleDriveCopyException $exception) {
            if (str_contains($exception->getMessage(), 'Notify people') || str_contains($exception->getMessage(), 'sendNotificationEmail')) {
                $this->driveRequest(
                    fn () => $this->drive($accessToken)->post(
                        self::DRIVE_API_URL.'/files/'.rawurlencode($fileId).'/permissions?sendNotificationEmail=true&supportsAllDrives=true&fields=id',
                        [
                            'type' => 'user',
                            'role' => 'writer',
                            'emailAddress' => $buyerEmail,
                        ],
                    ),
                    'Could not share the Google Sheets copy with the buyer via invitation',
                );
            } else {
                throw $exception;
            }
        }
    }

    private function drive(string $accessToken): PendingRequest
    {
        return Http::withToken($accessToken)->acceptJson()->timeout(20);
    }

    /**
     * @param  callable(): Response  $request
     * @return array<string, mixed>
     */
    private function driveRequest(callable $request, string $errorMessage): array
    {
        try {
            $response = $request();
        } catch (ConnectionException $exception) {
            throw new GoogleDriveCopyException($errorMessage.'. Could not connect to Google Drive.', $exception);
        }

        $data = $response->json();
        if (! $response->successful() || ! is_array($data)) {
            $details = $data['error']['message'] ?? $response->body();
            throw new GoogleDriveCopyException($errorMessage.' (HTTP '.$response->status().'): '.$details);
        }

        return $data;
    }
}
