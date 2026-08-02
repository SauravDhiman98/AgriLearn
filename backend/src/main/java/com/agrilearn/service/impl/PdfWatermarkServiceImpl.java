package com.agrilearn.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.springframework.stereotype.Service;

import java.awt.geom.AffineTransform;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Slf4j
@Service
public class PdfWatermarkServiceImpl {

    /**
     * Loads a PDF from {@code inputStream}, stamps each page with the user's
     * email and name as a semi-transparent diagonal watermark, and returns the
     * result as a byte array.  If anything fails the original bytes are returned
     * so the user still sees their PDF.
     */
    public byte[] watermark(InputStream inputStream, String userEmail, String userName) {
        try (PDDocument doc = PDDocument.load(inputStream)) {
            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            String line1 = userName  != null && !userName.isBlank()  ? userName  : "";
            String line2 = userEmail != null && !userEmail.isBlank() ? userEmail : "";
            String label = line1.isBlank() ? line2 : line1 + "  |  " + line2;

            for (PDPage page : doc.getPages()) {
                float w = page.getMediaBox().getWidth();
                float h = page.getMediaBox().getHeight();

                PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
                gs.setNonStrokingAlphaConstant(0.12f); // 12% opacity — visible but not intrusive
                gs.setAlphaSourceFlag(true);

                try (PDPageContentStream cs = new PDPageContentStream(
                        doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                    cs.setGraphicsStateParameters(gs);
                    cs.setNonStrokingColor(0.3f, 0.3f, 0.3f); // dark gray

                    float fontSize = 18f;
                    float textWidth;
                    try {
                        textWidth = font.getStringWidth(label) / 1000 * fontSize;
                    } catch (Exception e) {
                        textWidth = 200f;
                    }

                    // Tile the watermark across the page in a diagonal grid
                    float angle  = (float) Math.toRadians(35);
                    float stepX  = textWidth + 60f;
                    float stepY  = 90f;
                    int   cols   = (int) (w / stepX) + 4;
                    int   rows   = (int) (h / stepY) + 4;

                    for (int row = -2; row < rows; row++) {
                        for (int col = -2; col < cols; col++) {
                            float tx = col * stepX + (row % 2 == 0 ? 0 : stepX / 2f);
                            float ty = row * stepY;

                            cs.beginText();
                            cs.setFont(font, fontSize);

                            // Apply rotation around the text origin
                            AffineTransform at = AffineTransform.getTranslateInstance(tx, ty);
                            at.rotate(angle);
                            cs.setTextMatrix(
                                    (float) at.getScaleX(),    (float) at.getShearY(),
                                    (float) at.getShearX(),    (float) at.getScaleY(),
                                    (float) at.getTranslateX(), (float) at.getTranslateY());
                            cs.showText(label);
                            cs.endText();
                        }
                    }
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();

        } catch (Exception e) {
            log.warn("PDF watermarking failed, returning original: {}", e.getMessage());
            // Fall back: re-read and return original bytes
            try {
                return inputStream.readAllBytes();
            } catch (Exception ex) {
                return new byte[0];
            }
        }
    }
}
