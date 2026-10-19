package com.resumeanalyzer.exception;

public class FileParseException extends RuntimeException {
    public FileParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
