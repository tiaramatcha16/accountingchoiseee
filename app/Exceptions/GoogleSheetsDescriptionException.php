<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class GoogleSheetsDescriptionException extends RuntimeException
{
    public function __construct(string $message, ?Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
