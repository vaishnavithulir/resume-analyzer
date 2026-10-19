package com.resumeanalyzer.service;

import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.exception.UnsupportedFileTypeException;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class FileValidationService {

    private static final Logger log = LoggerFactory.getLogger(FileValidationService.class);

    private final Tika tika = new Tika();

    @Value("${app.upload.max-file-size-bytes:5242880}")
    private long maxFileSizeBytes = 5242880L; // default 5 MB

    @Value("${app.upload.allowed-extensions:pdf,docx,doc}")
    private String allowedExtensionsConfig = "pdf,docx,doc";

    @Value("${app.upload.allowed-mime-types:application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword}")
    private String allowedMimeTypesConfig = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword";

    /**
     * Validates file presence, size, extension, and content magic bytes (MIME type).
     *
     * @param file the uploaded MultipartFile
     * @return the detected MIME type
     */
    public String validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Please select a file to upload. Empty files are not allowed.");
        }

        // 1. File Size Validation
        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileException(String.format(
                    "File size (%d bytes) exceeds maximum allowed limit of %d bytes (5 MB).",
                    file.getSize(), maxFileSizeBytes
            ));
        }

        // 2. Filename Sanitization & Extension Validation
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidFileException("The uploaded file does not have a valid filename.");
        }

        // Path traversal defense
        String sanitizedFilename = Paths.get(originalFilename).getFileName().toString();
        if (sanitizedFilename.contains("..") || sanitizedFilename.contains("/") || sanitizedFilename.contains("\\")) {
            throw new InvalidFileException("The filename contains illegal characters.");
        }

        String extension = getFileExtension(sanitizedFilename);
        List<String> allowedExtensions = Arrays.stream(allowedExtensionsConfig.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();

        if (!allowedExtensions.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new UnsupportedFileTypeException(String.format(
                    "File extension '.%s' is not supported. Please upload a PDF or Word document (.pdf, .docx, .doc).",
                    extension
            ));
        }

        // 3. MIME Type Magic-Byte Inspection (detect real file format regardless of extension)
        String detectedMimeType;
        try (InputStream inputStream = file.getInputStream()) {
            detectedMimeType = tika.detect(inputStream, sanitizedFilename);
        } catch (IOException e) {
            throw new InvalidFileException("Unable to inspect the uploaded file: " + e.getMessage());
        }

        List<String> allowedMimeTypes = Arrays.stream(allowedMimeTypesConfig.split(","))
                .map(String::trim)
                .toList();

        boolean isAllowedMime = allowedMimeTypes.stream().anyMatch(detectedMimeType::equalsIgnoreCase);

        // Also permit standard zip-based openxml fallback if detected as application/x-tika-ooxml
        if (!isAllowedMime && detectedMimeType.contains("wordprocessingml") || detectedMimeType.contains("ooxml")) {
            isAllowedMime = true;
        }

        if (!isAllowedMime) {
            log.warn("MIME type spoofing or mismatch detected for file '{}': detected '{}'", sanitizedFilename, detectedMimeType);
            throw new UnsupportedFileTypeException(String.format(
                    "File content is of type '%s', which does not match allowed resume formats (PDF or Word document).",
                    detectedMimeType
            ));
        }

        return detectedMimeType;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}
