<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class GeminiApiException extends RuntimeException
{
    public function __construct(string $message, ?Throwable $previous = null, private int $statusCode = 500)
    {
        parent::__construct($message, 0, $previous);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}

