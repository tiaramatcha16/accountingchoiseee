<?php

namespace App\Support;

class GoogleSheetsLink
{
    public static function spreadsheetId(string $url): ?string
    {
        $parts = parse_url($url);

        if (
            ! is_array($parts)
            || ($parts['scheme'] ?? null) !== 'https'
            || ($parts['host'] ?? null) !== 'docs.google.com'
            || isset($parts['user'])
            || isset($parts['pass'])
            || (isset($parts['port']) && $parts['port'] !== 443)
        ) {
            return null;
        }

        if (preg_match('~\A/spreadsheets/d/([A-Za-z0-9_-]+)(?:/|\z)~', $parts['path'] ?? '', $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }
}
