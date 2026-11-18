<?php

return [
    'postmark' => ['token' => env('POSTMARK_TOKEN')],
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
    'resend' => ['key' => env('RESEND_KEY')],
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'google_drive' => [
        'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
        'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'api_keys' => array_values(array_unique(array_filter([env('GEMINI_API_KEY'), ...array_map('trim', explode(',', (string) env('GEMINI_API_KEYS', '')))]))),
        'model' => env('GEMINI_MODEL', 'gemini-flash-lite-latest'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'offline_checkout_enabled' => env('CHECKOUT_OFFLINE_MODE', env('APP_ENV') === 'local'),
    ],

];
