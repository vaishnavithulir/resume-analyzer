package com.resumeanalyzer.dto;

public record ResumeTextExtractionResponse(
        String originalFilename,
        String detectedMimeType,
        long fileSizeBytes,
        int wordCount,
        int characterCount,
        String extractedText,
        String previewSnippet
) {
}
