package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.ResumeTextExtractionResponse;
import com.resumeanalyzer.exception.FileParseException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class ResumeParserServiceTest {

    private ResumeParserService parserService;
    private FileValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new FileValidationService();
        parserService = new ResumeParserService(validationService);
    }

    @Test
    @DisplayName("Should cleanly normalize excessive whitespace and empty lines")
    void testCleanAndNormalizeText() {
        String dirtyText = "John   Doe\n\n\n\nSoftware   Engineer\r\n\r\nSkills:   Java,   Spring   Boot";
        String normalized = parserService.cleanAndNormalizeText(dirtyText);

        assertEquals("John Doe\n\nSoftware Engineer\n\nSkills: Java, Spring Boot", normalized);
    }

    @Test
    @DisplayName("Should extract text and calculate accurate counts from a valid PDF document")
    void testParseResumePdfSuccessfully() throws IOException {
        String resumeContent = "Alice Smith - Backend Developer - Skills: Java 21, Spring Boot, MySQL, REST APIs";
        byte[] pdfBytes = createSamplePdf(resumeContent);

        MockMultipartFile file = new MockMultipartFile(
                "file", "alice_smith_resume.pdf", "application/pdf", pdfBytes);

        ResumeTextExtractionResponse response = parserService.parseResume(file);

        assertNotNull(response);
        assertEquals("alice_smith_resume.pdf", response.originalFilename());
        assertEquals("application/pdf", response.detectedMimeType());
        assertTrue(response.extractedText().contains("Alice Smith"));
        assertTrue(response.extractedText().contains("Spring Boot"));
        assertTrue(response.wordCount() > 0);
        assertTrue(response.characterCount() > 0);
        assertNotNull(response.previewSnippet());
    }

    @Test
    @DisplayName("Should throw FileParseException when PDF contains no text")
    void testBlankPdfThrowsException() throws IOException {
        byte[] emptyPdfBytes = createBlankPdf();
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty_resume.pdf", "application/pdf", emptyPdfBytes);

        FileParseException ex = assertThrows(FileParseException.class, () -> parserService.parseResume(file));
        assertTrue(ex.getMessage().contains("contains no readable text"));
    }

    private byte[] createSamplePdf(String text) throws IOException {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(PDType1Font.HELVETICA, 12);
                stream.newLineAtOffset(50, 700);
                stream.showText(text);
                stream.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    private byte[] createBlankPdf() throws IOException {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            doc.save(out);
            return out.toByteArray();
        }
    }
}
