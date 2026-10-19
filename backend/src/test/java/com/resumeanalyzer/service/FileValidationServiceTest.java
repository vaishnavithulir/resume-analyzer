package com.resumeanalyzer.service;

import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.exception.UnsupportedFileTypeException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class FileValidationServiceTest {

    private FileValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new FileValidationService();
        ReflectionTestUtils.setField(validationService, "maxFileSizeBytes", 5242880L);
        ReflectionTestUtils.setField(validationService, "allowedExtensionsConfig", "pdf,docx,doc");
        ReflectionTestUtils.setField(validationService, "allowedMimeTypesConfig",
                "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword");
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file is null or empty")
    void testEmptyFileValidation() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[0]);
        assertThrows(InvalidFileException.class, () -> validationService.validateFile(emptyFile));
        assertThrows(InvalidFileException.class, () -> validationService.validateFile(null));
    }

    @Test
    @DisplayName("Should throw UnsupportedFileTypeException for disallowed file extensions")
    void testDisallowedExtension() {
        MockMultipartFile executable = new MockMultipartFile(
                "file", "malware.exe", "application/octet-stream", "dummy binary content".getBytes());
        UnsupportedFileTypeException ex = assertThrows(
                UnsupportedFileTypeException.class, () -> validationService.validateFile(executable));
        assertTrue(ex.getMessage().contains(".exe"));
    }

    @Test
    @DisplayName("Should detect file spoofing when an executable has a .pdf extension")
    void testFileSpoofingDetection() {
        // Plain text content disguised as a .pdf
        MockMultipartFile spoofedFile = new MockMultipartFile(
                "file", "fake_resume.pdf", "application/pdf", "This is plain ASCII text pretending to be PDF".getBytes());
        UnsupportedFileTypeException ex = assertThrows(
                UnsupportedFileTypeException.class, () -> validationService.validateFile(spoofedFile));
        assertTrue(ex.getMessage().contains("does not match allowed resume formats"));
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file size exceeds maximum limit")
    void testOversizedFile() {
        byte[] largeBytes = new byte[100];
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", largeBytes);
        // Set max limit lower than 100 bytes for test
        ReflectionTestUtils.setField(validationService, "maxFileSizeBytes", 50L);

        InvalidFileException ex = assertThrows(
                InvalidFileException.class, () -> validationService.validateFile(file));
        assertTrue(ex.getMessage().contains("exceeds maximum allowed limit"));
    }

    @Test
    @DisplayName("Should pass validation for a legitimate PDF document")
    void testValidPdfValidation() throws IOException {
        byte[] pdfBytes = createSamplePdf("John Doe - Software Engineer Resume");
        MockMultipartFile validPdf = new MockMultipartFile(
                "file", "john_doe_resume.pdf", "application/pdf", pdfBytes);

        String mimeType = validationService.validateFile(validPdf);
        assertEquals("application/pdf", mimeType);
    }

    private byte[] createSamplePdf(String text) throws IOException {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(PDType1Font.HELVETICA, 12);
                stream.newLineAtOffset(100, 700);
                stream.showText(text);
                stream.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }
}
