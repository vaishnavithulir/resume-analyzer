package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.ResumeTextExtractionResponse;
import com.resumeanalyzer.exception.FileParseException;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    private static final Pattern MULTI_NEWLINE_PATTERN = Pattern.compile("(\r?\n){3,}");
    private static final Pattern MULTI_SPACE_PATTERN = Pattern.compile("[ \t\f]+");
    private static final Pattern WORD_SPLIT_PATTERN = Pattern.compile("\\s+");

    private final Tika tika = new Tika();
    private final FileValidationService fileValidationService;

    public ResumeParserService(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
        // Allow extraction up to 10 MB text buffer
        this.tika.setMaxStringLength(10 * 1024 * 1024);
    }

    /**
     * Validates the uploaded resume and extracts normalized plain text.
     *
     * @param file the uploaded resume file (PDF or DOCX/DOC)
     * @return ResumeTextExtractionResponse containing metadata and cleaned text
     */
    public ResumeTextExtractionResponse parseResume(MultipartFile file) {
        String detectedMimeType = fileValidationService.validateFile(file);
        String rawText;

        try (InputStream is = file.getInputStream()) {
            rawText = tika.parseToString(is);
        } catch (IOException | TikaException e) {
            log.error("Tika failed to parse resume file: {}", file.getOriginalFilename(), e);
            throw new FileParseException("Failed to parse and extract text from the uploaded resume: " + e.getMessage(), e);
        }

        String cleanedText = cleanAndNormalizeText(rawText);

        if (cleanedText.isBlank()) {
            throw new FileParseException(
                    "The uploaded document contains no readable text. If this is a scanned image or image-only PDF, please provide a text-based PDF or DOCX file.",
                    null
            );
        }

        int characterCount = cleanedText.length();
        int wordCount = countWords(cleanedText);
        String previewSnippet = generatePreviewSnippet(cleanedText, 350);

        return new ResumeTextExtractionResponse(
                file.getOriginalFilename(),
                detectedMimeType,
                file.getSize(),
                wordCount,
                characterCount,
                cleanedText,
                previewSnippet
        );
    }

    /**
     * Normalizes line breaks, eliminates excessive vertical whitespace,
     * strips control characters, and standardizes indentation.
     */
    public String cleanAndNormalizeText(String input) {
        if (input == null) {
            return "";
        }

        // Replace carriage returns with standard line feed
        String text = input.replace("\r\n", "\n").replace('\r', '\n');

        // Replace non-breaking spaces and exotic unicode spaces with regular spaces
        text = text.replace('\u00A0', ' ').replace('\u2007', ' ').replace('\u202F', ' ');

        // Strip non-printable ASCII control characters except newline and tab
        text = text.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");

        // Collapse multiple spaces/tabs into a single space on lines
        String[] lines = text.split("\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String trimmedLine = MULTI_SPACE_PATTERN.matcher(line).replaceAll(" ").trim();
            sb.append(trimmedLine).append("\n");
        }

        // Collapse 3 or more consecutive newlines into 2
        String normalized = MULTI_NEWLINE_PATTERN.matcher(sb.toString()).replaceAll("\n\n");

        return normalized.trim();
    }

    private int countWords(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        return WORD_SPLIT_PATTERN.split(text.trim()).length;
    }

    private String generatePreviewSnippet(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        // Trim to maxLength at nearest whitespace
        int cutIndex = text.lastIndexOf(' ', maxLength);
        if (cutIndex <= 0) {
            cutIndex = maxLength;
        }
        return text.substring(0, cutIndex) + "...";
    }
}
